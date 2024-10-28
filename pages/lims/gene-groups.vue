
<script setup>
const config = useRuntimeConfig()

const baseUrl = `${config.public.apiBase}/gene-groups`

</script>
<template>
    <Splitter>
        <SplitterPanel>
            <QuickTable
                ref="geneGroupsTable"
                :apiBaseUrl="baseUrl" 
                schemaName="select-gene-group-schema"
                title="Gene groups"
                :canAdd="false"
                :canEdit="false"
                :canDelete="false"
            />
        </SplitterPanel>
    </Splitter>
</template>
