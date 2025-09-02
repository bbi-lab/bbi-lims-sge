<script setup lang="ts">
import _ from 'lodash'

const crudTable = useCrudTable()
const router = useRouter()
const config = useRuntimeConfig()

const columnDefs = {
    name: {
        index: 1,
    },
    haCloningExperimentTargets: {
        header: 'Targets',
        format: (data: any) => {
            return _.map(data.haCloningExperimentTargets, 'target.name')
        },
        path: 'haCloningExperimentTargets.displayValue'
    },
    haPcrProducts: {
        header: 'HA PCR Product',
        type: 'element',
        element: (data: any) => {
            const haPcrProduct = _.get(data.haPcrProducts, '0')
            const href = `/sge/ha-pcr-products?id=${haPcrProduct.id}`
            return _.has(data.haPcrProducts, '0.id') ? `<a href="${href}" class="text-blue-500 hover:underline">✓</a>` : ''
        },
        elementSearchText: (x: any) => {
            return _.has(x.haPcrProducts, '0.id') ? '✓' : ''
        },
        exportValue: (x: any) => {
            return _.has(x.haPcrProducts, '0.id') ? 'true' : 'false'
        },
    }
}
const fieldDefs = {
    haPcrProducts: { display: false },
    'haCloningExperimentTargets.*': {
        label: 'Targets',
        component: 'InputArray',
        canDelete: false,
        canUpdate: false,
        props: {
            components: [
                {
                    variableField: 'targetId',
                    label: 'Target',
                    component: 'AutoCompleter',
                    componentProps: {
                        searchBaseUrl: `${config.public.apiBase}/targets`,
                        searchFields: ['region.gene.symbol', 'region.name', 'name'],
                        valueField: 'id',
                        inputClass: 'w-64',
                        displayFormat: (x: any) => {
                            return x.name ?? `${x.region?.gene?.symbol}: ${x.region?.name}`
                        },
                        searchWithClause: {region: {columns: {name: true}, with: {gene: {columns: {symbol:true}}}}},
                    },
                },
            ]
        }
    },
}
const withClause = {
    haCloningExperimentTargets: {
        with: {
            target: true,
        }
    },
    haPcrProducts: true,
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="ha-cloning-experiments"
                schemaName="select"
                title="Homology Arm Cloning"
                :withClause="withClause"
                :columnDefs="columnDefs"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="ha-cloning-experiments"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
                @recordUpdate="crudTable.didUpdateRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="ha-cloning-experiments"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="withClause"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
