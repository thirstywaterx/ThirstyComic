<template>
    <div id="create-project">

        <Breadcrumbs id="breadcrumb" />

        <s-text-field v-model="projectName" :label="$t('ui.labels.projectName')" :maxLength="60"
            :countered="true"></s-text-field>

        <s-text-field type="multiline" v-model="projectDescription" :label="$t('ui.labels.projectDescription')"
            :maxLength="400" :countered="true">
        </s-text-field>


        <div id="operate-buttons">
            <s-button type="outlined" @click="router.push('/console/projects')">{{ $t('ui.buttons.cancel') }}</s-button>
            <s-button @click="updateProject">{{ $t('ui.buttons.save') }}</s-button>
        </div>

    </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es';
import { Snackbar } from 'sober';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const router = useRouter();
const route = useRoute();

let projectName = ref('');
let projectDescription = ref('');

onMounted(async () => {
    try {
        const data = await $fetch<any>(`/api/projects/${route.params.id}`);
        if(data && data.data) {
            projectName.value = data.data.name || '';
            projectDescription.value = data.data.description || '';
        }
    } catch(e) {
        console.error(e);
        Snackbar.builder({
            type: 'error',
            text: t('ui.error.requestError.fetchFailed')
        });
    }
});

const handleUpdate = () => {
    if (projectName.value.trim() === '' || projectDescription.value.trim() === '') {
        Snackbar.builder({
            type: 'warning',
            text: t('ui.error.projectInfoRequired')
        })
        return;
    }

    fetch(`/api/projects/${route.params.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: projectName.value,
            description: projectDescription.value
        })
    })
        .then(async response => {
            const data = await response.json();
            // Promise 失败，并把包含错误信息的 data 传递到 catch 块
            if (!response.ok) {
                return Promise.reject(data);
            }
            return data;
        })
        .then(data => {
            Snackbar.builder({
                type: 'success',
                text: t('ui.messages.projectUpdated')
            });
            router.push(`/console/projects`);
        })
        .catch(error =>
            Snackbar.builder({
                type: 'error',
                text: t(`ui.error.requestError.${error.error}`) || t('ui.error.updateFailed')
            })
        );
}

const updateProject = debounce(handleUpdate, 200);

onBeforeUnmount(() => {
    updateProject.cancel();
})
</script>

<style scoped>
#create-project {
    position: relative;
    width: 90%;
    height: 100%;
}

#breadcrumb {
    position: relative;
    top: 20px;
    margin-bottom: 50px;
}

s-text-field {
    width: 80%;
    max-width: 500px;
    margin-bottom: 25px;
    display: block;
}

s-text-field:nth-child(3) {
    min-height: 180px;
}

#operate-buttons {
    width: 200px;
    margin-top: 200px;
    margin-left: auto;
    margin-right: 40px;
    display: flex;
    gap: 15px;
}
</style>