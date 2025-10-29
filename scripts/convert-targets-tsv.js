#!/usr/bin/env node

/**
 * Standalone script to convert target TSV files from the SGE pipeline
 * into SQL update statements for the targets table.
 *
 * Usage: node convert-targets-tsv.js <tsv-file-path> [gene-symbol]
 *
 * Example:
 *   node convert-targets-tsv.js BARD1.targets.tsv BARD1
 *   node convert-targets-tsv.js https://raw.githubusercontent.com/bbi-lab/sge-pipeline/main/etc/BARD1.targets.tsv BARD1
 */

import fs from 'fs';
import https from 'https';
import path from 'path';

// Function to fetch file content (local or remote)
function fetchFileContent(filePath) {
    return new Promise((resolve, reject) => {
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            // Fetch from URL
            https.get(filePath, (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    resolve(data);
                });
            }).on('error', (err) => {
                reject(err);
            });
        } else {
            // Read from local file
            try {
                const data = fs.readFileSync(filePath, 'utf8');
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    });
}

// Function to parse TSV content
function parseTSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split('\t');
    const rows = lines.slice(1).map(line => {
        const values = line.split('\t');
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || null;
        });
        return row;
    });
    return rows;
}

// Function to fetch reference sequence from UCSC API
async function fetchReferenceSequence(chromosome, position) {
    return new Promise((resolve, reject) => {
        const url = `https://api.genome.ucsc.edu/getData/sequence?genome=hg38;chrom=${chromosome};start=${position - 1};end=${position}`;

        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.dna) {
                        resolve(result.dna.toUpperCase());
                    } else {
                        console.warn(`Warning: Could not fetch reference for ${chromosome}:${position}, using 'N'`);
                        resolve('N');
                    }
                } catch (err) {
                    console.warn(`Warning: Error parsing UCSC response for ${chromosome}:${position}, using 'N'`);
                    resolve('N');
                }
            });
        }).on('error', (err) => {
            console.warn(`Warning: UCSC API error for ${chromosome}:${position}, using 'N'`);
            resolve('N');
        });
    });
}

// Function to add delay between API calls to avoid rate limiting
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to convert required_edits to HGVS format
async function convertRequiredEditsToHGVS(requiredEdits, chromosome) {
    if (!requiredEdits) return [];

    const edits = requiredEdits.split(',');
    const results = [];

    for (let i = 0; i < edits.length; i++) {
        const edit = edits[i];

        // Add delay between API calls to be respectful to UCSC API (100ms delay)
        if (i > 0) {
            await delay(100);
        }

        // Format: 1234321G -> g.1234321A>G (looking up reference from UCSC)
        const match = edit.match(/^(\d+)([ACGT])$/);
        if (match) {
            const [, position, allele] = match;
            try {
                const referenceBase = await fetchReferenceSequence(chromosome, parseInt(position));
                results.push(`g.${position}${referenceBase}>${allele}`);
            } catch (err) {
                console.warn(`Warning: Failed to fetch reference for ${chromosome}:${position}, using 'N'`);
                results.push(`g.${position}N>${allele}`);
            }
        } else {
            results.push(edit); // Return as-is if format doesn't match
        }
    }

    return results;
}

// Function to convert skip_pos to array
function convertSkipPositions(skipPos) {
    if (!skipPos) return [];
    return skipPos.split(',').map(pos => parseInt(pos.trim()));
}

// Function to generate SQL UPDATE statement
async function generateSQL(row, geneSymbol) {
    const hgvsEdits = await convertRequiredEditsToHGVS(row.required_edits, row.chrom);
    const skipPositions = convertSkipPositions(row.skip_pos);

    return `UPDATE targets
SET
    edit_start = ${row.editstart},
    edit_stop = ${row.editstop},
    amp_start = ${row.ampstart},
    amp_stop = ${row.ampstop},
    cigar = '${row.cigar || ''}',
    ${skipPositions.length > 0 ? `skip_positions = ARRAY[${skipPositions.join(', ')}],` : 'skip_positions = NULL,'}
    fixed_edits = ARRAY['${hgvsEdits.join("', '")}']
WHERE name = '${row.target}'
    AND region_id IN (
        SELECT r.id FROM regions r
        JOIN genes g ON r.gene_id = g.id
        WHERE g.symbol = '${geneSymbol}'
        AND g.chromosome = '${row.chrom}'
    );`;
}

