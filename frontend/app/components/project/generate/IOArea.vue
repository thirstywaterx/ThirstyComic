<template>
    <div class="io-area-container">
        <s-text-field id="prompt-field" placeholder="Prompts......" type="multiline" v-model.lazy="prompt">
            <div id="prompt-buttons" slot="end" @click="generate">
                <s-icon-button v-if="!isGenerating">
                    <s-icon>
                        <svg viewBox="0 -960 960 960">
                            <path
                                d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z">
                            </path>
                        </svg>
                    </s-icon>
                </s-icon-button>

                <s-circular-progress :indeterminate="true" v-if="isGenerating"></s-circular-progress>
            </div>

        </s-text-field>
        <div id="config">
            <div class="option">
                <p>Temperature</p>
                <s-slider :min="0" :max="200" v-model="tempertureSlider"></s-slider>
                <s-text-field type="number" step="0.01" v-model="temperture"></s-text-field>
            </div>

            <div class="row">
                <div class="option">
                    <p>Aspect Ratio</p>
                    <s-picker label="Ratio" :value="aspectRatio" @change="aspectRatio = ($event.target as any).value">
                        <s-picker-item v-for="item in aspectRatioConfig.pro" :value="item">{{ item }}</s-picker-item>
                    </s-picker>
                </div>

                <div class="option">
                    <p>Image Size</p>
                    <s-picker label="Size" :value="imageSize" @change="imageSize = ($event.target as any).value">
                        <s-picker-item v-for="item in imageSizeConfig" :value="item">{{ item }}</s-picker-item>
                    </s-picker>
                </div>

                <div class="option">
                    <s-checkbox :checked="inheritPrevImage" @change="inheritPrevImage = ($event.target as any).checked">{{ $t('ui.labels.inheritContext') }}</s-checkbox>
                </div>
            </div>
        </div>

        <div id="output">
            <s-scroll-view>
                <s-skeleton v-if="isGenerating" class="skeleton-image"></s-skeleton>
                <div v-for="path in [...outputPath].reverse()" :key="path" class="result-image-wrapper" @click="selectedImagePath = path">
                    <img :src="'/' + path" class="result-image" :class="{ 'selected': selectedImagePath === path }" />
                    <s-icon v-if="selectedImagePath === path" class="selected-icon">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    </s-icon>
                </div>
            </s-scroll-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Snackbar } from 'sober';
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useI18n } from '#imports';

const route = useRoute();
const { t } = useI18n();
const projectId = route.params.projectId as string;
const chapterId = route.params.chapterId as string;

const inheritPrevImage = ref(false);

onMounted(() => {
    inheritPrevImage.value = localStorage.getItem('inheritPrevImage') === 'true';
});

watch(inheritPrevImage, (val) => {
    localStorage.setItem('inheritPrevImage', String(val));
});

const aspectRatioConfig = {
    pro: [
        "1:1",
        "2:3",
        "3:2",
        "3:4",
        "4:3",
        "4:5",
        "5:4",
        "9:16",
        "16:9",
        "21:9"
    ],
    flash: [
        "1:1",
        "1:4",
        "1:8",
        "2:3",
        "3:2",
        "3:4",
        "4:1",
        "4:3",
        "4:5",
        "5:4",
        "8:1",
        "9:16",
        "16:9",
        "21:9"
    ]
}

let imageSizeConfig = ref(['1k', '2k', '4k'])

let aspectRatio = ref('1:1')
let imageSize = ref('1k')
let outputPath = ref<string[]>([])
let selectedImagePath = ref('')

const props = defineProps<{
    shotId: string | number;
}>();

const prompt = ref('');
const temperture = ref(1);
const isGenerating = ref(false);
const generationStatus = ref<'idle' | 'generating' | 'completed' | 'failed'>('idle');
const pollingTimer = ref<ReturnType<typeof setInterval> | null>(null);
const generationRequestInFlightFor = ref<string | number | null>(null);

function stopPolling() {
    if (pollingTimer.value) {
        clearInterval(pollingTimer.value);
        pollingTimer.value = null;
    }
}

function startPolling() {
    if (pollingTimer.value || !props.shotId) {
        return;
    }

    pollingTimer.value = setInterval(async () => {
        await fetchShotDetail(props.shotId);
    }, 2000);
}

async function fetchShotDetail(shotId: string | number) {
    if (!shotId) {
        return;
    }

    try {
        const data = await $fetch<any>(`/api/projects/${projectId}/chapters/${chapterId}/shots/${shotId}`);
        if (!data?.shot) {
            return;
        }

        prompt.value = data.shot.prompt || '';
        temperture.value = data.shot.temperature ?? 1;
        aspectRatio.value = data.shot.aspectRatio || '1:1';
        imageSize.value = data.shot.imageSize || '1k';
        outputPath.value = Array.isArray(data.shot.outputPath) ? data.shot.outputPath : (data.shot.outputPath ? [data.shot.outputPath] : []);
        selectedImagePath.value = data.shot.selectedImagePath || '';

        const backendStatus = (data.shot.generationStatus || 'idle') as 'idle' | 'generating' | 'completed' | 'failed';
        const hasFinishedAt = !!data.shot.generationFinishedAt;
        generationStatus.value = backendStatus;
        if (generationRequestInFlightFor.value !== shotId && generationStatus.value === 'generating' && hasFinishedAt) {
            generationStatus.value = 'completed';
        }
        if (generationRequestInFlightFor.value === shotId && generationStatus.value === 'idle' && outputPath.value.length === 0) {
            generationStatus.value = 'generating';
        }
        isGenerating.value = generationStatus.value === 'generating';

        if (isGenerating.value) {
            startPolling();
        } else {
            stopPolling();
        }
    } catch (err) {
        console.error('fetch shot error', err);
    }
}

