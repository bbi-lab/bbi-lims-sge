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
        },
    },
} as const
