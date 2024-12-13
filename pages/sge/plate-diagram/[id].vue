<script setup lang="ts">
import { RecordService } from '~/utils/service/RecordService'

const route = useRoute()

// alternative methods, both return the same type currently
// TODO: add support for typing nested properties by specifying columns in "with" object
// TODO: have type auto-inferred by getRecord function, to avoid repeating ourselves like this 
type PlateWithWells = InferResultType<'plates', {wells: {columns: {x: true, y: true}}}, {id: true, name: true}>
// type PlateWithWells = InferQueryModel<'plates', {with: {wells: true}, columns: {id: true, name: true}}>

const plate = await RecordService.getRecordTyped<PlateWithWells>(
    'plates',
    route.params.id as string,
    {wells: {columns: {x: true, y: true}}},
    {id: true, name: true}
)
</script>
<template>

<PlateDiagram :plateId="$route.params.id"/>

</template>