watch(() => props.shotId, async (newVal) => {
    if (newVal) {
        await fetchShotDetail(newVal);
    } else {
        stopPolling();
    }
}, { immediate: true });

watch([prompt, temperture, aspectRatio, imageSize, outputPath, selectedImagePath], async () => {
    if (!props.shotId) return;
    try {
        await $fetch<any>(`/api/projects/${projectId}/chapters/${chapterId}/shots/${props.shotId}`, {
            method: 'PUT',
            body: {
                prompt: prompt.value,
                temperature: temperture.value,
                aspectRatio: aspectRatio.value,
                imageSize: imageSize.value,
                outputPath: outputPath.value,
                selectedImagePath: selectedImagePath.value
            }
        });
    } catch (err) {
        console.error('update shot error', err);
    }
}, { deep: true });

watch(temperture, (newValue) => {
    const num = Number(newValue);
    if (Number.isNaN(num)) {
        temperture.value = 1;
    } else {
        temperture.value = Math.max(0, Math.min(2, num));
    }
});

const tempertureSlider = computed({
    get() {
        return temperture.value * 100;
    },
    set(value) {
        if (temperture.value == null) {
            temperture.value = 0;
        }
        temperture.value = value / 100;
    }
});

async function generate() {
    if (isGenerating.value) {
        return;
    }

    const currentShotId = props.shotId;

    let prevImage = '';
    if (inheritPrevImage.value) {
        try {
            const data = await $fetch<any>(`/api/projects/${projectId}/chapters/${chapterId}/shots`);
            const shots = data?.shots || [];
            const currentIndex = shots.findIndex((s: any) => s._id === currentShotId);
            
            if (currentIndex > 0) {
                const prevShot = shots[currentIndex - 1];
                const prevShotDetail = await $fetch<any>(`/api/projects/${projectId}/chapters/${chapterId}/shots/${prevShot._id}`);
                prevImage = prevShotDetail?.shot?.selectedImagePath || '';
            }

            if (!prevImage) {
                Snackbar.builder({ text: t('ui.messages.prevImageNotSelected'), type: 'warning' });
                return;
            }
        } catch (error) {
            console.error('Failed to get previous shot image', error);
            Snackbar.builder({ text: t('ui.messages.fetchPrevImageFailed'), type: 'error' });
            return;
        }
    }

    if (currentShotId !== props.shotId) return; // double check

    isGenerating.value = true;
    generationRequestInFlightFor.value = currentShotId;
    generationStatus.value = 'generating';
    startPolling();
    try {
        const res = await $fetch<any>('/api/generation/', {
            method: 'POST',
            body: {
                shotId: currentShotId,
                prompt: prompt.value,
                temperature: temperture.value,
                aspectRatio: aspectRatio.value,
                imageSize: imageSize.value,
                prevImage: prevImage
            }
        }
        );
        if (currentShotId === props.shotId) {
            if (res && res.imageUrls && res.imageUrls.length > 0) {
                outputPath.value.push(...res.imageUrls); // update result and trigger watcher
            } else if (res && res.imageUrl) {
                outputPath.value.push(res.imageUrl);
            }
            generationStatus.value = 'completed';
        }
    } catch (error) {
        if (currentShotId === props.shotId) {
            generationStatus.value = 'failed';
        }
        console.error('generate failed:', error);
    } finally {
        if (generationRequestInFlightFor.value === currentShotId) {
            generationRequestInFlightFor.value = null;
        }
        if (currentShotId === props.shotId) {
            await fetchShotDetail(currentShotId);
        }
    }
}

onBeforeUnmount(() => {
    stopPolling();
});
</script>

<style scoped>
.io-area-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

#prompt-field {
    width: 100%;
    min-height: 200px;
    border-top: 0px;
}

#config {
    padding-bottom: 20px;
    border-bottom: 1px solid rgb(117, 117, 117);
}

#config .row {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
}

#config .option {
    margin-left: 20px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    padding-right: 13px;
    gap: 15px;
}

#config .option s-slider {
    width: 80%;
}

#config .option s-text-field {
    max-width: 85px;
}

#prompt-buttons {
    position: relative;
    display: flex;
    align-items: center;
    top: 70px;
    right: 5px;
}

s-circular-progress {
    width: 24px;
    height: 24px;
    margin-right: 5px;
    color: rgb(141, 202, 255);
}

#output {
    width: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
}

#output s-skeleton {
    width: 100px;
    height: 100px;
    border-radius: 4px;
}

#output s-scroll-view {
    width: 100%;
    height: 100%;
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;
    gap: 15px;
    flex-wrap: wrap;
}

#output img {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    object-fit: cover;
    object-position: center;
}

.result-image-wrapper {
    position: relative;
    width: 100px;
    height: 100px;
    cursor: pointer;
}

.result-image-wrapper .selected {
    border: 3px solid rgb(141, 202, 255);
    box-sizing: border-box;
}

.selected-icon {
    position: absolute;
    bottom: 5px;
    right: 5px;
    color: white;
    background-color: rgb(141, 202, 255);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    padding: 2px;
}
</style>