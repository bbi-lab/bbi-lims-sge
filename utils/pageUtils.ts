import _ from 'lodash'
import { wellCoordinateToChar } from '~/lib/plate-diagram'

type QueryParamValue = string | null | (string | null)[]
type QueryParams = Record<string, QueryParamValue>

const ARRAY_NOTATION_REGEX = /^(.+?)\[\]\.(.+)$/

/**
 * Converts URL query parameters into a JSONLogic where clause.
 *
 * Supported query param formats:
 * - Simple equality: `?key=value` → `{"==": [{"var": "key"}, "value"]}`
 * - Multiple values (same key): `?key=v1&key=v2` → `{"in": [{"var": "key"}, ["v1", "v2"]]}`
 * - Array element match: `?arrayField[].nestedKey=value`
 *     → `{"some": [{"var": "arrayField"}, {"==": [{"var": "nestedKey"}, "value"]}]}`
 * - Array element match (multiple values): `?arrayField[].nestedKey=v1&arrayField[].nestedKey=v2`
 *     → `{"some": [{"var": "arrayField"}, {"in": [{"var": "nestedKey"}, ["v1", "v2"]]}]}`
 *
 * Multiple distinct filters are combined with "and".
 * Returns undefined if no valid filters can be constructed.
 */
export function queryParamsToJsonLogic(queryParams: QueryParams): object | object[] | undefined {
    if (_.isEmpty(queryParams)) return undefined

    const filters: object[] = []

    _.forEach(queryParams, (val, key) => {
        if (val === null || val === undefined) return

        const arrayMatch = key.match(ARRAY_NOTATION_REGEX)

        if (arrayMatch) {
            const [, arrayField, nestedKey] = arrayMatch
            if (Array.isArray(val)) {
                const values = val.filter((v): v is string => v !== null)
                if (values.length > 0) {
                    filters.push({
                        "some": [{"var": arrayField}, {"in": [{"var": nestedKey}, values]}]
                    })
                }
            } else {
                filters.push({
                    "some": [{"var": arrayField}, {"==": [{"var": nestedKey}, val]}]
                })
            }
        } else {
            if (Array.isArray(val)) {
                const values = val.filter((v): v is string => v !== null)
                if (values.length === 1) {
                    filters.push({"==": [{"var": key}, values[0]]})
                } else if (values.length > 1) {
                    filters.push({"in": [{"var": key}, values]})
                }
            } else {
                filters.push({"==": [{"var": key}, val]})
            }
        }
    })

    if (filters.length === 0) return undefined
    return filters.length > 1 ? {"and": filters} : filters
}

/**
 * Extracts simple (non-array-notation) query parameters for use as readonly form values.
 * Strips out array notation params (e.g. `arrayField[].nestedKey`) since they don't
 * correspond to direct form fields.
 */
export function getSimpleQueryParams(queryParams: QueryParams): Record<string, any> {
    return _.pickBy(queryParams, (_val, key) => !ARRAY_NOTATION_REGEX.test(key)) as Record<string, any>
}

export const combinedWellLocations = <T extends boolean>(x: any, options: {asDict?: T, excludePlateIds?: string[], includePlateIds?: string[]} = {}): T extends true ? Record<string, string> : string => {
    const wellContents = x?.wellable?.wellContents || []

    // Group well contents by plate
    const contentsByPlate = _.groupBy(wellContents, (wellContent) => wellContent.well.plate.id)

    // filter based on include/exclude plate ids if provided
    const filteredContentsByPlate = _.pickBy(contentsByPlate, (contents, plateId) => {
        if (options.includePlateIds) {
            return options.includePlateIds.includes(plateId)
        }
        if (options.excludePlateIds) {
            return !options.excludePlateIds.includes(plateId)
        }
        return true
    })

    const result: Record<string, string> = {}

    _.forEach(filteredContentsByPlate, (plateWellContents, plateId) => {
        const plateName = plateWellContents[0]?.well?.plate?.name || `Plate ${plateId}`

        // Extract well coordinates for this plate
        const wellCoordinates = _.map(plateWellContents, (wellContent) => {
            return {x: wellContent.well.x, y: wellContent.well.y}
        })

        // Group by X coordinate and find Y ranges
        const contentsGroupedByX = _.groupBy(wellCoordinates, 'x')
        const yRanges = _.mapValues(contentsGroupedByX, (coordinates) => {
            const sortedByY = _.sortBy(coordinates, 'y')
            const consecutiveYRanges = _.reduce(sortedByY, (acc, coordinate) => {
                if (acc.length === 0 || acc[acc.length - 1].maxY + 1 < coordinate.y) {
                    acc.push({ x: coordinate.x, minY: coordinate.y, maxY: coordinate.y })
                } else {
                    acc[acc.length - 1].maxY = Math.max(acc[acc.length - 1].maxY, coordinate.y)
                }
                return acc
            }, [] as Array<{ x: number; minY: number; maxY: number }>)
            return consecutiveYRanges
        })

        // Format well coordinate ranges for this plate
        const wellLocationString = _.map(_.flatten(_.values(yRanges)), (val) => {
            return val.minY == val.maxY ? `${wellCoordinateToChar(val.minY)}${val.x}` : `${wellCoordinateToChar(val.minY)}${val.x}-${wellCoordinateToChar(val.maxY)}${val.x}`
        }).join(', ')

        result[plateName] = wellLocationString
    })

    return (options.asDict ? result : _.join(_.map(result, (val, key) => `${key}: ${val}`), '; ')) as any
}
