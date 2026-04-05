<template>
    <s-drawer id="drawer">

        <!-- 章节增加的对话框 -->
        <DialogInput :showed="addChapterDialogVisible" :maxLength="20" :inputLabel="$t('ui.labels.chapterName')" @updateValue="handleAddChapterData">
            <template #headline>{{ $t('ui.messages.addChapter') }}</template>
            <template #text>{{ $t('ui.messages.addChapterDes') }}</template>
        </DialogInput>

        <div slot="start">
            <s-menu style="max-width: 280px; margin: 0">
                <div slot="label" id="side-nav-title">{{ $t('ui.nav.menu') }}</div>
                <div id="phone-options">
                    <s-button type="outlined" class="nav-option-phone" v-for="item in navOptions" :key="item.nameKey">
                        {{ $t(item.nameKey) }}
                    </s-button>
                </div>
                <nuxt-link :to="item.path" v-for="item in menuItems" :key="item.path">
                    <s-menu-item :checked="route.path.startsWith(item.path)">
                        <s-icon slot="start" v-html="item.icon"></s-icon>
                        {{ $t(item.nameKey) }}
                    </s-menu-item>
                </nuxt-link>
            </s-menu>
        </div>

        <div id="topbar">
            <s-icon-button slot="navigation" style="margin-left: 10px;"
                onclick="document.querySelector('#drawer').toggle()">
                <s-icon name="menu"></s-icon>
            </s-icon-button>
            <nuxt-link to="/">
                <img src="/trs.svg" alt="">
            </nuxt-link>
            <nuxt-link to="/">
                <h1>THIRSTYCOMIC</h1>
            </nuxt-link>

            <div id="chapter-choose"
                v-if="route.path.startsWith('/console/projects/') && route.path !== '/console/projects/create'">
                
                <!-- 章节选择框 -->
                <s-picker :label="$t('ui.nav.chapter')" style="margin-left: 30px;" :value="nowChapterId"
                    @change="jumpChapter">
                    <s-picker-item v-for="item in chapterList" :key="item" :value="item">
                        {{ item }}
                    </s-picker-item>
                </s-picker>

                <s-icon-button class="chapter-operation" @click="addChapter">
                    <s-icon name="add"></s-icon>
                </s-icon-button>

                <s-icon-button class="chapter-operation" @click="deleteChapter">
                    <s-icon>
                        <svg viewBox="0 -960 960 960">
                            <path
                                d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z">
                            </path>
                        </svg>
                    </s-icon>
                </s-icon-button>
            </div>

            <div id="nav-options">
                <nuxt-link v-for="items in navOptions" :key="items.nameKey" :to="items.path"
                    class="nav-option-laptop"><s-ripple>{{ $t(items.nameKey) }}</s-ripple></nuxt-link>
            </div>
        </div>

        <s-scroll-view style="display: flex; justify-content: center; align-items: center;">
            <slot name="page-content"></slot>
        </s-scroll-view>
    </s-drawer>
</template>

<script setup lang="ts">
const route = useRoute()
const { $emitter }: any = useNuxtApp();
import { debounce } from 'lodash-es'
import { Dialog, Snackbar } from 'sober'
import { useI18n } from '#imports'

const { t } = useI18n()

const menuItems = [
    {
        nameKey: 'ui.nav.menuContent.projects',
        icon: `<svg viewBox="0 -960 960 960">
        <path d="M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-40-343 237-137-237-137-237 137 237 137ZM160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11L160-252Zm320-228Z"></path></svg>`,
        path: '/console/projects'
    },
    {
        nameKey: 'ui.nav.menuContent.settings',
        icon: `
        <svg viewBox="0 -960 960 960">
        <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"></path></svg>
        `,
        path: '/console/settings/general'
    },
]

const navOptions = [
    {
        nameKey: 'ui.nav.console',
        path: '/console'
    },
    {
        nameKey: 'ui.nav.documents',
        path: '/documents'
    }
]

let chapterList = ref<string[]>([])
let nowChapterId = ref<string>()

// 监听章节列表变化并传给顶栏的选择框
$emitter.on("sendChapterData", (recievedChapterData: { chapterList: string[]; nowChapterId: string }) => {
    if (recievedChapterData.chapterList && recievedChapterData.chapterList.length > 0) {
        chapterList.value = recievedChapterData.chapterList;
    }
    nowChapterId.value = recievedChapterData.nowChapterId;
});

let addChapterDialogVisible = ref(false);

