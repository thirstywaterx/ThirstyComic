<template>
    <s-scroll-view id="assetScroll">
        <div class="assets-area" v-for="type in assetGroup">
            <div class="operations">
                <p>{{ type }}</p>
                <div class="operations-buttons">
                    <s-icon-button @click="handleAddFile(type)">
                        <s-icon name="add"></s-icon>
                    </s-icon-button>
                </div>
            </div>
            <s-scroll-view class="sub-asset-scroll">
                <div class="image-asset">
                    <template v-if="resourcesList[type.toLowerCase()]">
                        <div class="asset-item"
                            v-for="item in (Array.isArray(resourcesList[type.toLowerCase()]) ? resourcesList[type.toLowerCase()] : [resourcesList[type.toLowerCase()]])"
                            :key="item._id || Math.random()">
                            <img v-if="item.url && item.url.length > 0" :src="'/' + item.url[0]" alt="asset"
                                style="width: 100px; height: 100px; object-fit: cover;">
                            <p v-if="item.name">{{ item.name }}</p>
                        </div>
                    </template>
                </div>
            </s-scroll-view>
        </div>
    </s-scroll-view>

    <DialogAddFile :showed="addFileDialogVisible" :group="addGroup" @chose-file="handleSelectedFiles" />
</template>

<script setup lang="ts">
import { Snackbar } from "sober"
import { useI18n } from "#imports"
const { t } = useI18n()
const route = useRoute();
const projectId = route.params.projectId as string;
const chapterId = route.params.chapterId as string;

const props = defineProps<{
    shotId?: string
}>();

const assetGroup = ['Character', 'Background', 'Object', 'Others'];

const addFileDialogVisible = ref(false);
const addGroup = ref('Character');

async function handleAddFile(type: string) {
    addGroup.value = type;
    addFileDialogVisible.value = false;
    await nextTick();
    addFileDialogVisible.value = true;
}

async function handleSelectedFiles(files: any) {
    if (!props.shotId) {
        Snackbar.builder({ text: t("ui.messages.selectShotFirst"), type: "error" });
        return;
    }
    addFileDialogVisible.value = false;
    await useFetch(`/api/projects/${projectId}/chapters/${chapterId}/shots/${props.shotId}/resources`, {
        method: 'PUT',
        body: JSON.stringify({
            resources: files
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    // 重新获取数据以更新视图
    await execute();
}

// 获取选取的文件
const { data, execute } = await useFetch(() => `/api/projects/${projectId}/chapters/${chapterId}/shots/${props.shotId}/resources`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    immediate: !!props.shotId
});

watch(() => props.shotId, (newId) => {
    if (newId) {
        execute();
    }
});

const resourcesList = computed(() => (data.value as any)?.imageUrl || {});
</script>

<style scoped>
.image-asset {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    gap: 15px;
}

.image-asset img {
    border-radius: 10px;
}

#assetScroll {
    height: calc(100vh - 50px);
}

.assets-area {
    width: 100%;
    height: 300px;
    border-bottom: 1px solid rgb(117, 117, 117);
}

.operations {
    width: 100%;
    height: 40px;
    border-bottom: 1px solid rgb(117, 117, 117);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 0 15px;
}

.operations-buttons {
    display: flex;
    margin-right: 15px;
}

.sub-asset-scroll {
    height: 258px;
}
</style>