<template>
    <div id="settingsSection">
        <b id="setting-name">
            <slot name="setting-name"></slot>
        </b>
        <s-text-field :type="type" v-model="textedContent" @change="onChange"></s-text-field>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
    initialValue: {
        type: String,
        default: ""
    },
    type: {
        type: String as import('vue').PropType<"number" | "text" | "password" | "multiline">,
        default: "text"
    }
})

const emit = defineEmits(['sendTexts'])

const textedContent = ref(props.initialValue);

watch(() => props.initialValue, (newVal) => {
    textedContent.value = newVal;
})

const onChange = (e: Event) => {
    textedContent.value = (e.target as HTMLInputElement).value;
}

watch(textedContent, (newValue) => {
    emit('sendTexts', newValue);
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

s-text-field {
    width: 40%;
    max-width: 250px;
}
</style>
