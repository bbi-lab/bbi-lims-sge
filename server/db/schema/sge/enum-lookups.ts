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
            'pcr-1': {
                desc: 'PCR 1',
                label: 'PCR 1',
            },
            'pcr-2': {
                desc: 'PCR 2',
                label: 'PCR 2',
            },
            'pcr-3': {
                desc: 'PCR 3',
                label: 'PCR 3',
            },
        },
    },
} as const
