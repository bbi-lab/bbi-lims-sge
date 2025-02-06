<script setup>
import _ from 'lodash'
import Papa from 'papaparse'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const projectsTable = ref()
const config = useRuntimeConfig()
const toast = useToast()

function didClickRecordEdit(event) {
    editingRecordId.value = event.id
    showEditForm.value = true
    showAddForm.value = false
}

// function didClickRecordAdd() {
//     showAddForm.value = true
//     showEditForm.value = false
// }
// function didClickCancelAddForm() {
//     showAddForm.value = false
// }
function didClickCancelEditForm() {
    editingRecordId.value = null
    showEditForm.value = false
}

// function didAddRecord(event) {
//     projectsTable.value.addOrRefreshRecordId(event.id)
//     showAddForm.value = false
// }
function didUpdateRecord(event) {
    projectsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
// function didDeleteRecord(event) {
//     projectsTable.value.removeRecordId(event.id)
//     showEditForm.value = false
// }
const rowActions = {
    targets: {
        action: async (data) => {
            const result = await $fetch(`${config.public.apiBase}/custom/genes/${data.id}/export-targets`)
            if (!_.isEmpty(result)) {
                const csv = Papa.unparse(result, {delimiter: '\t'})
                const blob = new Blob([csv], { type: 'text/tab-separated-values;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `${data.symbol}_targets.tsv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            } else {
                toast.add({severity: 'warn', summary: 'No targets found'})
            }
        },
        icon: 'pi pi-fw pi-download',
        iconPos: 'right',
        tooltip: 'Targets',
    },
}
const columnDefs = {
    ncbiAccession: {
        header: 'NCBI accession'
    },
    geneId: {
        header: 'Gene ID'
    },
    startPosition: {
        header: 'Start'
    },
    endPosition: {
        header: 'End'
    },
}
</script>
<template>
    <Splitter>
        <SplitterPanel :size="50">
            <QuickTable
                ref="genesTable"
                tableName="genes"
                schemaName="select"
                title="Genes"
                :canAdd="false"
                :canDelete="false"
                selectionMode="single"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                @clickedRecordEdit="didClickRecordEdit"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="genes"
                :canDelete="false"
                schemaName="update"
                :readOnly="true"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
