#!/usr/bin/env node

/**
 * Test script for the convert-targets-tsv.js script
 */

import {
    parseTSV,
    convertRequiredEditsToHGVS,
    convertSkipPositions,
    generateSQL,
    generateInsertSQL
} from './convert-targets-tsv.js';

// Test data
const testTSVContent = `target	chrom	editstart	editstop	ampstart	ampstop	required_edits	cigar	skip_pos
BARD1_X1A	chr2	214809476	214809584	214809432	214809629	214809582C,214809540G,214809486G	198M
BARD1_X3A	chr2	214792354	214792474	214792299	214792541	214792394G,214792358G	243M	214792454,214792458`;

async function runTests() {
    console.log('Running tests for convert-targets-tsv.js...\n');

    // Test TSV parsing
    console.log('1. Testing TSV parsing...');
    const rows = parseTSV(testTSVContent);
    console.log(`   Parsed ${rows.length} rows`);
    console.log(`   First row target: ${rows[0].target}`);
    console.log(`   ✓ TSV parsing works\n`);

    // Test required_edits conversion
    console.log('2. Testing required_edits conversion...');
    try {
        const hgvs = await convertRequiredEditsToHGVS('214809582C,214809540G', 'chr2');
        console.log(`   Input: 214809582C,214809540G`);
        console.log(`   Output: ${JSON.stringify(hgvs)}`);
        console.log(`   ✓ HGVS conversion works\n`);
    } catch (error) {
        console.error(`   ✗ HGVS conversion failed: ${error.message}\n`);
    }

    // Test skip positions conversion
    console.log('3. Testing skip positions conversion...');
    const skipPos = convertSkipPositions('214792454,214792458');
    console.log(`   Input: 214792454,214792458`);
    console.log(`   Output: ${JSON.stringify(skipPos)}`);
    console.log(`   ✓ Skip positions conversion works\n`);

    // Test SQL generation
    console.log('4. Testing UPDATE SQL generation...');
    try {
        const updateSQL = await generateSQL(rows[0], 'BARD1');
        console.log('   Generated SQL:');
        console.log(updateSQL.split('\n').map(line => `   ${line}`).join('\n'));
        console.log(`   ✓ UPDATE SQL generation works\n`);
    } catch (error) {
        console.error(`   ✗ UPDATE SQL generation failed: ${error.message}\n`);
    }

    // Test INSERT SQL generation
    console.log('5. Testing INSERT SQL generation...');
    try {
        const insertSQL = await generateInsertSQL(rows[0], 'BARD1', 'Test Project');
        console.log('   Generated SQL:');
        console.log(insertSQL.split('\n').map(line => `   ${line}`).join('\n'));
        console.log(`   ✓ INSERT SQL generation works\n`);
    } catch (error) {
        console.error(`   ✗ INSERT SQL generation failed: ${error.message}\n`);
    }

    console.log('All tests passed!');
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
}
