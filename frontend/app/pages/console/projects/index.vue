<template>
    <div id="project">
        <div v-if="displayStore.components.emptyProject" id="empty-sign">
            <s-empty>{{ $t('ui.messages.emptyProject') }}</s-empty>
            <s-button type="filled-tonal" id="create-first-project-btn" @click="createProject()">
                <s-icon slot="start" name="add"></s-icon>
                {{ $t('ui.buttons.createProject') }}
            </s-button>
        </div>

        <div id="project-list" v-if="!displayStore.components.emptyProject || searchWords">
            <s-search :placeholder="$t('ui.placeholders.search')" v-model="searchWords" @input="search">
                <s-icon name="search" slot="start"></s-icon>
                <s-icon-button slot="end" @click="clearSearch" v-show="searchWords">
                    <s-icon name="close"></s-icon>
                </s-icon-button>
            </s-search>

            <nuxt-link to="/console/projects/create">
                <s-icon-button>
                    <s-icon name="add"></s-icon>
                </s-icon-button>
            </nuxt-link>
            <div class="project-item" v-for="project in projectList" :key="project._id">
                <s-divider></s-divider>
                <div class="text-and-more">
                    <nuxt-link class="router-link" :to="`/console/projects/${project._id}/Default/generate`">{{
                        project.name }}</nuxt-link>
                    <s-popup-menu>
                        <s-icon-button slot="trigger">
                            <s-icon name="more_vert"></s-icon>
                        </s-icon-button>
                        <s-popup-menu-item @click="editProject(project._id)">{{ $t('ui.buttons.edit') }}</s-popup-menu-item>
                        <s-popup-menu-item @click="deleteProjectConfirm(project._id)">{{ $t('ui.buttons.delete') }}</s-popup-menu-item>
                    </s-popup-menu>
                </div>
            </div>
            <s-pagination :total="totalPage" :value="page" @change="onPageChange"></s-pagination>
        </div>
        
        <s-dialog :showed="isDeleteDialogOpen">
            <div slot="headline">{{ $t('ui.labels.deleteConfirmTitle') }}</div>
            <div slot="text">{{ $t('ui.messages.deleteConfirmText') }}</div>
            <s-button type="text" slot="action" @click="isDeleteDialogOpen = false">{{ $t('ui.buttons.cancel') }}</s-button>
            <s-button type="text" slot="action" @click="deleteProject">{{ $t('ui.buttons.confirm') }}</s-button>
        </s-dialog>
    </div>
</template>

<script setup lang="ts">
import { useDisplayStore } from '~/stores/useDisplayStore';
import { useRouter } from 'vue-router';
import { Snackbar } from 'sober';
import { useI18n } from 'vue-i18n';
const router = useRouter();
const { t } = useI18n();

const displayStore = useDisplayStore();

function createProject() {
    router.push("/console/projects/create")
}

function editProject(id: string) {
    router.push(`/console/projects/${id}/edit`);
}

let isDeleteDialogOpen = ref(false);
let projectToDelete = ref('');

function deleteProjectConfirm(id: string) {
    projectToDelete.value = id;
    isDeleteDialogOpen.value = true;
}

let page = ref(1);
let projectListShow = ref(false);
let projectList = ref<any[]>([]);
let totalPage = ref(1);
let searchWords = ref("");

function onPageChange(e: any) {
    page.value = e.target.value;
}

function search(e: any) {
    searchWords.value = e.target.value || '';
    page.value = 1;
}

function clearSearch() {
    searchWords.value = "";
    page.value = 1;
}

const { data, pending, error, refresh } = await useFetch<any>(() =>
    `/api/projects/?page=${page.value}&q=${searchWords.value}`
)

watch(data, (newVal) => {
    if (newVal && newVal.total === 0 && !searchWords.value) {
        displayStore.components.emptyProject = true;
        return;
    }
    if (newVal) {
        projectListShow.value = true;
        projectList.value = newVal.data;
        totalPage.value = newVal.total;
        displayStore.components.emptyProject = false
    } else {
        console.error(error.value);
    }
}, { immediate: true });

async function deleteProject() {
    isDeleteDialogOpen.value = false;
    try {
        const response = await fetch(`/api/projects/${projectToDelete.value}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            Snackbar.builder({
                type: 'success',
                text: t('ui.messages.deleteSuccess')
            });
            await refresh();
        } else {
            Snackbar.builder({
                type: 'error',
                text: t('ui.error.deleteFailed')
            });
        }
    } catch (error) {
        Snackbar.builder({
            type: 'error',
            text: t('ui.error.deleteFailed')
        });
    }
}
</script>

<style scoped>
#project {
    position: relative;
    width: 85%;
    display: flex;
}

#project-list {
    position: absolute;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    width: 70%;
    margin-top: -250px;
}

s-empty {
    margin-top: -100px;
}

#empty-sign {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

s-divider {
    position: relative;
    left: -20px;
    margin-bottom: 20px;
}

s-pagination {
    margin-top: 20px;
    margin-left: -20px;
}

.router-link {
    color: inherit;
}

.project-item {
    width: 100%;
}

.text-and-more {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 50px;
}

#create-first-project-btn {
    margin-top: -20px;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
}
</style>