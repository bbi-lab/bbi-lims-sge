<script setup lang="ts">
import _ from 'lodash'

const props = defineProps({
    fixedValueField: String,
    components: Array as PropType<{ variableField: string, inputClass: string, label: string, component: string, componentProps: Object }[]>,
    disabled: Boolean,
    canDelete: Boolean,
})

const modelValue = defineModel<Record<string, any>>()

const emit = defineEmits([
    'didClickDelete'
])

function didClickDelete() {
    emit('didClickDelete', modelValue)
}

</script>
<template>
    <div class="flex flex-wrap">
        <template v-for="c of components" :key="modelValue![c.variableField]">
            <IftaLabel class="mr-2 mb-2">
                <AutoCompleter
                    v-if="c.component=='AutoCompleter'"
                    v-model="modelValue![c.variableField]"
                    v-bind="_.omit(c.componentProps, 'searchBaseUrl')"
                    :search-base-url="_.get(c.componentProps, 'searchBaseUrl', '')"
                    :hide-clear-button="true"
                    :disabled="disabled"
                />
                <component
                    v-else
                    :is="c.component"
                    v-model="modelValue![c.variableField]"
                    v-bind="modelValue![c.variableField] ? {...c.componentProps, defaultValue: undefined} : {...c.componentProps, modelValue: _.get(c.componentProps, 'defaultValue')}"
                    :disabled="disabled"
                />
                <label :for="c.variableField">
                    {{ c.label || c.variableField}}
                </label>
            </IftaLabel>
        </template>
        <Button v-if="props.canDelete" class="mb-2" icon="pi pi-times" severity="secondary" outlined @click="didClickDelete" />
    </div>
</template>
