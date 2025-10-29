# Target TSV to SQL Converter

This script converts target TSV files from the SGE pipeline repository into SQL statements for the targets table.

## Usage

```bash
node scripts/convert-targets-tsv.js <tsv-file-path> [gene-symbol] [--output insert|update]
```

### Arguments

- `<tsv-file-path>`: Path to the TSV file (local file or URL)
- `[gene-symbol]`: Gene symbol (optional, will be auto-detected from filename if not provided)

### Options

- `--output insert`: Generate INSERT statements with UPSERT logic (INSERT ... ON CONFLICT DO UPDATE)
- `--output update`: Generate UPDATE statements (default behavior)

## Run tests

```bash
node scripts/test-convert-targets.js
```

## Examples

### Basic usage with local file
```bash
node scripts/convert-targets-tsv.js BARD1.targets.tsv BARD1
```

### Using remote file with INSERT statements
```bash
node scripts/convert-targets-tsv.js https://raw.githubusercontent.com/bbi-lab/sge-pipeline/main/etc/BARD1.targets.tsv BARD1 --output insert
```

### Using local file with INSERT statements
```bash
node scripts/convert-targets-tsv.js BARD1.targets.tsv BARD1 --output insert
```

### Auto-detect gene symbol from filename
```bash
node scripts/convert-targets-tsv.js BARD1.targets.tsv --output insert
```

## TSV File Format

The script expects TSV files with the following columns:

- `target`: Target name (e.g., "BARD1_X1A")
- `chrom`: Chromosome (e.g., "chr2")
- `editstart`: Start position of edit region (1-based)
- `editstop`: End position of edit region (1-based)
- `ampstart`: Start position of amplicon (1-based)
- `ampstop`: End position of amplicon (1-based)
- `required_edits`: Comma-separated list of required edits (e.g., "214809582C,214809540G")
- `cigar`: CIGAR string (e.g., "198M")
- `skip_pos`: Comma-separated list of positions to skip (optional)

## Output

The script generates SQL statements that can be executed against your database:

### UPDATE Mode (default)
Updates existing targets with the data from the TSV file. Requires targets to already exist in the database.

### INSERT Mode (--output insert)
Inserts new targets or updates existing ones using UPSERT logic (INSERT ... ON CONFLICT DO UPDATE).

## Data Transformations

1. **Required Edits**: Converted from format `1234321G` to HGVS format `g.1234321A>G` using the UCSC Genome API to fetch actual reference bases
2. **Skip Positions**: Converted from comma-separated string to PostgreSQL integer array
3. **Target Names**: Used as-is from the TSV file
4. **Coordinates**: 1-based positions are preserved as-is

## UCSC Genome API Integration

The script now automatically fetches reference bases from the UCSC Genome API (hg38 assembly) to create accurate HGVS notation:

- Makes API calls to `https://api.genome.ucsc.edu/getData/sequence`
- Includes rate limiting (100ms delay between requests) to be respectful to the API
- Falls back to 'N' if the API is unavailable or returns an error
- Provides warning messages when fallback is used

## Prerequisites

- Node.js (with ES modules support)
- Internet connection for UCSC Genome API access (for accurate HGVS conversion)
- Access to the SGE pipeline TSV files (local or remote)
- Database with the targets table schema

## Notes

- The script assumes that regions and genes already exist in the database
- For UPDATE mode, targets must already exist with matching names
- For INSERT mode, the script will create new targets or update existing ones
- The script uses the UCSC Genome API to fetch accurate reference bases for HGVS notation
- If the UCSC API is unavailable, the script falls back to using 'N' as the reference base
- The script includes rate limiting to be respectful to the UCSC API (100ms delay between requests)
