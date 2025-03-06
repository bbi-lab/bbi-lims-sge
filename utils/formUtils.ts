import _ from 'lodash'

interface SchemaItems {
    properties?: Record<string, { default?: any }>;
    type?: string;
    enum?: string[];
    oneOf?: Record<string, SchemaItems>[];
    anyOf?: Record<string, SchemaItems>;
    items?: SchemaItems;
}

interface RecordType {
    [key: string]: any;
}

export const formatFieldLabel =  (val: String) => {
    return _.startCase(val.toString())
        .replace(/(^|\s)(Dna|Rna)($|\s)/g, (match) => match.toUpperCase())
        .replace(/(^|\s)Pct($|\s)/g, (match) => '% ').trim()
}

export const addNewItemToArray = (record: RecordType, key: string, schemaItems: SchemaItems) => {
    if (!_.isArray(record[key])) record[key] = [];

    if (schemaItems.properties) {
        const newItem: RecordType = {};
        for (const [k, v] of Object.entries(schemaItems.properties)) {
            // default value for foreign key should be set in JSON schema based on props.recordId 
            if (v.default) {
                _.set(newItem, k, v.default);
            } else {
                _.set(newItem, k, null);
            }
        }
        record[key].push(newItem);
    } else if (schemaItems.type == 'string') {
        record[key].push('');
    } else if (schemaItems.type == 'integer') {
        record[key].push(null);
    }
}

export const getFieldType = (val: any, key: string, fieldDefs: Record<string, SchemaItems> | undefined) => {
    const fieldType = _.get(fieldDefs, [key, 'type'])
    if (fieldType) {
        return fieldType
    } else if (_.isArray(val.type) && _.includes(val.type, 'null') && val.type.length == 2) {
        // getting field type for nullable fields
        return _.find(val.type, (x) => x != 'null')
    } else if (val.format=='date-time' || val.anyOf?.[0]?.format=='date-time') {
        return 'date-time'
    } else {
        // no field type defined
        return val.type
    }
}

export const addErrorsToForm = (formErrors: Array<{path: string[], message: string}>) => {
    // remove any previous validation errors
    document.querySelectorAll('.lims-validation-error').forEach((x) => x.remove())
    
    // remove red outline from inputs
    const existingErrorsInputs = document.querySelectorAll('.lims-validation-error-input')
    existingErrorsInputs.forEach((x) => {
        x.classList.remove('lims-validation-error-input', 'border-red-500')
    })

    // add error text and styling
    for (const e of formErrors) {
        const elementId = e.path?.[0]
        const element = document.getElementById(elementId)

        if (!element) {
            console.error(`Element with id ${elementId} not found`)
            continue
        }
        // get input element
        let inputElement
        if (element.tagName == 'INPUT') {
            inputElement = element
        } else {
            inputElement = element.querySelector('input')
        }

        if (inputElement) {
            inputElement.classList.add('lims-validation-error-input', '!border-red-500')
            const errorMsg = document.createElement('div')
            errorMsg.setAttribute('class', 'lims-validation-error text-red-500')
            errorMsg.textContent = e.message
            element.after(errorMsg)
        }
    }
}
