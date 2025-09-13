<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { v4 as uuidv4 } from 'uuid'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { snvLibGibsonProducts } from '~/server/db/schema/sge/oligos'

const crudTable = useCrudTable()
const config = useRuntimeConfig()
const route = useRoute()
const {user} = useUserSession()

const showAddDialog = ref(false)
const addFormTableName: Ref<string | undefined> = ref()
const addFormHeader: Ref<string | undefined> = ref()
const addFormFieldDefs: Ref<FieldDefinitions> = ref({})
const addFormReadOnlyValues = ref<Record<string, any>>({})
const addFormValues = ref<Record<string, any>>({})

const tableKey = ref<string>(uuidv4())
const whereClauses = ref()
const readonlyValues = ref<Record<string, any>>({})

const currentSnvLibCloningExperimentId = ref<string>()

watch(() => route.query, async (newValue, oldValue) => {
    const queryParamFilters = _.map(newValue, (val, key) => {
        return {"==": [{"var": key}, val] }
    })
    whereClauses.value = _.size(queryParamFilters) > 1 ? {and: queryParamFilters} : queryParamFilters
    readonlyValues.value = newValue
    tableKey.value = uuidv4()
}, { immediate: true })

const updateCurrentSnvLibCloningExperiment = (data: any) => {
    currentSnvLibCloningExperimentId.value = data?.id

    // update related AutoCompleter searchWhereClauses
    _.set(ampProductFieldDefinitions, 'ampPrimerForwardId.props.searchWhereClause', {"and": [
        {"==": [{"var": "sequenceType"}, "forward"]},
        {"==" : [ {"var":"targetId"}, data?.targetId ]},
    ]})
    _.set(ampProductFieldDefinitions, 'ampPrimerReverseId.props.searchWhereClause', {"and": [
        {"==": [{"var": "sequenceType"}, "reverse"]},
        {"==" : [ {"var":"targetId"}, data?.targetId ]},
    ]})

    _.set(linProductFieldDefinitions, 'linPrimerForwardId.props.searchWhereClause', {"and": [
        {"==": [{"var": "sequenceType"}, "forward"]},
        {"==" : [ {"var":"targetId"}, data?.targetId ]},
    ]})
    _.set(linProductFieldDefinitions, 'linPrimerReverseId.props.searchWhereClause', {"and": [
        {"==": [{"var": "sequenceType"}, "reverse"]},
        {"==" : [ {"var":"targetId"}, data?.targetId ]},
    ]})

    // limit the haPuc19Plasmid options to those associated with the current target via haCloningExperimentTargets
    _.set(linProductFieldDefinitions, 'haPuc19PlasmidId.props.searchWhereClause', {"some":[{"var": "haPuc19GibsonProduct.haPuc19PcrProduct.haPcrProduct.haCloningExperiment.haCloningExperimentTargets"}, {"==": [{"var": "targetId"}, data?.targetId]}]})
}

