export type EnumLookupEntry = {
    [value: string]: {
        desc: string
        label: string
    }
}

export type EnumLookup = {
    [fieldName: string]: EnumLookupEntry
}

export const ENUM_LOOKUPS: {[tableName: string]: EnumLookup} = {
    'plates': {
        'plateType': {
            'pellet-storage': {
                desc: 'Pellet storage',
                label: 'Pellet storage',
            },
            'lin-primer-storage': {
                desc: 'Linearization primer storage',
                label: 'LIN primer storage',
            },
            'amp-primer-storage': {
                desc: 'Amplification primer storage',
                label: 'AMP primer storage',
            },
            'ha-primer-storage': {
                desc: 'Homology arm primer storage',
                label: 'HA primer storage',
            },
            'ha-puc19-primer-storage': {
                desc: 'Homology arm pUC19 arm primer storage',
                label: 'HA pUC19 primer storage',
            },
            'sg-rna-oligo-storage': {
                desc: 'sgRNA oligo storage',
                label: 'sgRNA oligo storage',
            },
            'sg-rna-oligo': {
                desc: 'sgRNA oligo',
                label: 'sgRNA oligo',
            },
            'sg-rna-plasmid': {
                desc: 'sgRNA plasmid',
                label: 'sgRNA plasmid',
            },
            'lin-pcr': {
                desc: 'Linearization primer PCR',
                label: 'LIN PCR',
            },
            'amp-pcr': {
                desc: 'Amplification primer PCR',
                label: 'AMP PCR',
            },
            'ha-pcr': {
                desc: 'Homology arm primer PCR',
                label: 'HA PCR',
            },
            'preseq-1': {
                desc: 'PreSeq 1',
                label: 'PreSeq 1',
            },
            'preseq-2': {
                desc: 'PreSeq 2',
                label: 'PreSeq 2',
            },
            'preseq-3': {
                desc: 'PreSeq 3',
                label: 'PreSeq 3',
            },
            'snv-lib-preseq-2': {
                desc: 'SNVlib PreSeq 2',
                label: 'SNVlib PreSeq 2',
            },
            'snv-lib-preseq-3': {
                desc: 'SNVlib PreSeq 3',
                label: 'SNVlib PreSeq 3',
            },
            'seq-index': {
                desc: 'Sequencing index plate',
                label: 'Seq index',
            },
            'pcr1-primer-storage': {
                desc: 'PreSeq 1 primer storage',
                label: 'PreSeq 1 primer storage',
            },
            'pcr2-primer-storage': {
                desc: 'PreSeq 2 primer storage',
                label: 'PreSeq 2 primer storage',
            },
            'external-sample-indexing': {
                desc: 'External sample indexing',
                label: 'External sample indexing',
            },
            'ha-pcr-product-storage': {
                desc: 'HA PCR product storage',
                label: 'HA PCR product storage',
            },
            'ha-puc19-pcr-product-storage': {
                desc: 'HA pUC19 PCR product storage',
                label: 'HA pUC19 PCR product storage',
            },
            'ha-puc19-gibson-product-storage': {
                desc: 'HA pUC19 Gibson product storage',
                label: 'HA pUC19 Gibson product storage',
            },
            'ha-puc19-plasmid-storage': {
                desc: 'HA pUC19 plasmid storage',
                label: 'HA pUC19 plasmid storage',
            },
            'snv-lib-amp-product-storage': {
                desc: 'SNVlib AMP product storage',
                label: 'SNVlib AMP product storage',
            },
            'snv-lib-lin-product-storage': {
                desc: 'SNVlib LIN product storage',
                label: 'SNVlib LIN product storage',
            },
            'snv-lib-gibson-product-storage': {
                desc: 'SNVlib Gibson product storage',
                label: 'SNVlib Gibson product storage',
            },
            'snv-lib-plasmid-storage': {
                desc: 'SNVlib plasmid storage',
                label: 'SNVlib plasmid storage',
            },
            'snv-lib-clonal-dna-product-storage': {
                desc: 'SNVlib clonal DNA product storage',
                label: 'SNVlib clonal DNA product storage',
            },
            'snv-lib-golden-gate-product-storage': {
                desc: 'SNVlib Golden Gate product storage',
                label: 'SNVlib Golden Gate product storage',
            },
        },
    },
    'pcrExperiments': {
        'pcrType': {
            'lin-pcr': {
                desc: 'Linearization primer PCR',
                label: 'LIN PCR',
            },
            'amp-pcr': {
                desc: 'Amplification primer PCR',
                label: 'AMP PCR',
            },
            'ha-pcr': {
                desc: 'Homology arm primer PCR',
                label: 'HA PCR',
            },
            'preseq-1': {
                desc: 'PreSeq 1',
                label: 'PreSeq 1',
            },
            'preseq-2': {
                desc: 'PreSeq 2',
                label: 'PreSeq 2',
            },
            'preseq-3': {
                desc: 'PreSeq 3',
                label: 'PreSeq 3',
            },
            'snv-lib-preseq-2': {
                desc: 'SNVlib PreSeq 2',
                label: 'SNVlib PreSeq 2',
            },
            'snv-lib-preseq-3': {
                desc: 'SNVlib PreSeq 3',
                label: 'SNVlib PreSeq 3',
            },
        },
    },
    'plasmidExperiments': {
        'experimentType': {
            'sg-rna': {
                desc: 'sgRNA cloning',
                label: 'sgRNA cloning',
            },
            'snv-lib': {
                desc: 'SNVlib cloning',
                label: 'SNVlib cloning',
            },
        },
    },
} as const
