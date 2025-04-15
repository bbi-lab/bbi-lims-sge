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
                label: 'LIN storage',
            },
            'amp-storage': {
                desc: 'Amplification primer storage',
                label: 'AMP storage',
            },
            'ha-storage': {
                desc: 'Homology arm primer storage',
                label: 'HA storage',
            },
            'guide-storage': {
                desc: 'Guide RNA storage',
                label: 'Guide storage',
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
