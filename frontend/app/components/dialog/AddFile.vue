<template>
    <s-dialog :showed="showed" size="full">
        <s-segmented-button :value="selectedAssetGroup" @change="handleGroupChange">
            <s-segmented-button-item v-for="item in assetGroup" :key="item" :value="item">
                {{ item }}
            </s-segmented-button-item>
        </s-segmented-button>

        <s-scroll-view>
            <div id="resources-container">
                <div class="cards" v-for="item in resourcesList" :key="item.id">
                    <s-card type="outlined" class="asset-card" :clickable="false">
                        <div slot="image"><img v-if="item.images?.[0]?.url" :src="'/' + item.images[0].url"></div>
                        <div slot="headline">{{ item.name }}</div>
                        <div slot="text">{{ item.description }}</div>
                        <s-checkbox :checked="item.selected" @change="handleChange($event, item)">{{ $t('ui.buttons.confirm') }}</s-checkbox>
                    </s-card>
                </div>
            </div>
        </s-scroll-view>

        <s-button slot="action" type="text">{{ $t('ui.buttons.cancel') }}</s-button>
        <s-button slot="action" type="text" @click="sendSelectedImages">{{ $t('ui.buttons.confirm') }}</s-button>
    </s-dialog>
</template>

<script setup lang="ts">
const route = useRoute();

const assetGroup = ['Character', 'Background', 'Object', 'Others'];

const emit = defineEmits(['choseFile'])

const props = defineProps({
    showed: {
        type: Boolean,
        default: false
    },
    group: {
        type: String,
        default: 'Character'
    }
})

const selectedAssetGroup = ref('Character');

function handleGroupChange(e: Event) {
    selectedAssetGroup.value = (e.target as any).value;
}

const { data } = await useFetch<any>(() => `/api/projects/${route.params.projectId}/resources/${selectedAssetGroup.value.toLowerCase()}`, {
    method: 'GET'
});

const resourcesList = computed(() => data.value?.resources || []);

const selectedImages = ref<Record<string, any[]>>(
    {
        character: [] as any[],
        background: [] as any[],
        object: [] as any[],
        others: [] as any[]
    }
)

function handleChange(event: Event, item: any) {
    const target = event.target as HTMLInputElement;
    item.selected = target.checked;
    selectImage(item, item.selected);
}

function selectImage(item: any, selected: boolean) {
    if (!item || !item.images || item.images.length === 0) {
        
        return;
    }

    const key = props.group.toLowerCase();
    if (!selectedImages.value[key]) {
        selectedImages.value[key] = [];
    }

    if (selected) {
        selectedImages.value[key].push(item);
    } else {
        selectedImages.value[key] = selectedImages.value[key].filter((i) => i._id !== item._id && i.name !== item.name);
    }
}

watch(() => props.showed, (newVal) => {
    if (newVal) {
        // 同步外部传入的类型
        selectedAssetGroup.value = props.group;
        // 清空已选图片记录
        selectedImages.value = {
            character: [],
            background: [],
            object: [],
            others: []
        };
        // 清空当前列表中的选中状态
        if (data.value && data.value.resources) {
            data.value.resources.forEach((item: any) => {
                item.selected = false;
            });
        }
    }
});

function sendSelectedImages() {
    emit('choseFile', selectedImages.value)
}
</script>

<style scoped>
s-segmented-button {
    position: absolute;
    left: 30px;
    top: 25px;
    z-index: 2;
}

s-scroll-view {
    position: absolute;
    width: 100%;
    height: 78%;
    left: 0;
    padding-top: 80px;
}

#resources-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 20px;
}

.asset-card {
    width: 300px;
    min-height: 300px;
    margin: 20px;
}

.asset-card img {
    width: 100%;
    height: 130px;
    object-fit: cover;
    object-position: center;
}

.asset-card div[slot="text"] {
    margin-bottom: 40px;
    text-align: left;
}

.asset-card div[slot="headline"] {
    text-align: left;
}

s-checkbox {
    position: absolute;
    right: 25px;
    bottom: 15px;
}
</style>