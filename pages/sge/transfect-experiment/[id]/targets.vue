<script setup lang="ts">
import { RecordService } from '@/utils/service/RecordService'
import { ne } from 'drizzle-orm'
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'

const config = useRuntimeConfig()
const crudTable = useCrudTable()
const route = useRoute()

const tableTitle = ref<string>()
const rowActions = {}

onMounted(async() => {
    if (route.params.id) {
        const experiment = await RecordService.getRecord(`${config.public.apiBase}/transfect-experiments`, route.params.id, {cycle: {columns: {name: true}}})
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
    snvLibraryTo3ugVol: {
        header: 'Vol. of SNVlib to 3µg (μL)',
        format: (x: any) => {
            return x.snvLibraryConc ? _.round(3000 / x.snvLibraryConc, 1).toFixed(1) : ''
        },
        path: 'snvLibraryTo3ugVol.displayValue',
        index: 7,
    },
    sgRna: {
        header: 'sgRNA',
        format: (x: any) => { return x.sgRna?.name },
        path: 'sgRna.displayValue',
        index: 8,
    },
    sgRnaConc: {
        header: 'Current sgRNA conc. (ng/μL)',
        index: 9,
    },
    sgRnaTo12ugVol: {
        header: 'Vol. of sgRNA to 12µg (μL)',
        format: (x: any) => {
            return x.sgRnaConc ? _.round(12000 / x.sgRnaConc, 1).toFixed(1) : ''
        },
        path: 'sgRnaTo12ugVol.displayValue',
        index: 10,
    },
    sgRnaNegControl: {
        header: 'sgRNA negative control',
        index: 11,
    },
    hprt1SgRnaConc: {
        header: 'HPRT1 sgRNA conc. (ng/μL)',
        index: 12,
    },
    hprt1SgRnaTo12ugVol: {
        header: 'Vol. of HPRT1 sgRNA to 12µg (μL)',
        format: (x: any) => {
            return x.hprt1SgRnaConc ? _.round(12000 / x.hprt1SgRnaConc, 1).toFixed(1) : ''
        },
        path: 'hprt1SgRnaTo12ugVol.displayValue',
        index: 13,
    },
    xfectBuffer: {
        header: 'Xfect Buffer (μL)',
        index: 14,
    },
    xfectPolymerPerTransfect: {
        header: 'Xfect polymer (μL) per transfection',
        index: 15,
    },
    snvLibNeeded: {
        header: 'SNV library needed (μL)',
        format: (x: any) => {
            if (x.experiment.replicateCount && x.transfectionCount && x.snvLibraryConc && x.transfectionCount) {
                const totalTransfections = x.experiment.replicateCount * x.transfectionCount + (x.negativeControl ? 1 : 0)
                return _.round(3000 / x.snvLibraryConc * totalTransfections, 1).toFixed(1)
            } else {
                return ''
            }
        },
        path: 'snvLibNeeded.displayValue',
        index: 16,
    },
    sgRnaNeeded: {
        header: 'sgRNA needed (μL)',
        format: (x: any) => {
            if (x.experiment.replicateCount && x.transfectionCount && x.snvLibraryConc && x.transfectionCount) {
                const totalTransfections = x.experiment.replicateCount * x.transfectionCount
                return _.round(12000 / x.sgRnaConc * totalTransfections, 1).toFixed(1)
            } else {
                return ''
            }
        },
        path: 'sgRnaNeeded.displayValue',
        index: 17,
    },
    notes: {
        index: 18,
        header: 'Notes',
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
editFormFieldDefs['snvLib'] = {
    label: 'SNV library',
    component: 'AutoCompleter',
    props: {
        searchBaseUrl: `${config.public.apiBase}/plasmids`,
        searchFields: ['name'],
        valueField: 'id',
        displayFields: ['name'],
        dropdown: true,
        searchWhereClause: {'==': [{'var': 'plasmidType'}, 'library']}
    },
    index: 5,
}
editFormFieldDefs['sgRna'] = {
    label: 'sgRNA',
    component: 'AutoCompleter',
    props: {
        searchBaseUrl: `${config.public.apiBase}/plasmids`,
        searchFields: ['name'],
        valueField: 'id',
        displayFields: ['name'],
        dropdown: true,
        searchWhereClause: {'==': [{'var': 'plasmidType'}, 'guide']}
    },
    index: 8,
}
const addFormFieldDefs = _.cloneDeep(editFormFieldDefs)
_.set(addFormFieldDefs, 'targetId.readOnly', false)
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
