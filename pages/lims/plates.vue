
<script setup>
import _ from 'lodash'

const route = useRoute()
const queryParams = route.query

// convert query params in to JSON Logic to pass as where clause
// TODO - pass more than just the first to QuickTable
const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})

</script>
<template>
    <Splitter>
        <SplitterPanel>
            <QuickTable
                tableName="plates" 
                schemaName="select-plate-schema"
                title="Plates"
                :columnHeaders="{name: 'Name'}"
                :where="whereClauses[0]"
                :canAdd="true"
                :canEdit="true"
                :canDelete="true"
                :rowsPerPageOptions="[10, 25, 50, 100]"
            />
        </SplitterPanel>
    </Splitter>
</template>