// Function to generate SQL INSERT statement
async function generateInsertSQL(row, geneSymbol) {
    const hgvsEdits = await convertRequiredEditsToHGVS(row.required_edits, row.chrom);
    const skipPositions = convertSkipPositions(row.skip_pos);

    return `INSERT INTO targets (
    name,
    region_id,
    edit_start,
    edit_stop,
    amp_start,
    amp_stop,
    cigar,
    skip_positions,
    fixed_edits
) VALUES (
    '${row.target}',
    (SELECT r.id FROM regions r
     JOIN genes g ON r.gene_id = g.id
     WHERE g.symbol = '${geneSymbol}'
     AND g.chromosome = '${row.chrom}'
     LIMIT 1),
    ${row.editstart},
    ${row.editstop},
    ${row.ampstart},
    ${row.ampstop},
    '${row.cigar || ''}',
    ${skipPositions.length > 0 ? `ARRAY[${skipPositions.join(', ')}]::integer[]` : 'NULL'},
    ARRAY['${hgvsEdits.join("', '")}']
) ON CONFLICT (name) DO UPDATE SET
    edit_start = EXCLUDED.edit_start,
    edit_stop = EXCLUDED.edit_stop,
    amp_start = EXCLUDED.amp_start,
    amp_stop = EXCLUDED.amp_stop,
    cigar = EXCLUDED.cigar,
    skip_positions = EXCLUDED.skip_positions,
    fixed_edits = EXCLUDED.fixed_edits;`;
}

// Function to fetch TSV from URL
async function fetchTSVFromURL(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Main function to process command line arguments
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error('Usage: node convert-targets-tsv.js <tsv-file-path> [gene-symbol] [--output insert|update]');
        console.error('');
        console.error('Examples:');
        console.error('  node convert-targets-tsv.js targets.tsv BARD1');
        console.error('  node convert-targets-tsv.js targets.tsv BARD1 --output insert');
        console.error('  node convert-targets-tsv.js https://example.com/targets.tsv BARD1');
        process.exit(1);
    }

    const filePath = args[0];
    let geneSymbol = args[1];

    // Check for --output flag
    const outputIndex = args.indexOf('--output');
    let useInsert = false;

    if (outputIndex !== -1 && args[outputIndex + 1]) {
        const outputType = args[outputIndex + 1].toLowerCase();
        if (outputType === 'insert') {
            useInsert = true;
        } else if (outputType === 'update') {
            useInsert = false;
        } else {
            console.error('Error: --output must be either "insert" or "update"');
            process.exit(1);
        }
    }

    // If gene symbol not provided, try to infer from filename
    if (!geneSymbol) {
        const filename = path.basename(filePath);
        const match = filename.match(/([A-Z][A-Z0-9]+)/);
        if (match) {
            geneSymbol = match[1];
            console.log(`-- Inferred gene symbol: ${geneSymbol}`);
        } else {
            console.error('Error: Could not determine gene symbol. Please provide it as the second argument.');
            process.exit(1);
        }
    }

    try {
        console.log(`-- Converting targets from ${filePath} for gene ${geneSymbol}`);
        console.log(`-- Using ${useInsert ? 'INSERT' : 'UPDATE'} statements`);
        console.log('');

        const content = await fetchFileContent(filePath);
        const rows = parseTSV(content);

        console.log('-- Generated SQL statements:');
        console.log('');

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const sql = useInsert
                ? await generateInsertSQL(row, geneSymbol)
                : await generateSQL(row, geneSymbol);

            console.log(`-- Target ${i + 1}: ${row.target}`);
            console.log(sql);
            console.log('');
        }

        console.log(`-- Processed ${rows.length} targets for gene ${geneSymbol}`);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

// Export functions for use as a module
export {
    fetchFileContent,
    parseTSV,
    convertRequiredEditsToHGVS,
    convertSkipPositions,
    generateSQL,
    generateInsertSQL,
    fetchTSVFromURL
};
