import { describe, expect, it } from 'vitest'
import { queryParamsToJsonLogic, getSimpleQueryParams } from '~/utils/pageUtils'

describe('queryParamsToJsonLogic', () => {
    it('returns undefined for empty params', () => {
        expect(queryParamsToJsonLogic({})).toBeUndefined()
    })

    it('returns undefined when all values are null', () => {
        expect(queryParamsToJsonLogic({ key: null })).toBeUndefined()
    })

    it('creates simple equality filter for a single param', () => {
        const result = queryParamsToJsonLogic({ targetId: 'abc-123' })
        expect(result).toEqual([{ "==": [{ "var": "targetId" }, "abc-123"] }])
    })

    it('combines multiple params with "and"', () => {
        const result = queryParamsToJsonLogic({ name: 'test', status: 'active' })
        expect(result).toEqual({
            "and": [
                { "==": [{ "var": "name" }, "test"] },
                { "==": [{ "var": "status" }, "active"] },
            ]
        })
    })

    it('creates "some" filter for array notation with single value', () => {
        const result = queryParamsToJsonLogic({
            'sgRnaPlasmidTargets[].targetId': 'e3c118a2-9f52-449a-a5cf-148b93dfdd58'
        })
        expect(result).toEqual([{
            "some": [
                { "var": "sgRnaPlasmidTargets" },
                { "==": [{ "var": "targetId" }, "e3c118a2-9f52-449a-a5cf-148b93dfdd58"] }
            ]
        }])
    })

    it('creates "some" + "in" filter for array notation with multiple values', () => {
        const result = queryParamsToJsonLogic({
            'sgRnaPlasmidTargets[].targetId': ['uuid-1', 'uuid-2']
        })
        expect(result).toEqual([{
            "some": [
                { "var": "sgRnaPlasmidTargets" },
                { "in": [{ "var": "targetId" }, ["uuid-1", "uuid-2"]] }
            ]
        }])
    })

    it('creates "in" filter for simple param with multiple values', () => {
        const result = queryParamsToJsonLogic({
            plateType: ['preseq-2', 'seq-index']
        })
        expect(result).toEqual([{
            "in": [{ "var": "plateType" }, ["preseq-2", "seq-index"]]
        }])
    })

    it('filters out null values from multi-value arrays', () => {
        const result = queryParamsToJsonLogic({
            plateType: [null, 'preseq-2']
        })
        expect(result).toEqual([{
            "==": [{ "var": "plateType" }, "preseq-2"]
        }])
    })

    it('skips array params where all values are null', () => {
        const result = queryParamsToJsonLogic({
            key: [null, null]
        })
        expect(result).toBeUndefined()
    })

    it('handles nested dot paths in array notation', () => {
        const result = queryParamsToJsonLogic({
            'items[].nested.field': 'value'
        })
        expect(result).toEqual([{
            "some": [
                { "var": "items" },
                { "==": [{ "var": "nested.field" }, "value"] }
            ]
        }])
    })

    it('handles deep array field paths', () => {
        const result = queryParamsToJsonLogic({
            'parent.children[].id': 'abc'
        })
        expect(result).toEqual([{
            "some": [
                { "var": "parent.children" },
                { "==": [{ "var": "id" }, "abc"] }
            ]
        }])
    })

    it('combines simple and array notation params', () => {
        const result = queryParamsToJsonLogic({
            status: 'active',
            'sgRnaPlasmidTargets[].targetId': 'uuid-1'
        })
        expect(result).toEqual({
            "and": [
                { "==": [{ "var": "status" }, "active"] },
                { "some": [
                    { "var": "sgRnaPlasmidTargets" },
                    { "==": [{ "var": "targetId" }, "uuid-1"] }
                ]}
            ]
        })
    })
})

describe('getSimpleQueryParams', () => {
    it('returns all params when none use array notation', () => {
        const params = { name: 'test', id: 'abc' }
        expect(getSimpleQueryParams(params)).toEqual(params)
    })

    it('strips array notation params', () => {
        const result = getSimpleQueryParams({
            status: 'active',
            'sgRnaPlasmidTargets[].targetId': 'uuid-1'
        })
        expect(result).toEqual({ status: 'active' })
    })

    it('returns empty object when all params use array notation', () => {
        const result = getSimpleQueryParams({
            'items[].id': 'abc'
        })
        expect(result).toEqual({})
    })
})
