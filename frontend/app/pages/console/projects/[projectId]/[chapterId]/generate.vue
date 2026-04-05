<template>
    <div id="page-content">

        <!-- 添加分镜对话框 -->
        <DialogInput :showed="addShotDialogVisible" :maxLength="20" :inputLabel="$t('ui.labels.shotName')"
            @updateValue="handleAddShotData">
            <template #headline>{{ $t('ui.messages.addShot') }}</template>
            <template #text>{{ $t('ui.messages.addShotDes') }}</template>
        </DialogInput>

        <DialogInput :showed="renameShotDialogVisible" :maxLength="20" :inputLabel="$t('ui.labels.shotName')"
            :initialValue="renameShotInitialName" @updateValue="handleRenameShotData">
            <template #headline>{{ $t('ui.project.storyboard.rename') }}</template>
            <template #text>请输入新的分镜名称</template>
        </DialogInput>

        <s-card class="workarea" id="storyboard">
            <div class="operate-area">
                <s-icon-button class="edit-toggle-btn" @click="toggleEditMode" :class="{ 'active-edit': isEditMode }">
                    <svg viewBox="0 -960 960 960">
                        <path
                            d="M240-160q-33 0-56.5-23.5T160-240q0-33 23.5-56.5T240-320q33 0 56.5 23.5T320-240q0 33-23.5 56.5T240-160Zm240 0q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm240 0q-33 0-56.5-23.5T640-240q0-33 23.5-56.5T720-320q33 0 56.5 23.5T800-240q0 33-23.5 56.5T720-160ZM240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400ZM240-640q-33 0-56.5-23.5T160-720q0-33 23.5-56.5T240-800q33 0 56.5 23.5T320-720q0 33-23.5 56.5T240-640Zm240 0q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Zm240 0q-33 0-56.5-23.5T640-720q0-33 23.5-56.5T720-800q33 0 56.5 23.5T800-720q0 33-23.5 56.5T720-640Z">
                        </path>
                    </svg>
                </s-icon-button>
                <s-icon-button v-if="!isEditMode" @click="handelAddShot">
                    <s-icon> <svg viewBox="0 -960 960 960">
                            <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"></path>
                        </svg></s-icon>
                </s-icon-button>
                <s-icon-button v-if="!isEditMode" @click="downloadAllSelectedImages">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                        fill="#e3e3e3">
                        <path
                            d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                    </svg>
                </s-icon-button>
                <s-button v-if="isEditMode && selectedShotIds.length > 0" @click="batchDelete"
                    style="margin-left: auto; margin-right: 10px;" type="text">
                    {{ $t('ui.project.storyboard.delete') }} ({{ selectedShotIds.length }})
                </s-button>
            </div>

            <s-scroll-view id="chapter-scroll">
                <draggable v-model="shotsList" item-key="_id" handle=".drag-handle" :disabled="!isEditMode"
                    ghost-class="shot-ghost" chosen-class="shot-chosen" @end="onDragEnd">
                    <template #item="{ element: item, index }">
                        <s-ripple class="shot"
                            :class="{ 'selected-shot': projectStore.memory.shot === index && !isEditMode }"
                            @click.stop="handleShotClick(index)">

                            <div style="display:flex; align-items:center; gap: 8px;">
                                <s-checkbox v-if="isEditMode" :checked="selectedShotIds.includes(item._id)"
                                    @change="toggleShotSelected($event, item._id)" @click.stop></s-checkbox>
                                <s-icon v-if="isEditMode" class="drag-handle">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
                                        width="24px" fill="#e3e3e3">
                                        <path
                                            d="M360-160q-33 0-56.5-23.5T280-240q0-33 23.5-56.5T360-320q33 0 56.5 23.5T440-240q0 33-23.5 56.5T360-160Zm240 0q-33 0-56.5-23.5T520-240q0-33 23.5-56.5T600-320q33 0 56.5 23.5T680-240q0 33-23.5 56.5T600-160ZM360-400q-33 0-56.5-23.5T280-480q0-33 23.5-56.5T360-560q33 0 56.5 23.5T440-480q0 33-23.5 56.5T360-400Zm240 0q-33 0-56.5-23.5T520-480q0-33 23.5-56.5T600-560q33 0 56.5 23.5T680-480q0 33-23.5 56.5T600-400ZM360-640q-33 0-56.5-23.5T280-720q0-33 23.5-56.5T360-800q33 0 56.5 23.5T440-720q0 33-23.5 56.5T360-640Zm240 0q-33 0-56.5-23.5T520-720q0-33 23.5-56.5T600-800q33 0 56.5 23.5T680-720q0 33-23.5 56.5T600-640Z" />
                                    </svg>
                                </s-icon>
                                <p>{{ item.name }}</p>
                            </div>

                            <s-popup-menu v-if="!isEditMode">
                                <s-icon-button slot="trigger">
                                    <s-icon name="more_vert"></s-icon>
                                </s-icon-button>
                                <s-popup-menu-item @click="openRenameShotDialog(item)">{{
                                    $t('ui.project.storyboard.rename') }}</s-popup-menu-item>
                                <s-popup-menu-item @click="downloadShotSelectedImage(item)">Download</s-popup-menu-item>
                                <s-popup-menu-item @click="deleteShot(item._id)">{{ $t('ui.project.storyboard.delete')
                                    }}</s-popup-menu-item>
                            </s-popup-menu>
                        </s-ripple>
                    </template>
                </draggable>

            </s-scroll-view>
        </s-card>
        <s-card class="workarea" id="assets">
            <ProjectGenerateAssetsArea :shot-id="currentShotId" />
        </s-card>
        <s-card class="workarea" id="generate">
            <ProjectGenerateIOArea :shot-id="currentShotId" />
        </s-card>
    </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';
