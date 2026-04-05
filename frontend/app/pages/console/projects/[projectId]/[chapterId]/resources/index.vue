<template>
    <div id="page-content">

        <div id="operation">
            <s-segmented-button v-model.lazy="selectedAssetGroup">
                <s-segmented-button-item v-for="item in assetGroup" :key="item" :value="item">
                    {{ item }}
                </s-segmented-button-item>
            </s-segmented-button>

            <div id="operation-buttons">
                <NuxtLink :to="`${route.path}/upload`">
                    <s-icon-button>
                        <s-icon>
                            <svg viewBox="0 -960 960 960">
                                <path
                                    d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z">
                                </path>
                            </svg>
                        </s-icon>
                    </s-icon-button>
                </NuxtLink>

                <NuxtPage />
            </div>
        </div>

        <s-scroll-view>
            <div id="resources-container">
                <div id="cards" v-for="item in resourcesList" :key="item._id">
                    <s-card type="outlined" class="asset-card" :clickable="true">
                        <div slot="image">
                            <img v-if="item.images?.[0]?.url" :src="'/' + item.images[0].url">
                            <div v-else class="asset-empty-image"></div>
                        </div>
                        <div slot="headline">{{ item.name }}</div>
                        <div slot="text">{{ item.description }}</div>
                        <s-button slot="action" type="filled-tonal" @click.stop="editResource(item)">{{ $t('ui.buttons.edit') }}</s-button>
                        <s-button slot="action" @click.stop="removeResource(item)">{{ $t('ui.buttons.delete') }}</s-button>
                    </s-card>
                </div>
            </div>
        </s-scroll-view>

    </div>
</template>

<script setup lang="ts">
import { Dialog, Snackbar } from 'sober';
import { useI18n } from '#imports';

const route = useRoute();
const { t } = useI18n();
const assetGroup = ['Character', 'Background', 'Object', 'Others'];

const selectedAssetGroup = ref('Character');

type ResourceItem = {
    _id: string;
    name: string;
    description?: string;
    images?: Array<{ url?: string; description?: string }>;
};

const { data, refresh } = await useFetch<any>(() => `/api/projects/${route.params.projectId}/resources/${selectedAssetGroup.value.toLowerCase()}`, {
    method: 'GET'
});

const resourcesList = computed<ResourceItem[]>(() => data.value?.resources || []);

function editResource(item: ResourceItem) {
    const type = selectedAssetGroup.value.toLowerCase();
    navigateTo(`${route.path}/upload?mode=edit&type=${encodeURIComponent(type)}&resourceId=${encodeURIComponent(item._id)}`);
}

function removeResource(item: ResourceItem) {
    const type = selectedAssetGroup.value.toLowerCase();

    Dialog.builder({
        headline: t('ui.messages.notice'),
        text: t('ui.messages.deleteResourceConfirm', { name: item.name }),
        actions: [
            { text: t('ui.buttons.cancel') },
            {
                text: t('ui.buttons.confirm'),
                click: async () => {
                    try {
                        await $fetch(`/api/projects/${route.params.projectId}/resources/${type}/${item._id}`, {
                            method: 'DELETE'
                        });
                        Snackbar.builder({ text: t('ui.messages.deleteSuccess'), type: 'success' });
                        await refresh();
                    } catch (error) {
                        Snackbar.builder({ text: t('ui.messages.deleteFail'), type: 'error' });
                    }
                }
            }
        ]
    });
}

</script>

<style scoped>
#page-content {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 100px;
    top: 115px;
}

#operation {
    height: 50px;
    display: flex;
    align-items: center;
    padding-left: 20px;
    justify-content: space-between;
    position: fixed;
    z-index: 2;
}

#operation-buttons {
    width: 200px;
    margin-right: 30px;
    margin-left: 10px;
}

.asset-card {
    width: 300px;
    min-height: 300px;
    margin: 20px;
}

.asset-card img {
    width: 100%;
    height: 130px;
    object-fit: cover;
    object-position: center;
}

.asset-empty-image {
    width: 100%;
    height: 130px;
    background: #f3f4f6;
}

.asset-card div[slot="text"] {
    margin-bottom: 40px;
}

#resources-container {
    display: flex;
    flex-wrap: wrap;
}

s-scroll-view {
    position: relative;
    height: 78%;
    top: -40px;
    padding-top: 100px;
}
</style>