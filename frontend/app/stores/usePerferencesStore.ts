import { defineStore } from "pinia";
import { ref } from "vue";

type Theme = "dark" | "light" | "auto";

export const usePerferencesStore = defineStore("perferences", () => {
    const theme = ref<Theme>("dark");
    const language = ref("en");

    return {
        theme,
        language
    }
}, {
    persist: true
}
)