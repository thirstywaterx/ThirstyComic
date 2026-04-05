import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProjectStore = defineStore("project", () => {
  const memory = ref(
    {
        "shot": ref<number>(-1),
    }
  )

  return {
    memory
  }
},{
  persist:true
}
);