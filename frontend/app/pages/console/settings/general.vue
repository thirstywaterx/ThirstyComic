<template>
    <div>
        <SettingsSection :sections="themeSections" :selected="perferencesStore.theme"
            :pickerLabel="t('ui.settings.adjustable.theme')" @sendSlection="handleThemeSelection">
            <template #setting-name>
                {{ $t('ui.settings.adjustable.theme') }}
            </template>
        </SettingsSection>
        <div style="height: 20px;"></div>
        <SettingsSection :sections="languageSections" :selected="perferencesStore.language"
            :pickerLabel="t('ui.settings.adjustable.language')" @sendSlection="handleLanguageSelection">
            <template #setting-name>
                {{ $t('ui.settings.adjustable.language') }}
            </template>
        </SettingsSection>
        <div style="height: 20px;"></div>
        <SettingsInput :initialValue="baseURL" @sendTexts="handleBaseURL" type="password">
            <template #setting-name>
                {{ $t('ui.settings.adjustable.baseURL') }}
            </template>
        </SettingsInput>
        <div style="height: 20px;"></div>
        <SettingsInput :initialValue="apiKey" @sendTexts="handleAPIKey" type="password">
            <template #setting-name>
                {{ $t('ui.settings.adjustable.apikey') }}
            </template>
        </SettingsInput>
        <div style="height: 20px;"></div>
        <SettingsInput :initialValue="modelId" @sendTexts="handleModelId" type="text">
            <template #setting-name>
                {{ $t('ui.settings.adjustable.modelId') }}
            </template>
        </SettingsInput>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePerferencesStore } from '~/stores/usePerferencesStore'
import { useI18n } from '#imports'
import { Snackbar } from 'sober'

const perferencesStore = usePerferencesStore()
const { t, setLocale } = useI18n()

//主题选项
const themeSections = computed(() => [
    { value: "light", label: t('ui.settings.options.themeSections.light') },
    { value: "dark", label: t('ui.settings.options.themeSections.dark') },
]);

//语言选项
const languageSections = computed(() => [
    { value: "en", label: t('ui.settings.options.languageSections.en') },
    { value: "zh", label: t('ui.settings.options.languageSections.zh') },
]);

const handleThemeSelection = (value: any) => {
    perferencesStore.theme = value;
}

const handleLanguageSelection = (value: any) => {
    perferencesStore.language = value;
    setLocale(value);
}

const baseURL = ref('')
const apiKey = ref('')
const modelId = ref('gemini-3.1-flash-image-preview')

const fetchSettings = async () => {
    try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        if (data.code === 200 && data.data) {
            baseURL.value = data.data.baseURL || ''
            apiKey.value = data.data.apiKey || ''
            modelId.value = data.data.modelId || 'gemini-3.1-flash-image-preview'
        }
    } catch (e) {
        console.error(e)
    }
}

let timeoutId: any = null;
const saveSettings = async (updates: any) => {
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        })
        const data = await response.json()
        if (data.code === 200) {
            Snackbar.builder({ text: t('ui.messages.updateSuccess'), type: 'success' })
        }
    } catch(e) {
        console.error(e)
        Snackbar.builder({ text: t('ui.messages.updateFail'), type: 'error' })
    }
}

const handleBaseURL = (value: string) => {
    baseURL.value = value;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        saveSettings({ baseURL: value })
    }, 500)
}

const handleAPIKey = (value: string) => {
    apiKey.value = value;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        saveSettings({ apiKey: value })
    }, 500)
}

const handleModelId = (value: string) => {
    modelId.value = value;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        saveSettings({ modelId: value })
    }, 500)
}

onMounted(() => {
    fetchSettings()
})

</script>

<style scoped></style>
