import _ from 'lodash'
import { RECORD_STATUSES } from '~/server/db/schema/sge/enum-lookups'

// The tag classes are spelled out per colour rather than interpolated from the palette name, because
// Tailwind only emits classes it finds literally in a file it scans. tailwind.config.js includes
// ./utils/**/*.ts for this reason; a `bg-${color}-100` template would be purged.
// no text size class, so the tag inherits the table's font size like every other column
const TAG_BASE = 'inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 font-medium ring-1 ring-inset'

const TAG_COLORS: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-400/15 dark:text-slate-300 dark:ring-slate-400/30',
    blue: 'bg-blue-100 text-blue-800 ring-blue-300 dark:bg-blue-400/15 dark:text-blue-300 dark:ring-blue-400/30',
    amber: 'bg-amber-100 text-amber-800 ring-amber-300 dark:bg-amber-400/15 dark:text-amber-300 dark:ring-amber-400/30',
    violet: 'bg-violet-100 text-violet-800 ring-violet-300 dark:bg-violet-400/15 dark:text-violet-300 dark:ring-violet-400/30',
    emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/30',
    red: 'bg-red-100 text-red-800 ring-red-300 dark:bg-red-400/15 dark:text-red-300 dark:ring-red-400/30',
}

// A status reaches these helpers in one of three shapes:
//   'complete'                     a plain table column, or a view (views are never expanded)
//   {value, label, desc}           a table fetched with expandEnums, as on the PCR experiments page
//   {originalValue, displayValue}  after QuickTable rewrites a column that has a format function
function statusValue(status: any): string | null {
    if (!_.isObject(status)) return (status as string) || null
    return _.get(status, 'value', _.get(status, 'originalValue', null))
}

export function recordStatusLabel(status: any): string {
    const value = statusValue(status)
    return value ? _.get(RECORD_STATUSES, [value, 'label'], '') : ''
}

// Returns the tag as an HTML string, for QuickTable column defs of type 'element'.
export function recordStatusTag(status: any): string {
    const label = recordStatusLabel(status)
    if (!label) return ''

    const palette = _.get(RECORD_STATUSES, [statusValue(status) as string, 'color'], 'slate')
    return `<span class="${TAG_BASE} ${_.get(TAG_COLORS, palette, TAG_COLORS.slate)}">${label}</span>`
}
