
<template>
    <Splitter>
        <SplitterPanel>
            <QuickTable
                tableName="plates" 
                schemaName="select-plate-schema"
                title="Plates"
                :canAdd="false"
                :canEdit="false"
                :canDelete="false"
                :rowsPerPageOptions="[10, 25, 50, 100]"
            />
        </SplitterPanel>
    </Splitter>
</template>
