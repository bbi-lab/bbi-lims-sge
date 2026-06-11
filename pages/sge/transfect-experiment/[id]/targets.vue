<script setup lang="ts">
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'

const config = useRuntimeConfig()
const crudTable = useCrudTable()
const route = useRoute()

const tableTitle = ref<string>()
const rowActions = {}

onMounted(async() => {
    if (route.params.id) {
        const experiment = await RecordService.getRecord(`${config.public.apiBase}/transfect-experiments`, route.params.id as string, {cycle: {columns: {name: true}}})
        tableTitle.value = `${experiment.cycle.name}: targets`
    } else {
        tableTitle.value = 'Transfection experiment targets'
    }
})

const columnDefs = {
    target: {
        format: (x: any) => { return x.target?.name || `${x.target?.region?.gene?.symbol}: ${x.target?.region?.name}` },
        path: 'target.displayValue',
        type: 'string',
        index: 0,
    },
    replicateCount: {
        header: 'Number of replicates',
        format: (x: any) => { return x.experiment.replicateCount || '' },
        path: 'replicateCount.displayValue',
        index: 1,
    },
    transfectionCount: {
        header: 'Transfections per replicate',
        index: 2,
    },
    negativeControl: {
        header: 'Negative control',
        type: 'boolean',
        index: 3,
    },
    totalTransfections: {
        header: 'Total transfections',
        format: (x: any) => {
            return (x.experiment.replicateCount && x.transfectionCount) ?
                (x.experiment.replicateCount * x.transfectionCount + (x.negativeControl ? 1 : 0)) :
                ''
        },
        index: 4,
        path: 'totalTransfections.displayValue',
    },
    experimentId: {
        display: false,
    },
    targetId: {
        display: false,
    },
    snvLib: {
        header: 'SNV library',
        format: (x: any) => { return x.snvLib?.name },
        path: 'snvLib.displayValue',
        index: 5,
    },
    snvLibraryConc: {
        header: 'SNV library conc. (ng/μL)',
        index: 6,
    },
    snvLibraryQuantity: {
        header: 'SNV library quantity (μg)',
        index: 7,
    },
    snvLibraryToQuantityVol: {
        header: 'Vol. of SNVlib to quantity (μL)',
        format: (x: any) => {
            return x.snvLibraryConc ? _.round((x.snvLibraryQuantity * 1000) / x.snvLibraryConc, 1).toFixed(1) : ''
        },
        path: 'snvLibraryToQuantityVol.displayValue',
        index: 8,
    },
    sgRna: {
        header: 'sgRNA',
        format: (x: any) => { return x.sgRna?.name },
        path: 'sgRna.displayValue',
        index: 9,
    },
    sgRnaConc: {
        header: 'Current sgRNA conc. (ng/μL)',
        index: 10,
    },
    sgRnaQuantity: {
        header: 'sgRNA quantity (μg)',
        index: 11,
    },
    sgRnaToQuantityVol: {
        header: 'Vol. of sgRNA to quantity (μL)',
        format: (x: any) => {
            return x.sgRnaConc ? _.round((x.sgRnaQuantity * 1000) / x.sgRnaConc, 1).toFixed(1) : ''
        },
        path: 'sgRnaToQuantityVol.displayValue',
        index: 12,
    },
    sgRnaNegControl: {
        header: 'sgRNA negative control',
        index: 13,
    },
    hprt1SgRnaConc: {
        header: 'HPRT1 sgRNA conc. (ng/μL)',
        index: 14,
    },
    hprt1SgRnaToQuantityVol: {
        header: 'Vol. of HPRT1 sgRNA to quantity (μL)',
        format: (x: any) => {
            return x.hprt1SgRnaConc ? _.round((x.sgRnaQuantity * 1000) / x.hprt1SgRnaConc, 1).toFixed(1) : ''
        },
        path: 'hprt1SgRnaToQuantityVol.displayValue',
        index: 15,
    },
    xfectBuffer: {
        header: 'Xfect Buffer (μL)',
        index: 16,
    },
    xfectPolymerPerTransfect: {
        header: 'Xfect polymer (μL) per transfection',
        index: 17,
    },
    snvLibNeeded: {
        header: 'SNV library needed (μL)',
        format: (x: any) => {
            if (x.experiment.replicateCount && x.transfectionCount && x.snvLibraryConc && x.transfectionCount && x.snvLibraryQuantity) {
                const totalTransfections = x.experiment.replicateCount * x.transfectionCount + (x.negativeControl ? 1 : 0)
                return _.round((x.snvLibraryQuantity * 1000) / x.snvLibraryConc * totalTransfections, 1).toFixed(1)
            } else {
                return ''
            }
        },
        path: 'snvLibNeeded.displayValue',
        index: 18,
    },
    sgRnaNeeded: {
        header: 'sgRNA needed (μL)',
        format: (x: any) => {
            if (x.experiment.replicateCount && x.transfectionCount && x.sgRnaConc && x.transfectionCount && x.sgRnaQuantity) {
                const totalTransfections = x.experiment.replicateCount * x.transfectionCount
                return _.round((x.sgRnaQuantity * 1000) / x.sgRnaConc * totalTransfections, 1).toFixed(1)
            } else {
                return ''
            }
        },
        path: 'sgRnaNeeded.displayValue',
        index: 19,
    },
    notes: {
        index: 20,
        header: 'Notes',
    },
    snvLibPlasmidId: {
        display: false,
    },
    sgRnaPlasmidId: {
        display: false,
    },
}

