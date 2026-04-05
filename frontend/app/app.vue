<script setup lang="ts">
import { onMounted } from 'vue';
import { usePerferencesStore } from '~/stores/usePerferencesStore';
import { useI18n } from '#imports';

const perferencesStore = usePerferencesStore();
const { setLocale } = useI18n();

onMounted(() => {
  if (perferencesStore.language) {
    setLocale(perferencesStore.language);
  }
});
</script>

<template>
  <s-page :theme="perferencesStore.theme">
    <Topbar>
      <template id="main-content" #page-content>
        <NuxtPage />
      </template>
    </Topbar>

  </s-page>
</template>

<style scoped>
html,
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

s-page {
  position: absolute;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  --sidebar-color: rgb(242, 242, 242);
}

s-page[dark] {
    --sidebar-color: #191c1e;
}

#main-content {
  margin-top: 90px;
  display: flex;
  justify-content: center;
}
</style>
