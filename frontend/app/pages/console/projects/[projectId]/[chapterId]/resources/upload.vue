<template>
    <div id="page-content">
        <Breadcrumbs :items="breadcrumbItems"></Breadcrumbs>

        <div id="main-content">
            <div id="text-area">
                <s-text-field :label="$t('ui.labels.resourceName')" :countered="true" maxlength="50" v-model="resourceName"></s-text-field>
                <s-text-field :label="$t('ui.labels.resourceDes')" type="multiline" style="min-height: 200px" :countered="true"
                    maxlength="3000" v-model="resourceDescription"></s-text-field>
                <s-button type="outlined" style="margin-right: 20px;" @click="router.back()"> {{ $t('ui.buttons.cancel') }} </s-button>
                <s-button @click="handleSubmit"> {{ isEditMode ? $t('ui.buttons.save') : $t('ui.buttons.upload') }} </s-button>
            </div>

            <div id="image-area">
                <div id="operation">
                    <s-segmented-button v-model.lazy="resourceType">
                        <s-segmented-button-item v-for="item in assetGroup" :key="item" :value="item">
                            {{ item }}
                        </s-segmented-button-item>
                    </s-segmented-button>

                    <s-icon-button @click="addUpload">
                        <s-icon name="add"></s-icon>
                    </s-icon-button>
                </div>

                <s-scroll-view ref="scrollView">
                    <MultiUpload class="multiupload" v-for="(item, index) in uploadItems" :key="item.id"
                        @delete="removeUpload(index)" v-model:file="item.file" v-model:description="item.description" :initialImageUrl="item.imageUrl"></MultiUpload>
                </s-scroll-view>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Snackbar } from 'sober'
import { computed, ref, nextTick, onMounted } from 'vue'
import { useRoute, useRouter, useFetch } from '#imports'
import { useI18n } from '#imports'

const route = useRoute();
const router = useRouter();

const projectId = route.params.projectId as string;
const chapterId = route.params.chapterId as string;

const isEditMode = computed(() => route.query.mode === 'edit');
const editingResourceId = computed(() => (route.query.resourceId as string) || '');
const editingResourceType = computed(() => (route.query.type as string)?.toLowerCase() || '');

const { t } = useI18n();
const breadcrumbItems = computed(() => {
    const segments = route.path.split('/').filter(Boolean);
    return segments.map((segment, index) => {
        const to = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        return {
            labelKey: isLast && isEditMode.value ? 'ui.nav.breadcrumbs.edit' : `ui.nav.breadcrumbs.${segment}`,
            fallback: isLast && isEditMode.value ? t('ui.nav.breadcrumbs.edit') : segment.replace(/[-_]/g, ' '),
            to: isLast ? undefined : to
        };
    });
});

const assetGroup = ['Character', 'Background', 'Object', 'Others'];

const resourceName = ref('');
const resourceDescription = ref('');
const resourceType = ref('Character');

interface UploadItem {
    id: number;
    file: File | null;
    description: string;
    imageUrl?: string;
}

const uploadItems = ref<UploadItem[]>([{ id: Date.now(), file: null, description: '' }]);
const scrollView = ref<HTMLElement | null>(null);

// 自增后滚到最下面
const addUpload = async () => {
    uploadItems.value.push({ id: Date.now(), file: null, description: '' });
    await nextTick();
    if (scrollView.value) {
        scrollView.value.scrollTop = scrollView.value.scrollHeight;
    }
};

const removeUpload = (index: number) => {
    if (uploadItems.value.length > 1) {
        uploadItems.value.splice(index, 1);
    } else {
        Snackbar.builder({
            text: t('ui.messages.reserveOne'),
            type: 'warning',
        })
    }
};

