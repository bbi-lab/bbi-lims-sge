<script setup lang="ts">
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'
import DotsTriangle from '~icons/mdi/dots-triangle'
import  {
    Target,
} from '~/shared/sge/target'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { v4 as uuidv4 } from 'uuid'
import { preseq1Primers } from '~/server/db/schema/sge/primer'

const router = useRouter()
const route = useRoute()
const crudTable = useCrudTable()
const config = useRuntimeConfig()

const addRecordValues = ref()
const tableKey = ref<string>(uuidv4())
const whereClauses = ref()
const readonlyValues = ref<Record<string, any>>({})

watch(() => route.query, async (newValue, oldValue) => {
    const queryParamFilters = _.map(newValue, (val, key) => {
        return {"==": [{"var": key}, val] }
    })
    whereClauses.value = _.size(queryParamFilters) > 1 ? {and: queryParamFilters} : queryParamFilters
    readonlyValues.value = newValue
    tableKey.value = uuidv4()
}, { immediate: true })


const displayWithClause = Object.freeze({
    project:{
        columns: {id: true, name: true}
    },
    region:{
        columns: {id: true, name: true},
        with: {
            gene: {
                columns: {id: true, symbol: true, ncbiAccession: true, chromosome: true}
            }
        }
    },
    transfectTargets: {
        with: {
            pellets: true
        }
    },
    sgRnaPlasmids: {
        columns: {id: true}
    },
    snvLibPlasmids: {
        columns: {id: true}
    },
    amplificationPrimers: {
        columns: {id: true, name: true, sequence: true, sequenceType: true},
    },
    preseq1Primers: {
        columns: {id: true, name: true, sequence: true, sequenceType: true},
    },
    preseq2Primers: {
        columns: {id: true, name: true, sequence: true, sequenceType: true},
    },
})

