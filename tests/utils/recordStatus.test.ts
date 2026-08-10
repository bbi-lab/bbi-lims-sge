import { describe, expect, it } from 'vitest'
import { recordStatusLabel, recordStatusTag } from '~/utils/recordStatus'

describe('recordStatusLabel', () => {
    it('resolves the label for a bare enum value', () => {
        expect(recordStatusLabel('next-step-ready')).toBe('Next step ready')
    })

    it('resolves the label for an expanded enum object', () => {
        expect(recordStatusLabel({ value: 'on-hold', label: 'On hold', desc: 'On hold' })).toBe('On hold')
    })

    it('returns an empty string for an unset status', () => {
        expect(recordStatusLabel(null)).toBe('')
        expect(recordStatusLabel(undefined)).toBe('')
    })

    it('returns an empty string for a value with no lookup entry', () => {
        expect(recordStatusLabel('retired-value')).toBe('')
    })

    // QuickTable rewrites a column that has a format function to {originalValue, displayValue}, so
    // the element/export/search callbacks see this shape rather than the raw value
    it('resolves the label after QuickTable has rewritten the column', () => {
        expect(recordStatusLabel({ originalValue: 'complete', displayValue: 'Complete' })).toBe('Complete')
    })
})

describe('recordStatusTag', () => {
    it('renders a tag carrying the label and the status colour', () => {
        const tag = recordStatusTag('complete')
        expect(tag).toContain('>Complete<')
        expect(tag).toContain('bg-emerald-100')
        expect(tag).toContain('rounded-full')
    })

    it('gives each status a distinct colour', () => {
        const colors = ['not-started', 'in-progress', 'on-hold', 'next-step-ready', 'complete', 'discarded']
            .map((s) => (recordStatusTag(s).match(/bg-([a-z]+)-100/) ?? [])[1])
        expect(colors).toEqual(['slate', 'blue', 'amber', 'violet', 'emerald', 'red'])
        expect(new Set(colors).size).toBe(6)
    })

    it('renders the same tag for every shape a status arrives in', () => {
        const expected = recordStatusTag('on-hold')
        expect(recordStatusTag({ value: 'on-hold', label: 'On hold', desc: 'On hold' })).toBe(expected)
        expect(recordStatusTag({ originalValue: 'on-hold', displayValue: 'On hold' })).toBe(expected)
    })

    it('renders nothing for an unset or unknown status', () => {
        expect(recordStatusTag(null)).toBe('')
        expect(recordStatusTag({ originalValue: null, displayValue: '' })).toBe('')
        expect(recordStatusTag('retired-value')).toBe('')
    })
})
