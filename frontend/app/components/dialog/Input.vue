<template>
        <s-dialog :showed="showed">
            <div slot="headline"> <slot name="headline"></slot> </div>
            <div slot="text">
                <slot name="text"></slot>
            </div>
            <s-text-field :label="inputLabel" :maxLength="maxLength" :countered="true" v-model="inputValue"></s-text-field>
            <s-button slot="action" type="text">{{ $t('ui.buttons.cancel') }}</s-button>
            <s-button slot="action" type="text" @click="sendInputValue">{{ $t('ui.buttons.confirm') }}</s-button>
        </s-dialog>
</template>

<script setup lang="ts">
const emit = defineEmits(['updateValue'])

let inputValue = ref('');

const props = defineProps({
    showed: {
        type: Boolean,
        default: false
    },
    maxLength: {
        type: Number,
        default: 20
    },
    inputLabel: {
        type: String,
        default: ''
    },
    initialValue: {
        type: String,
        default: ''
    }
})

watch(() => props.showed, (visible) => {
    if (visible) {
        inputValue.value = props.initialValue || '';
    }
}, { immediate: true });

function sendInputValue() {
    emit('updateValue', inputValue.value)
}
</script>

<style scoped>
s-text-field {
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 30px;
}
</style>