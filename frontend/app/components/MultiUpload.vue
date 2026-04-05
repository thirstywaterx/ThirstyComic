<template>
    <div class="file-item">
        <s-ripple class="upload-border" @click="triggerUpload">
            <img v-if="imageUrl" :src="imageUrl" class="preview-img" />
            <s-icon v-else name="add"></s-icon>
        </s-ripple>
        <input type="file" ref="fileInput" @change="onFileChange" accept="image/*" style="display: none" />
        <s-text-field :placeholder="$t('ui.labels.resourceDes')" type="multiline" style="min-height: 90px" :countered="true"
            maxlength="1000" v-model="descriptionValue"></s-text-field>
        <s-icon-button @click="emit('delete')">
            <s-icon>
            <svg viewBox="0 -960 960 960">
                <path
                    d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z">
                </path>
            </svg>
            </s-icon>
        </s-icon-button>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['delete', 'update:file', 'update:description']);
const props = defineProps({
    file: {
        type: Object as PropType<File | null>,
        default: null
    },
    description: {
        type: String,
        default: ''
    },
    initialImageUrl: {
        type: String,
        default: ''
    }
});

const fileInput = ref<HTMLInputElement | null>(null);
const imageUrl = ref<string>('');
const descriptionValue = ref(props.description);

watch(() => props.initialImageUrl, (newVal) => {
    imageUrl.value = newVal || '';
}, { immediate: true });

watch(() => props.description, (newVal) => {
    descriptionValue.value = newVal || '';
});

watch(descriptionValue, (newVal) => {
    emit('update:description', newVal);
});

const triggerUpload = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};

const onFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (file) {
            imageUrl.value = URL.createObjectURL(file);
            emit('update:file', file);
        }
    }
};
</script>

<style scoped>
.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 3px;
}

.file-item {
    width: 80%;
    height: 100px;
    display: flex;
    gap: 10px;
}

.upload-border {
    width: 100px;
    height: 90px;
    border: 1px solid #8a9296;
    border-radius: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
}

s-icon-button {
    width: 35px;
    height: 35px;
    margin-top: 25px;
}
</style>