
<template>
    <Splitter>
        <SplitterPanel>
            <QuickTable
                ref="geneGroupsTable"
                tableName="gene-groups" 
                schemaName="select-gene-group-schema"
                title="Gene groups"
                :canAdd="false"
                :canEdit="false"
                :canDelete="false"
                :rowsPerPageOptions="[10, 25, 50, 100]"
            />
        </SplitterPanel>
    </Splitter>
</template>
