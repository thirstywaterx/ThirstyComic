<template>
    <div id="settingsContent">
        <s-tab id="tabs">
            <NuxtLink v-for="items in tabItems" :key="items.nameKey" :to="items.to" style="text-decoration: none;">
                <s-tab-item :selected="true">
                    <div slot="text">{{ t(items.nameKey) }}</div>
                </s-tab-item>
            </NuxtLink>
        </s-tab>
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '#imports'

const { t } = useI18n()

const tabItems = computed(() => ({
    general: {
        nameKey: 'ui.tabItems.settings.general',
        to: '/console/settings/general'
    }
}))
</script>

<style scoped>
#settingsContent {
    position: relative;
    width: 90%;
    height: 100%;
}

#tabs {
    position: relative;
    margin-top: 20px;
    margin-bottom: 30px;
}
</style>