const columnDefs: ColumnDefinitions = {
    name: {
        index: 0,
    },
    targetId: { display: false },
    target: {
        path: 'target.name',
        index: 1,
    },
    snvLibAmpProducts: {
        header: 'AMP Product',
        type: 'element',
        element: (data: any) => {
            const ampProduct = _.get(data, 'snvLibAmpProducts.0')
            const href = ampProduct?.id ? `/sge/snv-lib-amp-products?id=${ampProduct?.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${ampProduct.name}</a>` : '<a href="#" class="p-button p-button-outlined p-button-info">Add</a>'
        },
        elementClick: (data: any) => {
            if (_.isEmpty(data.snvLibAmpProducts)) {
                addFormReadOnlyValues.value = {
                    name: _.replace(data.name, /_SNVlib$/gi , '_AMP'),
                    snvLibCloningExperimentId: _.get(data, 'id'),
                }
                addFormValues.value = {
                    cleanedBy: _.get(user, 'value.id'),
                    cleanedOn: new Date(),
                }
                addFormTableName.value = 'snv-lib-amp-products'
                addFormHeader.value = 'Add AMP Product'
                addFormFieldDefs.value = ampProductFieldDefinitions
                updateCurrentSnvLibCloningExperiment(data)
                showAddDialog.value = true
            }
        },
        exportValue: (x: any) => {
            return _.get(x, 'snvLibAmpProducts.0.name')
        },
    },
    snvLibLinProducts: {
        header: 'LIN Product',
        type: 'element',
        element: (data: any) => {
            const linProduct = _.get(data, 'snvLibLinProducts.0')
            const href = linProduct?.id ? `/sge/snv-lib-lin-products?id=${linProduct?.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${linProduct.name}</a>` : '<a href="#" class="p-button p-button-outlined p-button-info">Add</a>'
        },
        elementClick: (data: any) => {
            if (_.isEmpty(data.snvLibLinProducts)) {
                addFormReadOnlyValues.value = {
                    name: _.replace(data.name, /_SNVlib$/gi , '_LIN'),
                    snvLibCloningExperimentId: _.get(data, 'id'),
                }
                addFormValues.value = {
                    dpn1DigestBy: _.get(user, 'value.id'),
                    dpn1DigestOn: new Date(),
                }
                addFormTableName.value = 'snv-lib-lin-products'
                addFormHeader.value = 'Add LIN Product'
                addFormFieldDefs.value = linProductFieldDefinitions
                updateCurrentSnvLibCloningExperiment(data)
                showAddDialog.value = true
            }
        },
        exportValue: (x: any) => {
            return _.get(x, 'snvLibLinProducts.0.name')
        },
    },
    snvLibGibsonProducts: {
        header: 'Gibson Product',
        type: 'element',
        element: (data: any) => {
            const gibsonProduct = _.get(data, 'snvLibGibsonProducts.0')
            const href = gibsonProduct?.id ? `/sge/snv-lib-gibson-products?id=${gibsonProduct?.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${gibsonProduct.name}</a>` : '<a href="#" class="p-button p-button-outlined p-button-info">Add</a>'
        },
        elementClick: (data: any) => {
            if (_.isEmpty(data.snvLibGibsonProducts)) {
                addFormReadOnlyValues.value = {
                    name: `${data.name}_Gibson`,
                    snvLibCloningExperimentId: _.get(data, 'id'),
                }
                addFormValues.value = {
                    gibsonBy: _.get(user, 'value.id'),
                    gibsonOn: new Date(),
                }
                addFormTableName.value = 'snv-lib-gibson-products'
                addFormHeader.value = 'Add Gibson Product'
                addFormFieldDefs.value = gibsonProductFieldDefinitions
                updateCurrentSnvLibCloningExperiment(data)
                showAddDialog.value = true
            }
        },
        exportValue: (x: any) => {
            return _.get(x, 'snvLibGibsonProducts.0.name')
        },
    },
}
const didAddChildRecord = () => {
    crudTable.tableRef.value.addOrRefreshRecordIds([currentSnvLibCloningExperimentId.value])
    hideAddDialog()
}
const hideAddDialog = () => {
    showAddDialog.value = false
    updateCurrentSnvLibCloningExperiment(null)
}