async function fillEditData() {
    if (!isEditMode.value || !editingResourceId.value || !editingResourceType.value) {
        return;
    }

    try {
        const data = await $fetch<any>(`/api/projects/${projectId}/resources/${editingResourceType.value}`, { method: 'GET' });
        const list = data?.resources || [];
        const target = list.find((item: any) => item?._id === editingResourceId.value);

        if (!target) {
        Snackbar.builder({ text: t('ui.messages.resourceNotFound'), type: 'error' });
        return;
        }

        resourceName.value = target.name || '';
        resourceDescription.value = target.description || '';
        resourceType.value = editingResourceType.value.charAt(0).toUpperCase() + editingResourceType.value.slice(1);

        const existingImages = Array.isArray(target.images) ? target.images : [];
        if (existingImages.length > 0) {
            uploadItems.value = existingImages.map((img: any) => ({
                id: Date.now() + Math.random(),
                file: null,
                description: img?.description || '',
                imageUrl: img?.url ? `/${img.url}` : ''
            }));
        }
    } catch (error) {
        Snackbar.builder({ text: t('ui.messages.resourceNotFound'), type: 'error' });
    }
}

const handleUpload = async () => {
    if (!resourceName.value.trim()) {
        Snackbar.builder({ text: t('ui.messages.nameRequired'), type: 'error' });
        return;
    }

    // Validate uploadItems
    const validItems = uploadItems.value.filter(item => item.file);
    if (validItems.length === 0) {
        Snackbar.builder({ text: t('ui.messages.needImage'), type: 'error' });
        return;
    }    const formData = new FormData();
    formData.append('name', resourceName.value);
    formData.append('description', resourceDescription.value);
    formData.append('type', resourceType.value);
    
    validItems.forEach((item, index) => {
        if (item.file) {
            formData.append(`images`, item.file);
            formData.append(`imageDescriptions`, item.description || '');
        }
    });

    try {
        const { data, error } = await useFetch(`/api/projects/${projectId}/resources/`, {
            method: 'POST',
            body: formData
        });

        if (error.value) {
            throw error.value;
        }

        Snackbar.builder({ text: t('ui.messages.uploadSuccess'), type: 'success' });
        router.back();
    } catch (err: any) {
        Snackbar.builder({ text: t('ui.messages.uploadFail') + ': ' + err.message, type: 'error' });
    }
};

const handleUpdate = async () => {
    if (!resourceName.value.trim()) {
        Snackbar.builder({ text: t('ui.messages.nameRequired'), type: 'error' });
        return;
    }

    if (!editingResourceId.value || !editingResourceType.value) {
        Snackbar.builder({ text: t('ui.messages.missingResourceInfo'), type: 'error' });
        return;
    }

    try {
        await $fetch(`/api/projects/${projectId}/resources/${editingResourceType.value}/${editingResourceId.value}`, {
            method: 'PUT',
            body: {
                name: resourceName.value,
                description: resourceDescription.value,
                targetType: resourceType.value.toLowerCase(),
                imageDescriptions: uploadItems.value.map(item => item.description || '')
            }
        });

        Snackbar.builder({ text: t('ui.messages.updateSuccess'), type: 'success' });
        await navigateTo(`/console/projects/${projectId}/${encodeURIComponent(chapterId)}/resources`);
    } catch (err: any) {
        Snackbar.builder({ text: t('ui.messages.updateFail') + ': ' + err.message, type: 'error' });
    }
};

const handleSubmit = async () => {
    if (isEditMode.value) {
        await handleUpdate();
        return;
    }

    await handleUpload();
};

onMounted(async () => {
    await fillEditData();
});
</script>

<style scoped>
#page-content {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 100px;
    top: 115px;
}

#main-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

#text-area {
    width: 45%;
    margin-top: 40px;
}

#text-area s-text-field {
    width: 80%;
    max-width: 500px;
    margin-bottom: 25px;
    display: block;
}

#image-area {
    width: 55%;
    margin-top: 40px;
}

#operation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 80%;
    margin-bottom: 30px;
    justify-content: flex-start;
}

#operation s-icon-button {
    margin-left: 10px;
}

s-scroll-view {
    height: 400px;
}

.multiupload {
    margin-bottom: 30px;
}
</style>