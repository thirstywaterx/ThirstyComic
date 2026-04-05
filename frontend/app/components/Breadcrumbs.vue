<template>
    <nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol class="trail">
            <li v-for="(item, index) in resolvedItems" :key="item.labelKey" class="crumb">
                <NuxtLink
                    v-if="item.to && !displayStore.breadcrumbs.notDisplayed?.includes(item.to) && index !== resolvedItems.length - 1"
                    :to="item.to"
                    class="crumb-link"
                >
                    {{ item.label }}
                </NuxtLink>
                <span v-else class="crumb-current" :aria-current="index === resolvedItems.length - 1 ? 'page' : undefined">
                    {{ item.label }}
                </span>
                <span v-if="index !== resolvedItems.length - 1" class="separator">/</span>
            </li>
        </ol>
    </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const displayStore = useDisplayStore();

type BreadcrumbInput = {
    labelKey: string;
    to?: string;
    fallback?: string;
};

const props = withDefaults(defineProps<{ items?: BreadcrumbInput[] }>(), {
    items: () => []
});

const route = useRoute();
const { t } = useI18n();


const inferredItems = computed(() => {
    if (props.items.length) {
        return props.items;
    }

    const segments = route.path.split('/').filter(Boolean);

    return segments.map((segment, index) => {

        const to = '/' + segments.slice(0, index + 1).join('/');
        return {
            labelKey: `ui.nav.breadcrumbs.${segment}`,
            fallback: segment.replace(/[-_]/g, ' '),
            to: index === segments.length - 1 ? undefined : to
        };
    });
});

const resolvedItems = computed(() =>
    inferredItems.value.map((item) => ({
        ...item,
        label: translate(item.labelKey, item.fallback)
    }))
);

function translate(key: string, fallback?: string) {
    const translated = t(key);
    if (translated === key) {
        return fallback ?? key.split('.').pop() ?? key;
    }
    return translated;
}
</script>

<style scoped>
.breadcrumbs {
    width: 100%;
    padding: 8px 0;
    color: var(--s-color-outline);
    font-size: 13px;
}

.trail {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 4px;
}

.crumb {
    display: flex;
    align-items: center;
    gap: 4px;
}

.crumb-link {
    text-decoration: none;
    color: inherit;
    font-weight: 500;
}

.crumb-link:hover {
    text-decoration: underline;
}

.crumb-current {
    font-weight: 600;
}

.separator {
    color: var(--s-color-border, #c7c7c7);
}
</style>