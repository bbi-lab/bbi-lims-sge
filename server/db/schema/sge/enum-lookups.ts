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
            'lin-storage': {
                desc: 'Linearization primer storage',
                label: 'LIN primer storage',
            },
            'amp-storage': {
                desc: 'Amplification primer storage',
                label: 'AMP primer storage',
            },
            'ha-storage': {
                desc: 'Homology arm primer storage',
                label: 'HA primer storage',
            },
            'guide-rna-storage': {
                desc: 'Guide RNA storage',
                label: 'Guide RNA storage',
            },
            'guide-rna': {
                desc: 'Guide RNA',
                label: 'Guide RNA',
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
                desc: 'SNV-lib PreSeq 2',
                label: 'SNV-lib PreSeq 2',
            },
            'snv-lib-preseq-3': {
                desc: 'SNV-lib PreSeq 3',
                label: 'SNV-lib PreSeq 3',
            },
            'seq-index': {
                desc: 'Sequencing index plate',
                label: 'Seq index',
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
                desc: 'SNV-lib PreSeq 2',
                label: 'SNV-lib PreSeq 2',
            },
            'snv-lib-preseq-3': {
                desc: 'SNV-lib PreSeq 3',
                label: 'SNV-lib PreSeq 3',
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
                desc: 'SNV-lib cloning',
                label: 'SNV-lib cloning',
            },
        },
    },
} as const
