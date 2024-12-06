import _ from 'lodash'

// available as formatFieldLabel(...)
export default function (val: String) {
    return _.startCase(val.toString())
        .replace(/(^|\s)(Dna|Rna)($|\s)/g, (match) => match.toUpperCase())
        .replace(/(^|\s)Pct($|\s)/g, (match) => '% ').trim()
}