async function handleAddChapterData(chapterName: any) {
    addChapterDialogVisible.value = false;
    if (!chapterName) return;

    try {
        const data = await $fetch<any>(`/api/projects/${route.params.projectId}/chapters`, {
            method: 'POST',
            body: { name: chapterName }
        });

        // 清除由于获取文章造成的 Nuxt 请求缓存，以保证重新挂载或请求时能拿到最新章节数
        clearNuxtData();

        if (data.success) {
            chapterList.value = data.data;

            nowChapterId.value = chapterName;
            const parts = route.path.split('/');
            if (parts.length >= 5 && parts[1] === 'console' && parts[2] === 'projects') {
                parts[4] = encodeURIComponent(chapterName);
                navigateTo(parts.join('/'));
            }
        }
    } catch (error: any) {
        let errCode = error.data?.error || error.response?._data?.error || 'UNKNOWN_ERROR';
        Snackbar.builder({
            type: 'error',
            text: t(`ui.error.requestError.${errCode}`)
        });
    }
}

async function handleAddChapter() {
    addChapterDialogVisible.value = false;
    await nextTick();
    addChapterDialogVisible.value = true;
}

const addChapter = debounce(handleAddChapter, 200);

async function handleDeleteChapter() {
    if (!nowChapterId.value || !chapterList.value || chapterList.value.length <= 1) {
        // 如果没有当前章节或者只剩下 1 章就不允许删除
        Dialog.builder({ headline: t('ui.messages.notice'), text: t('ui.messages.deleteChapterLimit'), actions: [{ text: t('ui.buttons.confirm') }] });
        return;
    }

    Dialog.builder({
        headline: t('ui.messages.notice'),
        text: t('ui.messages.deleteChapter'),
        actions: [{ text: t('ui.buttons.cancel') }, {
            text: t('ui.buttons.confirm'),
            click: async () => {
                try {
                    const res = await $fetch<any>(`/api/projects/${route.params.projectId}/chapters/${encodeURIComponent(nowChapterId.value!)}`, {
                        method: 'DELETE'
                    });

                    if (res.success) {
                        // 清除接口缓存，使各详情页数据能在路由切换时实时更新
                        clearNuxtData();

                        chapterList.value = res.data; // 更新后端返回的最新章节列表

                        // 跳回上一章，或者如果被删的是第一章就挑现在的第一个
                        let targetChapterName = res.data[res.data.length - 1]; // 默认跳最后
                        nowChapterId.value = targetChapterName;
                        const parts = route.path.split('/');
                        if (parts.length >= 5 && parts[1] === 'console' && parts[2] === 'projects') {
                            parts[4] = encodeURIComponent(targetChapterName);
                            navigateTo(parts.join('/'));
                        }
                    }
                } catch (error: any) {
                    let errCode = error.data?.error || error.response?._data?.error || 'UNKNOWN_ERROR';
                    Snackbar.builder({
                        type: 'error',
                        text: t(`ui.error.requestError.${errCode}`)
                    });
                }
            }
        }]
    });
}

const deleteChapter = debounce(handleDeleteChapter, 200);

function jumpChapter(e: any) {
    const newChapterId = e.target.value;
    if (!newChapterId) return;
    nowChapterId.value = newChapterId;
    const parts = route.path.split('/');
    if (parts.length >= 5 && parts[1] === 'console' && parts[2] === 'projects') {
        parts[4] = encodeURIComponent(newChapterId);
        navigateTo(parts.join('/'));
    }
}
</script>

<style scoped>
#drawer {
    height: 100vh;
}

#topbar {
    width: 100vw;
    height: 70px;
    display: flex;
    align-items: center;
    padding-top: 4px;
    border-bottom: 1px solid grey;
    background-color: var(--s-color-background);
    z-index: 200;
}

img {
    width: 50px;
    margin-left: 20px;
}

h1 {
    margin-left: 20px;
    font-size: 24px;
}

#nav-options {
    margin-left: auto;
    padding: 15px;
    display: flex;
    gap: 15px;
}

.nav-option-phone {
    width: 100px;
}

#phone-options {
    width: 280px;
    margin-top: 10px;
    margin-bottom: 15px;
    display: none;
}

@media screen and (max-width: 395px) {
    .nav-option-laptop {
        display: none;
    }

    #phone-options {
        display: flex;
        gap: 8px;
    }

    .nav-option-phone {
        margin-left: 10px;
    }

}

#side-nav-title {
    margin-top: 20px;
}

@media screen and (max-width: 1030px) {
    #side-nav-title {
        margin-top: 90px;
    }
}

a {
    text-decoration: none;
    color: inherit;
}

s-ripple {
    padding: 5px 10px;
    border-radius: 5px;
}

s-picker {
    margin-left: 30px;
    margin-right: 10px;
}

.chapter-operation {
    width: 45px;
    height: 45px;
}

#chapter-choose {
    display: flex;
}
</style>
