<template>
    <div id="settingsSection">
        <b id="setting-name">
            <slot name="setting-name"></slot>
        </b>
        <s-picker :label="pickerLabel" :value="select" @change="onChange">
            <s-picker-item v-for="items in sections" :key="items.value" :value="items.value">{{ items.label }}</s-picker-item>
        </s-picker>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
    sections: {
        type: Array as PropType<{ label: string; value: string}[]>,
        required: true
    },
    selected: {
        type: String,
        required: false
    },
    pickerLabel: {
        type: String,
        required: false,
        default: ''
    }
})

const emit = defineEmits(['sendSlection'])

let select = ref(props.selected)

const onChange = (e: Event) => {
    select.value = (e.target as HTMLInputElement).value;
}

watch(select, (newValue) => {
    emit('sendSlection', newValue);
});
</script>

<style scoped>
#settingsSection {
    width: 100%;
    max-width: 700px;
    display: flex;
    justify-content: space-between; 
}


#setting-name {
    font-size: 20px;
}
</style>
