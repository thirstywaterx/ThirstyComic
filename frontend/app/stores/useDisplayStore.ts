import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDisplayStore = defineStore("display", () => {
  const components = ref(
    {
      "emptyProject": true
    }
  )

  const breadcrumbs = ref({
    "notDisplayed": ["console", "documents"],
  })
  return {
    components,
    breadcrumbs
  }
},{
  persist:true
}
);