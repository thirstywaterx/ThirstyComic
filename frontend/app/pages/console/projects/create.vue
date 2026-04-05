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
            <s-button @click="createProject">{{ $t('ui.buttons.createProject') }}</s-button>
        </div>

    </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es';
import { Snackbar } from 'sober'

const router = useRouter();

let projectName = ref('');
let projectDescription = ref('');

const handleCreate = () => {
    if (projectName.value.trim() === '' || projectDescription.value.trim() === '') {
        Snackbar.builder({
            type: 'warning',
            text: $t('ui.error.projectInfoRequired')
        })
        return;
    }

    fetch('/api/projects', {
        method: 'POST',
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
                text: $t('ui.messages.projectCreated')
            });
            router.push(`/console/projects/${data.data._id}/Default/generate`);
        })
        .catch(error =>
            Snackbar.builder({
                type: 'error',
                text: $t(`ui.error.requestError.${error.error}`)
            })
        );
}

const createProject = debounce(handleCreate, 200);

onBeforeUnmount(() => {
    createProject.cancel();
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