const fieldDefs: FieldDefinitions = {
    name: {
        props: {
            defaultValue: '_SNVlib',
            onFocus: async (event: any) => {
                if (_.endsWith(event.target?._value, '_SNVlib')) {
                    if (event.target.setSelectionRange) {
                        setTimeout(() => {
                            const pos = event.target._value.length - 7
                            event.target.setSelectionRange(pos, pos)
                        }, 0)
                    }
                }
            },
        },
    },
    targetId: {
        label: 'Target',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/targets`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
    },
    snvLibAmpProducts: { display: false },
    snvLibLinProducts: { display: false },
}
const withClause = {
    target: true,
    snvLibAmpProducts: true,
    snvLibLinProducts: true,
    snvLibGibsonProducts: true,
}
const ampProductFieldDefinitions: FieldDefinitions = {
    name: { index: 0 },
    snvLibCloningExperimentId: {
        label: 'SNV Library Cloning Experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/snv-lib-cloning-experiments`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 1,
    },
    twistLotId: {
        label: 'Twist Lot',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/lots`,
            searchFields: ['lotNumber'],
            valueField: 'id',
            displayFields: ['lotNumber'],
            dropdown: true,
            searchWithClause: {reagent: true},
            searchWhereClause: {"==": [{"toLower": {"var": "reagent.name"}}, "twist"]},
        },
    },
    ampPrimerForwardId: {
        label: 'AMP Primer Forward',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/amplification-primers`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
            searchWithClause: {target: true},
        },
        index: 2,
    },
    ampPrimerReverseId: {
        label: 'AMP Primer Reverse',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/amplification-primers`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
            searchWithClause: {target: true},
        },
        index: 3,
    },
    cleanedBy: {
        label: 'Cleaned By',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
    },
    cleanedOn: {
        type: 'date',
    },
    quant: {
        label: 'Quant (ng/µL)',
    },
}

const linProductFieldDefinitions: FieldDefinitions = {
    name: { index: 0 },
    snvLibCloningExperimentId: {
        label: 'SNV Library Cloning Experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/snv-lib-cloning-experiments`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 1,
    },
    linPrimerForwardId: {
        label: 'LIN Primer Forward',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/linearization-primers`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
            searchWithClause: {target: true},
        },
        index: 2,
    },
    linPrimerReverseId: {
        label: 'LIN Primer Reverse',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/linearization-primers`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
            searchWithClause: {target: true},
        },
        index: 3,
    },
    haPuc19PlasmidId: {
        label: 'HA pUC19 Plasmid',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/ha-puc-19-plasmids`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
            searchWithClause: {
                haPuc19GibsonProduct: {
                    columns: {},
                    with: {
                        haPuc19PcrProduct: {
                            columns: {},
                            with: {
                                haPcrProduct: {
                                    columns: {},
                                    with: {
                                        haCloningExperiment: {
                                            columns: {},
                                            with: {
                                                haCloningExperimentTargets: {
                                                    columns: { targetId: true }
                                                }
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    dpn1DigestBy: {
        label: 'DpnI Digest By',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
    },
    dpn1DigestOn: {
        label: 'DpnI Digest On',
        type: 'date',
    },
    gelExtractedBy: {
        label: 'Gel Extracted By',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
    },
    gelExtractedOn: {
        type: 'date',
    },
    quant: {
        label: 'Quant (ng/µL)',
    },
}
const gibsonProductFieldDefinitions: FieldDefinitions = {
    name: { index: 0 },
    snvLibCloningExperimentId: {
        label: 'SNV Library Cloning Experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/snv-lib-cloning-experiments`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 1,
    },
    snvLibLinProductId: {
        label: 'SNVlib LIN Product',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/snv-lib-lin-products`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 2,
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :key="tableKey"
                :ref="crudTable.setTableRef"
                tableName="snv-lib-cloning-experiments"
                schemaName="select"
                title="SNV Library Cloning"
                :withClause="withClause"
                :where="whereClauses"
                :columnDefs="columnDefs"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="snv-lib-cloning-experiments"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
                @recordUpdate="crudTable.didUpdateRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="snv-lib-cloning-experiments"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="withClause"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
    <Dialog v-model:visible="showAddDialog" modal :header="addFormHeader" :style="{ width: 'auto' }" :closable="false">
        <QuickForm
            :tableName="addFormTableName"
            schemaName="insert"
            :readonlyValues="addFormReadOnlyValues"
            :fieldDefs="addFormFieldDefs"
            :values="addFormValues"
            @cancel="hideAddDialog"
            @recordAdd="didAddChildRecord"
        />
    </Dialog>
</template>
