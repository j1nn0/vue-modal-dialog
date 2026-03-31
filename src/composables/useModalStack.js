import { computed, ref } from 'vue';

const BASE_Z_INDEX = 1000;
const Z_INDEX_STEP = 10;

const stack = ref([]);

export function useModalStack() {
  const id = Symbol();

  const index = computed(() => stack.value.indexOf(id));
  const isTop = computed(() => stack.value.length > 0 && stack.value[stack.value.length - 1] === id);

  const backdropZIndex = computed(() => BASE_Z_INDEX + index.value * Z_INDEX_STEP);
  const dialogZIndex = computed(() => BASE_Z_INDEX + index.value * Z_INDEX_STEP + 1);

  const push = () => {
    stack.value = [...stack.value, id];
    if (stack.value.length === 1 && typeof document !== 'undefined') {
      document.body.classList.add('vue-modal-open');
    }
  };

  const pop = () => {
    stack.value = stack.value.filter((item) => item !== id);
    if (stack.value.length === 0 && typeof document !== 'undefined') {
      document.body.classList.remove('vue-modal-open');
    }
  };

  return { push, pop, isTop, backdropZIndex, dialogZIndex };
}
