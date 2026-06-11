<script setup lang="ts">
import _ from 'lodash'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'

const crudTable = useCrudTable()
const config = useRuntimeConfig()

const columnDefs: ColumnDefinitions = {
    name: { index: 0 },
    target: {
        header: 'Target',
        index: 1,
        path: 'target.name',
    },
    sequence: {
        index: 2,
        bodyClass: 'max-w-64 truncate',
    },
    libraryType: {
        header: 'Library Type',
        index: 3,
    },
    sgeOligoLots: {
        header: 'Twist Lot(s)',
        index: 4,
        format: (data: any) => {
            return _.map(data.sgeOligoLots, (sgeOligoLot: any) => sgeOligoLot.lot?.lotNumber).filter(Boolean)
        },
        path: 'sgeOligoLots.displayValue',
    },
    notes: { index: 5 },
    targetId: { display: false },
}

const fieldDefs = {
    name: { index: 0 },
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
        index: 1,
    },
    sequence: {
        index: 2,
    },
    libraryType: {
        label: 'Library Type',
        index: 3,
    },
    'sgeOligoLots.*': {
        label: 'Twist Lots',
        component: 'InputArray',
        canDelete: true,
        canUpdate: true,
        props: {
            components: [
                {
                    variableField: 'lotId',
                    label: 'Lot',
                    component: 'AutoCompleter',
                    componentProps: {
                        searchBaseUrl: `${config.public.apiBase}/lots`,
                        searchFields: ['lotNumber'],
                        valueField: 'id',
                        displayFields: ['lotNumber'],
                        dropdown: true,
                        searchWithClause: { reagent: true },
                        searchWhereClause: { '==': [{ 'toLower': { 'var': 'reagent.name' } }, 'twist'] },
                    },
                },
            ],
        },
        index: 4,
    },
    notes: { index: 5 },
}

const displayWithClause = {
    target: {
        columns: { id: true, name: true },
    },
    sgeOligoLots: {
        with: {
            lot: {
                columns: { id: true, lotNumber: true },
            },
        },
    },
}

const formWithClause = {
    target: {
        columns: { id: true, name: true },
    },
    sgeOligoLots: {
        with: {
            lot: {
                columns: { id: true, lotNumber: true },
            },
        },
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="sge-oligos"
                schemaName="select"
                title="SGE Oligos"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
        <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="sge-oligos"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                tableName="sge-oligos"
                schemaName="update"
                :recordId="crudTable.state.editingRecordId"
                :fieldDefs="fieldDefs"
                :withClause="formWithClause"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