// Generate field defs from column defs to avoid repeating ourselves
const editFormFieldDefs: FieldDefinitions = _.mapValues(columnDefs, (v: any, k) => {
    return {
        display: v.display ?? true,
        label: v.header || k,
        index: v.index,
    }
})
// Include an AutoCompleter widget for adding new targets
editFormFieldDefs['targetId'] = {
    label: 'Target',
    component: 'AutoCompleter',
    readOnly: true,
    props: {
        searchBaseUrl: `${config.public.apiBase}/targets`,
        searchFields: ['region.gene.symbol', 'region.name', 'name'],
        valueField: 'id',
        displayFormat: (x: any) => {
            return x.name ?? `${x.region?.gene?.symbol}: ${x.region?.name}`
        },
        searchWithClause: {region: {columns: {name: true}, with: {gene: {columns: {symbol:true}}}}},
    },
    index: 0,
}
editFormFieldDefs['transfectionCount'] = {
    label: 'Transfections per replicate',
    component: 'InputNumber',
    props: {
        inputClass: 'w-40',
        defaultValue: 3,
        showButtons: true,
        allowEmpty: false,
        min: 1,
    },
    index: 1,
}
editFormFieldDefs['snvLibPlasmidId'] = {
    label: 'SNV library',
    component: 'AutoCompleter',
    dynamicKey: (record: any) => {
        return record.targetId ? `snvLibPlasmidId-${record.targetId}` : 'snvLibPlasmidId'
    },
    display: (record: any) => {
        return !!record.targetId
    },
    props: (record: any) => ({
        searchBaseUrl: `${config.public.apiBase}/snv-lib-plasmids`,
        searchFields: ['name'],
        valueField: 'id',
        displayFields: ['name'],
        dropdown: true,
        searchWhereClause: {"==" : [ {"var":"targetId"}, record.targetId] },
    }),
    index: 5,
}
editFormFieldDefs['sgRnaPlasmidId'] = {
    label: 'sgRNA',
    component: 'AutoCompleter',
    dynamicKey: (record: any) => {
        return record.targetId ? `sgRnaPlasmidId-${record.targetId}` : 'sgRnaPlasmidId'
    },
    display: (record: any) => {
        return !!record.targetId
    },
    props: (record: any) => ({
        searchBaseUrl: `${config.public.apiBase}/sg-rna-plasmids`,
        searchFields: ['name'],
        valueField: 'id',
        displayFields: ['name'],
        dropdown: true,
        searchWithClause: {sgRnaPlasmidTargets: true},
        searchWhereClause: {"some": [{"var": "sgRnaPlasmidTargets"}, {"==": [{"var": "targetId"}, record.targetId]}]},
    }),
    index: 8,
}

const addFormFieldDefs = _.cloneDeep(editFormFieldDefs)
_.set(addFormFieldDefs, 'targetId.readOnly', false)
_.set(addFormFieldDefs, 'snvLibraryQuantity.props.defaultValue', 5)
_.set(addFormFieldDefs, 'sgRnaQuantity.props.defaultValue', 10)
_.set(addFormFieldDefs, 'xfectBuffer.props.defaultValue', 700)
_.set(addFormFieldDefs, 'xfectPolymerPerTransfect.props.defaultValue', 9)

const readonlyValues = {experimentId: route.params.id}

const displayWithClause = {
    target: {
        columns: {name: true},
        with: {
            region: {
                columns: {name: true},
                with: {
                    gene: {
                        columns: {symbol: true}
                    }
                }
            }
        }
    },
    experiment: {
        columns: {cycle: true, replicateCount: true},
    },
    snvLib: true,
    sgRna: true,
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="transfect-targets"
                schemaName="select"
                :title="tableTitle"
                :rowActions="rowActions"
                :columnDefs="columnDefs"
                :where="{'==':[{'var': 'experimentId'}, route.params.id]}"
                :withClause="displayWithClause"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="transfect-targets"
                schemaName="insert"
                :fieldDefs="addFormFieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="transfect-targets"
                schemaName="update"
                :fieldDefs="editFormFieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