import { Dialog, Snackbar } from 'sober';
import { useProjectStore } from '#imports';

const projectStore = useProjectStore();

const route = useRoute();
const { t } = useI18n();

const projectId = route.params.projectId as string;
const chapterId = route.params.chapterId as string;


let addShotDialogVisible = ref(false);
const renameShotDialogVisible = ref(false);
const renameShotTargetId = ref('');
const renameShotInitialName = ref('');
const isEditMode = ref(false);
const selectedShotIds = ref<string[]>([]);

async function handelAddShot() {
    addShotDialogVisible.value = false;
    await nextTick();
    addShotDialogVisible.value = true;
}

type ShotItem = {
    _id: string;
    name: string;
    selectedImagePath?: string;
};

const shotsList = ref<ShotItem[]>([]);
const currentShotId = computed(() => shotsList.value[projectStore.memory.shot]?._id || '');

function normalizeShots(shots: any[] = []) {
    return shots.filter(item => item && item._id);
}

function normalizeAssetPath(path: string) {
    return String(path || '').replace(/^\/+/, '');
}

function getDownloadFileName(path: string, shotName: string, index: number) {
    const cleanedPath = normalizeAssetPath(path).split('?')[0] || '';
    const sourceName = cleanedPath.split('/').pop() || `shot-${index + 1}.png`;
    const extMatch = sourceName.match(/\.[a-zA-Z0-9]+$/);
    const ext = extMatch ? extMatch[0] : '.png';
    const safeShotName = (shotName || `shot-${index + 1}`).replace(/[\\/:*?"<>|]/g, '_');
    return `${safeShotName}${ext}`;
}

async function downloadImageByPath(path: string, fileName: string) {
    const normalizedPath = normalizeAssetPath(path);
    if (!normalizedPath) {
        throw new Error('empty path');
    }

    const response = await fetch(`/${normalizedPath}`);
    if (!response.ok) {
        throw new Error('download failed');
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

async function downloadAllSelectedImages() {
    try {
        const data = await $fetch<any>(`/api/projects/${projectId}/chapters/${chapterId}/shots`, {
            method: 'GET'
        });

        const shots = normalizeShots(data?.shots || []);
        if (!shots.length) {
            Snackbar.builder({ text: t('ui.messages.noShotsToDownload'), type: 'warning' });
            return;
        }

        const downloadableShots = shots.filter(item => !!item.selectedImagePath);
        const missingCount = shots.length - downloadableShots.length;

        if (!downloadableShots.length) {
            Snackbar.builder({ text: t('ui.messages.noImagesSelected'), type: 'warning' });
            return;
        }

        for (let i = 0; i < downloadableShots.length; i++) {
            const shot = downloadableShots[i];
            await downloadImageByPath(shot.selectedImagePath as string, getDownloadFileName(shot.selectedImagePath as string, shot.name, i));
        }

        if (missingCount > 0) {
            Snackbar.builder({ text: t('ui.messages.downloadPartial', { downloaded: downloadableShots.length, missing: missingCount }), type: 'warning' });
            return;
        }

        Snackbar.builder({ text: t('ui.messages.downloadFull', { downloaded: downloadableShots.length }), type: 'success' });
    } catch (error) {
        Snackbar.builder({ text: t('ui.messages.downloadFailed'), type: 'error' });
    }
}

async function downloadShotSelectedImage(shot: ShotItem) {
    if (!shot?.selectedImagePath) {
        Snackbar.builder({ text: t('ui.messages.shotNoImageSelected'), type: 'warning' });
        return;
    }

    try {
        await downloadImageByPath(shot.selectedImagePath, getDownloadFileName(shot.selectedImagePath, shot.name, 0));
        Snackbar.builder({ text: t('ui.messages.downloadShotFull'), type: 'success' });
    } catch (error) {
        Snackbar.builder({ text: t('ui.messages.downloadFailed'), type: 'error' });
    }
}

function syncSelectedShotIndex(preferredShotId?: string) {
    if (!shotsList.value.length) {
        projectStore.memory.shot = -1;
        return;
    }

    if (preferredShotId) {
        const targetIndex = shotsList.value.findIndex(item => item._id === preferredShotId);
        if (targetIndex !== -1) {
            projectStore.memory.shot = targetIndex;
            return;
        }
    }

    if (projectStore.memory.shot < 0 || projectStore.memory.shot >= shotsList.value.length) {
        projectStore.memory.shot = 0;
    }
}

async function fetchShots() {
    try {
        const data = await $fetch<any>(`/api/projects/${projectId}/chapters/${chapterId}/shots`, {
            method: 'GET'
        });

        shotsList.value = normalizeShots(data?.shots || []);
        syncSelectedShotIndex(shotsList.value[projectStore.memory.shot]?._id);
    } catch (error) {
        Snackbar.builder({ text: t('ui.messages.fetchShotsFailed'), type: 'error' });
    }
}

async function handleAddShotData(shotName: string) {
    addShotDialogVisible.value = false;

    if (!shotName) {
        return;
    }

    try {
        const data = await $fetch<any>(`/api/projects/${projectId}/chapters/${chapterId}/shots`, {
            method: 'POST',
            body: {
                name: shotName
            }
        });

        shotsList.value = normalizeShots(data?.shots || []);
        syncSelectedShotIndex(shotsList.value[shotsList.value.length - 1]?._id);
        Snackbar.builder({ text: t('ui.messages.addShotSuccess'), type: 'success' });
    } catch (error) {
        Snackbar.builder({ text: t('ui.messages.addShotFailed'), type: 'error' });
    }
}

async function openRenameShotDialog(shot: ShotItem) {
    renameShotTargetId.value = shot._id;
    renameShotInitialName.value = shot.name || '';
    renameShotDialogVisible.value = false;
    await nextTick();
    renameShotDialogVisible.value = true;
}

async function handleRenameShotData(nextName: string) {
    renameShotDialogVisible.value = false;

    if (!renameShotTargetId.value) {
        return;
    }

    const newName = (nextName || '').trim();
    if (!newName) {
        Snackbar.builder({ text: t('ui.messages.shotNameEmpty'), type: 'error' });
        return;
    }

    const targetId = renameShotTargetId.value;
    const target = shotsList.value.find(item => item._id === targetId);
    if (!target) {
        Snackbar.builder({ text: t('ui.messages.shotNotFound'), type: 'error' });
        return;
    }

    if (target.name === newName) {
        return;
    }

    try {
        const data = await $fetch<any>(`/api/projects/${projectId}/chapters/${chapterId}/shots/${targetId}`, {
            method: 'PUT',
            body: {
                name: newName
            }
        });

        const renamedShot = data?.shot;
        if (renamedShot?._id) {
            shotsList.value = shotsList.value.map(item => item._id === renamedShot._id
                ? { ...item, name: renamedShot.name || newName }
                : item);
        } else {
            shotsList.value = shotsList.value.map(item => item._id === targetId
                ? { ...item, name: newName }
                : item);
        }

        syncSelectedShotIndex(targetId);
        Snackbar.builder({ text: t('ui.messages.renameSuccess'), type: 'success' });
    } catch (error) {
        Snackbar.builder({ text: t('ui.messages.renameFailed'), type: 'error' });
    } finally {
        renameShotTargetId.value = '';
        renameShotInitialName.value = '';
    }
}

async function deleteShot(shotID: string) {
    Dialog.builder({
        headline: '提示',
        text: '确定删除这个分镜吗？',
        actions: [
            { text: '取消' },
            {
                text: '确认',
                click: async () => {
                    const currentShotId = shotsList.value[projectStore.memory.shot]?._id;

                    try {
                        const data = await $fetch<any>(`/api/projects/${projectId}/chapters/${chapterId}/shots/${shotID}`, {
                            method: 'DELETE'
                        });

                        shotsList.value = normalizeShots(data?.shots || []);
                        selectedShotIds.value = selectedShotIds.value.filter(id => id !== shotID);

                        const fallbackId = currentShotId === shotID
                            ? shotsList.value[0]?._id
                            : currentShotId;
                        syncSelectedShotIndex(fallbackId);

                        Snackbar.builder({ text: t('ui.messages.deleteSuccess'), type: 'success' });
                    } catch (error) {
                        Snackbar.builder({ text: t('ui.messages.deleteFailed'), type: 'error' });
                    }
                }
            }
        ]
    });
}

function toggleEditMode() {
    isEditMode.value = !isEditMode.value;
    if (!isEditMode.value) {
        selectedShotIds.value = [];
    }
}

function handleShotClick(index: number) {
    if (isEditMode.value) {
        return;
    }

    projectStore.memory.shot = index;
}

function toggleShotSelected(event: Event, shotId: string) {
    const checked = (event.target as any).checked;
    if (checked) {
        if (!selectedShotIds.value.includes(shotId)) {
            selectedShotIds.value.push(shotId);
        }
    } else {
        selectedShotIds.value = selectedShotIds.value.filter(id => id !== shotId);
    }
}

async function saveShotsOrder() {
    const beforeSelectedId = shotsList.value[projectStore.memory.shot]?._id;

    try {
        const data = await $fetch<any>(`/api/projects/${projectId}/chapters/${chapterId}/shots`, {
            method: 'PUT',
            body: {
                shotIds: shotsList.value.map(item => item._id)
            }
        });

        shotsList.value = normalizeShots(data?.shots || shotsList.value);
        syncSelectedShotIndex(beforeSelectedId);
    } catch (error) {
        Snackbar.builder({ text: t('ui.messages.saveSortFailed'), type: 'error' });
        await fetchShots();
    }
}

async function onDragEnd(event: { oldIndex?: number; newIndex?: number }) {
    if (!isEditMode.value) {
        return;
    }

    if (event.oldIndex === undefined || event.newIndex === undefined || event.oldIndex === event.newIndex) {
        return;
    }

    await saveShotsOrder();
}

async function batchDelete() {
    if (selectedShotIds.value.length === 0) return;

    Dialog.builder({
        headline: '提示',
        text: `确定删除选中的 ${selectedShotIds.value.length} 个分镜吗？`,
        actions: [
            { text: '取消' },
            {
                text: '确认',
                click: async () => {
                    const currentShotId = shotsList.value[projectStore.memory.shot]?._id;

                    try {
                        const data = await $fetch<any>(`/api/projects/${projectId}/chapters/${chapterId}/shots`, {
                            method: 'DELETE',
                            body: {
                                shotIds: selectedShotIds.value
                            }
                        });

                        const deletedSet = new Set(selectedShotIds.value);
                        selectedShotIds.value = [];
                        shotsList.value = normalizeShots(data?.shots || []);

                        const fallbackId = currentShotId && !deletedSet.has(currentShotId)
                            ? currentShotId
                            : shotsList.value[0]?._id;
                        syncSelectedShotIndex(fallbackId);

                        Snackbar.builder({ text: t('ui.messages.batchDeleteSuccess'), type: 'success' });
                    } catch (error) {
                        Snackbar.builder({ text: t('ui.messages.batchDeleteFailed'), type: 'error' });
                    }
                }
            }
        ]
    });
}


// 载入页面时获取分镜列表
onMounted(async () => {
    await fetchShots();
});
</script>

<style scoped>
#page-content {
    position: absolute;
    width: calc(100% - 70px);
    height: calc(100% - 74px);
    left: 70px;
    top: 74px;
    display: flex;
}

s-card {
    box-shadow: 0px 0px;
}

.workarea {
    height: 100%;
    border-radius: 0px;
    border: 1px solid rgb(117, 117, 117);
    margin: 0;
    flex: 1;
    text-align: center;
}

#chapter-scroll {
    height: calc(100% - 40px);
}

#storyboard {
    min-width: 27%;
}

.operate-area {
    width: 100%;
    height: 40px;
    border-bottom: 1px solid rgb(58, 58, 58);
    display: flex;
    align-items: center;
}

.shot {
    width: calc(100% - 20px);
    height: 40px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    border-left: 10px solid transparent;
    border-bottom: 1px solid rgb(58, 58, 58);
    justify-content: space-between;
    transition: border-left 0.2s;
    cursor: pointer;
}

.drag-handle {
    cursor: grab;
    opacity: 0.6;
}

.edit-toggle-btn svg {
    fill: currentColor;
}

.edit-toggle-btn.active-edit {
    color: var(--primary-color);
}

.shot-ghost {
    opacity: 0.4;
}

.shot-chosen {
    background: rgba(148, 205, 255, 0.14);
}

.selected-shot {
    border-left: 10px solid rgb(174, 227, 255);
}

#assets {
    min-width: 40%;
}

#generate {
    min-width: 33%;
}
</style>