const rowActions = {
    sgRnaPlasmids: {
        label: (data: any) => { return `${data.sgRnaPlasmids?.length || 0} sgRNA`},
        action: (data: any) => {
            router.push({path:'/sge/sg-rna-plasmids', query: {'targetId': data.id}})
        },
        tooltip: 'sgRNA',
    },
    snvLibPlasmids: {
        label: (data: any) => { return `${data.snvLibPlasmids?.length || 0} SNV-lib`},
        action: (data: any) => {
            router.push({path:'/sge/snv-lib-plasmids', query: {'targetId': data.id}})
        },
        tooltip: 'SNV-lib',
    },
    pellets: {
        label: (data: any) => { return `${_.sumBy(data.transfectTargets, (x: any) => x.pellets.length)}`},
        action: (data: any) => {
            router.push({path:'/sge/pellets', query: {'transfectTarget.target.id': data.id}})
        },
        iconComponent: DotsTriangle,
        iconPos: 'right',
        tooltip: 'Pellets',
    },
    duplicate: {
        index: -1,  // places this button at the beginning of the row next to edit button
        icon: 'pi pi-copy',
        class: 'invisible group-hover:visible',  // display on hover only
        action: async (data: any) => {
            const target = new Target(data.id)
            await target.fetch()
            const result = await target.getDuplicate()
            if (!_.isEmpty(result)) {
                addRecordValues.value = result
                crudTable.state.showAddForm = true
                crudTable.state.showEditForm = false
            }
        }
    }
}
const columnDefs: ColumnDefinitions = {
    name: {
        index: 0,
    },
    regionId: {
        display: false
    },
    chromosome: {
        header: 'Chromosome',
        format: (x) => _.has(x, 'region.gene.chromosome') ? `chr${x.region.gene.chromosome}`: '',
        path: 'chromosome.displayValue',
        type: 'string',
        index: 1,
    },
    gene: {
        header: 'Gene',
        format: (x) => { return `${_.get(x, 'region.gene.symbol')} (${_.get(x, 'region.gene.ncbiAccession')})`},
        path: 'gene.displayValue',
        index: 2,
    },
    region: {
        header: 'Region',
        path: 'region.name',
        index: 3,
    },
    projectId: {
        display: false
    },
    project: {
        path: 'project.name',
        index: 4,
    },
    fixedEdits: {
        format: (x) => _.isArray(x.fixedEdits) ? x.fixedEdits.join(', ') : '',
        path: 'fixedEdits.displayValue',
        type: 'string',
        index: 5,
    },
    transfectTargets: {
        display: false,
    },
    plasmids: {
        display: false,
    },
    amplificationPrimers: {
        format: (x) => _.isArray(x.amplificationPrimers) ? _.map(x.amplificationPrimers, (y) => `${_.toUpper(y.sequenceType?.[0])}:${y.sequence}`) : '',
        type: 'element',
        element: (x: any) => {
            const value = _.isArray(x.amplificationPrimers) ? _.join(_.map(x.amplificationPrimers, (y) => `${_.toUpper(y.sequenceType?.[0])}:${y.sequence}`), ', ') : ''
            const href = `/sge/amplification-primers?targetId=${x.id}`
            return value ? `${value}<a href="${href}" class="text-blue-500 hover:underline"><span class="iconify mdi--link-variant" /></a>` : ''
        },
        path: 'amplificationPrimers.displayValue',
        exportValue: (x) => _.isArray(x.amplificationPrimers) ? _.join(_.map(x.amplificationPrimers, (y) => `${_.toUpper(y.sequenceType?.[0])}:${y.sequence}`), ', ') : '',
    },
    preseq1Primers: {
        format: (x) => _.isArray(x.preseq1Primers) ? _.map(x.preseq1Primers, (y) => `${_.toUpper(y.sequenceType?.[0])}:${y.sequence}`) : '',
        type: 'element',
        element: (x: any) => {
            const value = _.isArray(x.preseq1Primers) ? _.join(_.map(x.preseq1Primers, (y) => `${_.toUpper(y.sequenceType?.[0])}:${y.sequence}`), ', ') : ''
            const href = `/sge/preseq-1-primers?targetId=${x.id}`
            return value ? `${value}<a href="${href}" class="text-blue-500 hover:underline"><span class="iconify mdi--link-variant" /></a>` : ''
        },
        path: 'preseq1Primers.displayValue',
        exportValue: (x) => _.isArray(x.preseq1Primers) ? _.join(_.map(x.preseq1Primers, (y) => `${_.toUpper(y.sequenceType?.[0])}:${y.sequence}`), ', ') : '',
    },
    preseq2Primers: {
        format: (x) => _.isArray(x.preseq2Primers) ? _.map(x.preseq2Primers, (y) => `${_.toUpper(y.sequenceType?.[0])}:${y.sequence}`) : '',
        type: 'element',
        element: (x: any) => {
            const value = _.isArray(x.preseq2Primers) ? _.join(_.map(x.preseq2Primers, (y) => `${_.toUpper(y.sequenceType?.[0])}:${y.sequence}`), ', ') : ''
            const href = `/sge/preseq-2-primers?targetId=${x.id}`
            return value ? `${value}<a href="${href}" class="text-blue-500 hover:underline"><span class="iconify mdi--link-variant" /></a>` : ''
        },
        path: 'preseq2Primers.displayValue',
        exportValue: (x) => _.isArray(x.preseq2Primers) ? _.join(_.map(x.preseq2Primers, (y) => `${_.toUpper(y.sequenceType?.[0])}:${y.sequence}`), ', ') : '',
    },
    linearizationPrimers: {
        display: false,
    },
    homologyArmPrimers: {
        display: false,
    },
    sgRnaPlasmids: {
        display: false,
    },
    snvLibPlasmids: {
        display: false,
    },
    sequence: {
        bodyClass: 'break-all min-w-64',
    }
}

const fieldDefs: FieldDefinitions = {
    regionId: {
        label: 'Region',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/regions`,
            searchFields: ['name', 'gene.symbol'],
            valueField: 'id',
            displayFormat: (x:any) => `${x.gene.symbol}: ${x.name}`,
            searchWithClause: {gene: {columns: {symbol:true}}},
        },
        events: {
            change: async (record: any, recordOld: any) => {
                if (record?.regionId && (record.regionId != recordOld?.regionId)) {
                    const region = await RecordService.getRecord(`${config.public.apiBase}/regions`, record.regionId as string, {
                        gene: {
                            columns: {symbol: true}
                        }
                    })
                    record.name = _.toUpper(`${region.gene.symbol}_${_.replace(region.name, /exon[\s]+/gi , 'X')}`)
                }
            }
        },
        index: 2,
    },
    projectId: {
        label: 'Project',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/projects`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 1,
    },
    name: {
        index: 3,
    },
    transfectTargets: {
        display: false,
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :key="tableKey"
                :ref="crudTable.setTableRef"
                tableName="targets"
                schemaName="select"
                title="Targets"
                :rowActions="rowActions"
                :where="whereClauses"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                :showColumnFilters="true"
                :canEditMultiple="true"
                :selection-disabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="targets"
                schemaName="insert"
                :readonlyValues="readonlyValues"
                :fieldDefs="fieldDefs"
                :values="addRecordValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="targets"
                schemaName="update"
                :readonlyValues="readonlyValues"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="targets"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :readonlyValues="readonlyValues"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
