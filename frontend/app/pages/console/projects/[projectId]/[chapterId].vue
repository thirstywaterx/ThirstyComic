<template>
    <div id="page-content">
        <s-navigation mode="rail" id="sidebar">
            <NuxtLink v-for="item in sidebarItems" :key="item.link" :to="`/console/projects/${projectId}/${encodeURIComponent(chapterId)}/${item.link}`" class="sidebar-item">
                <s-navigation-item :selected="route.path.split('/').includes(item.link)" :value="item.link">
                    <s-icon name="add" slot="icon" v-html="item.icon"></s-icon>
                    <div slot="text"> {{ $t(item.nameKey) }} </div>
                </s-navigation-item>
            </NuxtLink>
        </s-navigation>

        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
const { $emitter }: any = useNuxtApp();

const sidebarItems = [
    {
        nameKey: 'ui.nav.project.sidebar.generate',
        link: 'generate',
        icon: `
        <svg viewBox="0 -960 960 960">
  <path d="M160-120v-170l527-526q12-12 27-18t30-6q16 0 30.5 6t25.5 18l56 56q12 11 18 25.5t6 30.5q0 15-6 30t-18 27L330-120H160Zm80-80h56l393-392-28-29-29-28-392 393v56Zm560-503-57-57 57 57Zm-139 82-29-28 57 57-28-29ZM560-120q74 0 137-37t63-103q0-36-19-62t-51-45l-59 59q23 10 36 22t13 26q0 23-36.5 41.5T560-200q-17 0-28.5 11.5T520-160q0 17 11.5 28.5T560-120ZM183-426l60-60q-20-8-31.5-16.5T200-520q0-12 18-24t76-37q88-38 117-69t29-70q0-55-44-87.5T280-840q-45 0-80.5 16T145-785q-11 13-9 29t15 26q13 11 29 9t27-13q14-14 31-20t42-6q41 0 60.5 12t19.5 28q0 14-17.5 25.5T262-654q-80 35-111 63.5T120-520q0 32 17 54.5t46 39.5Z"></path>
</svg>
        `,
    },
    {
        nameKey: 'ui.nav.project.sidebar.resources',
        link: 'resources',
        icon: `
        <svg viewBox="0 -960 960 960">
  <path d="M120-160v-160h720v160H120Zm80-40h80v-80h-80v80Zm-80-440v-160h720v160H120Zm80-40h80v-80h-80v80Zm-80 280v-160h720v160H120Zm80-40h80v-80h-80v80Z"></path>
</svg>
        `,
    }
]

const route = useRoute();
const projectId = route.params.projectId;
const chapterId = decodeURIComponent(route.params.chapterId as string);

const { data, error } = await useFetch<any>(`/api/projects/${projectId}`)
if (error.value) {
    
}

let chapterList = ref<string[]>(data.value.data.chapters.map((c: any) => c.name))
// 监听章节列表变化并传给顶栏的选择框
$emitter.emit("sendChapterData", {
    chapterList: chapterList.value,
    nowChapterId: chapterId
});

</script>

<style scoped>
#sidebar {
    position: relative;
    width: 100%;
    height: 100%;
}

#sidebar {
    position: absolute;
    top: 70px;
    left: 0;
    width: 70px;
    height: 100%;
    background-color: var(--sidebar-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 40px;
    border-right: 1px solid rgb(58, 58, 58);
    gap: 20px;
}

.sidebar-item {
 text-decoration: none;
}

#sidebar s-icon-button {
    transform: scale(1.2);
}
</style>