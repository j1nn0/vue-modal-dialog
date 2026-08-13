<script setup lang="ts">
import {
  useTemplateRef,
  useSlots,
  useAttrs,
  useId,
  ref,
  computed,
  watch,
  watchEffect,
  onBeforeUnmount,
  onMounted,
  nextTick,
  warn as vueWarn,
} from 'vue';
import { onKeyStroke } from '@vueuse/core';
import type { VueModalDialogProps, VueModalDialogEmits, VueModalDialogSlots } from '@/types';
import { useDialogState } from '@/composables/useDialogState';
import { useDialogSize } from '@/composables/useDialogSize';
import { useDialogMode } from '@/composables/useDialogMode';
import { useDialogStack } from '@/composables/useDialogStack';
import { useDialogDrag } from '@/composables/useDialogDrag';

defineOptions({ inheritAttrs: false });

// props / emit
const {
  backdrop = 'default',
  escape = true,
  transition = 'fade',
  backdropTransition = 'fade-backdrop',
  position = 'center',
  width = 'md',
  mode = null,
  teleport = true,
  scrollLock = true,
  initialFocus = undefined,
  closeLabel = 'Close',
  draggable,
  beforeClose,
  role,
  describedBy,
} = defineProps<VueModalDialogProps>();
const emit = defineEmits<VueModalDialogEmits>();
defineSlots<VueModalDialogSlots>();
const dialogRef = useTemplateRef('dialogRef');
const slots = useSlots();
const attrs = useAttrs();
const isOpen = defineModel<boolean>({ required: true });

// Stack integration: shared single backdrop, dialogs stacked above it
const dialogId = useDialogStack.nextId();
const stackIndex = ref(-1);
const currentTopId = ref<string | null>(null);
const titleId = useId();
const hasHeader = computed(() => Boolean(slots.header));
const teleportTarget = computed(() =>
  teleport === true ? 'body' : typeof teleport === 'string' ? teleport : 'body',
);
const ariaDescribedBy = computed(() => {
  const value = describedBy ?? attrs['aria-describedby'];
  return typeof value === 'string' ? value : undefined;
});
let closePending = false;

async function requestClose(): Promise<boolean> {
  if (!isOpen.value || closePending) return false;

  if (!beforeClose) {
    emit('before-close');
    isOpen.value = false;
    return true;
  }

  closePending = true;
  try {
    emit('before-close');
    const allow = await beforeClose();
    if (!allow) {
      closePending = false;
      return false;
    }

    isOpen.value = false;
    return true;
  } catch (err) {
    console.warn('[VueModalDialog] beforeClose rejected.', err);
    closePending = false;
    return false;
  }
}

// composables (pass dialogId to useDialogState so focus-trap can react to stack)
const { close } = useDialogState(
  isOpen,
  dialogRef,
  emit,
  () => initialFocus,
  dialogId,
  requestClose,
);
const { dialogWidthClass, dialogWidthStyle, dialogPositionClass } = useDialogSize({
  width: computed(() => width),
  position: computed(() => position),
});
const { modeClass } = useDialogMode(() => mode);
const isDraggable = computed(() => draggable === true && width !== 'fullscreen');
const { onPointerDown, dragStyle, isDragging } = useDialogDrag(isOpen, isDraggable, dialogRef);

// read base z-index safely
const BASE_Z =
  typeof window !== 'undefined'
    ? (() => {
        try {
          const v = getComputedStyle(document.documentElement).getPropertyValue(
            '--j1nn0-vue-modal-dialog-backdrop-z-index',
          );
          const n = parseInt(v, 10);
          return Number.isFinite(n) ? n : 1000;
        } catch (err) {
          vueWarn('getComputedStyle error', err);
          return 1000;
        }
      })()
    : 1000;

const zIndexValue = computed(() => {
  const idx = stackIndex.value >= 0 ? stackIndex.value : 0;
  return BASE_Z + idx * 2 + 1; // dialog above its backdrop
});

const isTop = computed(() => currentTopId.value === dialogId);
const effectiveBackdrop = computed(() =>
  role === 'alertdialog' && backdrop === 'default' ? 'static' : backdrop,
);
const canCloseByBackdrop = computed(() => effectiveBackdrop.value === 'default');

watchEffect(() => {
  if (draggable && width === 'fullscreen') {
    vueWarn('[VueModalDialog] draggable=true has no effect when width="fullscreen".');
  }
  if (backdrop === 'static' && escape === false) {
    vueWarn(
      '[VueModalDialog] backdrop="static" with escape=false leaves the close button as the only built-in dismissal mechanism.',
    );
  }
  if (role === 'alertdialog' && !describedBy) {
    vueWarn('[VueModalDialog] role="alertdialog" requires a describedBy prop.');
  }
  if (!hasHeader.value && !attrs['aria-label']) {
    vueWarn('[VueModalDialog] dialog has no accessible name: provide a header slot or aria-label.');
  }
});

function updateStackIndex() {
  stackIndex.value = useDialogStack.indexOf(dialogId);
  currentTopId.value = useDialogStack.topId();
}

// subscribe once to stack updates so we update stackIndex reactively
useDialogStack.subscribe(updateStackIndex);

function registerInStack(): void {
  if (useDialogStack.indexOf(dialogId) !== -1) return;

  emit('before-open');
  const idx = useDialogStack.push({
    id: dialogId,
    el: dialogRef,
    onClose: close,
    scrollLock,
  });
  stackIndex.value = idx;
  updateStackIndex();
  emit('opening');
}

// Watch open state to register/unregister in stack
watch(isOpen, (val) => {
  closePending = false;
  if (val) {
    registerInStack();
  } else {
    emit('closing');
    useDialogStack.pop(dialogId);
    // Defer closed emit until Vue has applied the DOM change.
    nextTick().then(() => emit('closed'));
  }
});

watch(
  () => scrollLock,
  (enabled) => {
    if (isOpen.value) useDialogStack.setScrollLock(dialogId, enabled);
  },
);

onMounted(() => {
  if (isOpen.value && useDialogStack.indexOf(dialogId) === -1) {
    registerInStack();
  }
});

onBeforeUnmount(() => {
  useDialogStack.pop(dialogId);
  useDialogStack.unsubscribe(updateStackIndex);
});

// Backdrop click responds only on the topmost modal.
function handleBackdropClick() {
  if (!isOpen.value) return;
  if (canCloseByBackdrop.value && isTop.value) requestClose();
}

// Escape key only handled by top modal
onKeyStroke('Escape', (e) => {
  if (!isOpen.value) return;
  if (escape && isTop.value) {
    e.preventDefault();
    requestClose();
  }
});

defineExpose({ requestClose });
</script>

<template>
  <Teleport :to="teleportTarget" :disabled="!teleport">
    <transition :name="backdropTransition" appear>
      <div
        v-if="isOpen && isTop && width !== 'fullscreen'"
        class="backdrop"
        :class="modeClass"
        :style="{ zIndex: BASE_Z + (stackIndex >= 0 ? stackIndex * 2 : 0) }"
        @click="handleBackdropClick"
      ></div>
    </transition>

    <transition :name="transition" appear @after-leave="emit('after-leave')">
      <div
        ref="dialogRef"
        v-if="isOpen"
        v-bind="$attrs"
        :style="[{ maxWidth: dialogWidthStyle, zIndex: zIndexValue }, dragStyle]"
        class="dialog"
        :class="[dialogPositionClass, dialogWidthClass, modeClass, { 'is-dragging': isDragging }]"
        :role="role ?? 'dialog'"
        :aria-modal="isTop"
        :inert="!isTop"
        :aria-labelledby="hasHeader ? titleId : undefined"
        :aria-describedby="ariaDescribedBy"
      >
        <div class="dialog-content">
          <header
            class="dialog-header"
            :class="{ 'is-draggable': isDraggable }"
            @pointerdown="onPointerDown"
          >
            <div class="dialog-title" :id="hasHeader ? titleId : undefined">
              <slot name="header"></slot>
            </div>
            <button
              type="button"
              class="dialog-close"
              @click="requestClose"
              :aria-label="closeLabel"
            >
              ×
            </button>
          </header>

          <div class="dialog-body">
            <slot></slot>
          </div>

          <footer v-if="slots.footer" class="dialog-footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style>
:root {
  /* Backdrop */
  --j1nn0-vue-modal-dialog-backdrop-z-index: 1000;
  --j1nn0-vue-modal-dialog-backdrop-background: rgba(0, 0, 0, 0.6);
  --j1nn0-vue-modal-dialog-backdrop-blur: 2px;

  /* Dialog */
  --j1nn0-vue-modal-dialog-border: none;
  --j1nn0-vue-modal-dialog-border-radius: 8px;
  --j1nn0-vue-modal-dialog-width: 90%;
  --j1nn0-vue-modal-dialog-max-width-sm: 300px;
  --j1nn0-vue-modal-dialog-max-width-md: 600px;
  --j1nn0-vue-modal-dialog-max-width-lg: 900px;
  --j1nn0-vue-modal-dialog-max-height: 80vh;
  --j1nn0-vue-modal-dialog-text-color: #000000;
  --j1nn0-vue-modal-dialog-position-offset: 2rem;

  /* Header */
  --j1nn0-vue-modal-dialog-header-background: #f5f5f5;
  --j1nn0-vue-modal-dialog-header-padding: 1rem;

  /* Body */
  --j1nn0-vue-modal-dialog-body-background: #fff;
  --j1nn0-vue-modal-dialog-body-padding: 1rem;

  /* Footer */
  --j1nn0-vue-modal-dialog-footer-background: #f5f5f5;
  --j1nn0-vue-modal-dialog-footer-padding: 1rem;

  /* Close button */
  --j1nn0-vue-modal-dialog-close-size: 24px;
  --j1nn0-vue-modal-dialog-close-border-radius: 4px;
  --j1nn0-vue-modal-dialog-close-hover-background: rgba(0, 0, 0, 0.08);

  /* Focus ring */
  --j1nn0-vue-modal-dialog-focus-ring-color: #1d4ed8;
  --j1nn0-vue-modal-dialog-focus-ring-width: 2px;
  --j1nn0-vue-modal-dialog-focus-ring-offset: 2px;

  /* Dark mode */
  --j1nn0-vue-modal-dialog-backdrop-background-dark: rgba(255, 255, 255, 0.2);
  --j1nn0-vue-modal-dialog-border-dark: none;
  --j1nn0-vue-modal-dialog-header-background-dark: #1f2937;
  --j1nn0-vue-modal-dialog-footer-background-dark: #1f2937;
  --j1nn0-vue-modal-dialog-body-background-dark: #111827;
  --j1nn0-vue-modal-dialog-text-color-dark: #f9fafb;
  --j1nn0-vue-modal-dialog-close-hover-background-dark: rgba(255, 255, 255, 0.12);
  --j1nn0-vue-modal-dialog-focus-ring-color-dark: #93c5fd;
}
.vue-modal-open {
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
// Backdrop
.backdrop {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(var(--j1nn0-vue-modal-dialog-backdrop-blur));
  z-index: var(--j1nn0-vue-modal-dialog-backdrop-z-index);
  transition:
    backdrop-filter 0.3s ease,
    opacity 0.3s ease;

  &.mode-light {
    background: var(--j1nn0-vue-modal-dialog-backdrop-background);
  }

  &.mode-dark {
    background: var(--j1nn0-vue-modal-dialog-backdrop-background-dark);
  }
}

.fade-backdrop-enter-active,
.fade-backdrop-leave-active {
  transition:
    opacity 0.3s ease,
    backdrop-filter 0.3s ease;
}
.fade-backdrop-enter-from,
.fade-backdrop-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}
.fade-backdrop-enter-to,
.fade-backdrop-leave-from {
  opacity: 1;
  backdrop-filter: blur(var(--j1nn0-vue-modal-dialog-backdrop-blur));
}

// Dialog
.dialog {
  position: fixed;
  z-index: calc(var(--j1nn0-vue-modal-dialog-backdrop-z-index) + 1);
  border-radius: var(--j1nn0-vue-modal-dialog-border-radius);
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  &.is-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: var(--j1nn0-vue-modal-dialog-max-height);
    margin: 0;
    width: 100%;
    max-width: var(--j1nn0-vue-modal-dialog-width);
  }

  &.is-top {
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
    max-height: calc(100vh - 4rem);
    width: 100%;
    max-width: var(--j1nn0-vue-modal-dialog-width);
    box-sizing: border-box;
    margin: 0;
  }

  &.is-bottom {
    bottom: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    left: 50%;
    transform: translateX(-50%);
  }

  &.is-left {
    left: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    top: 50%;
    transform: translateY(-50%);
  }

  &.is-right {
    right: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    top: 50%;
    transform: translateY(-50%);
  }

  &.is-topleft {
    top: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    left: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
  }

  &.is-topright {
    top: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    right: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
  }

  &.is-bottomleft {
    bottom: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    left: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
  }

  &.is-bottomright {
    bottom: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    right: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
  }

  &.mode-light {
    border: var(--j1nn0-vue-modal-dialog-border);
    color: var(--j1nn0-vue-modal-dialog-text-color);

    .dialog-header {
      background: var(--j1nn0-vue-modal-dialog-header-background);
    }
    .dialog-footer {
      background: var(--j1nn0-vue-modal-dialog-footer-background);
    }
    .dialog-body {
      background: var(--j1nn0-vue-modal-dialog-body-background);
    }
    .dialog-close {
      color: var(--j1nn0-vue-modal-dialog-text-color);

      &:hover {
        background: var(--j1nn0-vue-modal-dialog-close-hover-background);
      }
      &:focus-visible {
        outline-color: var(--j1nn0-vue-modal-dialog-focus-ring-color);
      }
    }
  }

  &.mode-dark {
    border: var(--j1nn0-vue-modal-dialog-border-dark);
    color: var(--j1nn0-vue-modal-dialog-text-color-dark);

    .dialog-header {
      background: var(--j1nn0-vue-modal-dialog-header-background-dark);
    }
    .dialog-footer {
      background: var(--j1nn0-vue-modal-dialog-footer-background-dark);
    }
    .dialog-body {
      background: var(--j1nn0-vue-modal-dialog-body-background-dark);
    }
    .dialog-close {
      color: var(--j1nn0-vue-modal-dialog-text-color-dark);

      &:hover {
        background: var(--j1nn0-vue-modal-dialog-close-hover-background-dark);
      }
      &:focus-visible {
        outline-color: var(--j1nn0-vue-modal-dialog-focus-ring-color-dark);
      }
    }
  }
}

// Fade animation
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

// Content
.dialog-content {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}

.dialog-header,
.dialog-footer {
  flex-shrink: 0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow-wrap: break-word;
  word-break: break-word;
}

.dialog-header {
  padding: var(--j1nn0-vue-modal-dialog-header-padding);
  border-top-left-radius: var(--j1nn0-vue-modal-dialog-border-radius);
  border-top-right-radius: var(--j1nn0-vue-modal-dialog-border-radius);

  &.is-draggable {
    cursor: grab;
    // Claim touch gestures so dragging does not scroll the page instead.
    touch-action: none;
  }
}

// Suppress text selection only while a drag is in progress.
.dialog.is-dragging {
  user-select: none;

  .dialog-header.is-draggable {
    cursor: grabbing;
  }
}

.dialog-footer {
  padding: var(--j1nn0-vue-modal-dialog-footer-padding);
  border-bottom-left-radius: var(--j1nn0-vue-modal-dialog-border-radius);
  border-bottom-right-radius: var(--j1nn0-vue-modal-dialog-border-radius);
}

.dialog-title {
  flex: 1 1 auto;
  overflow-wrap: break-word;
}

.dialog-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  // Inline-flex centres the glyph inside the minimum target box below.
  display: inline-flex;
  align-items: center;
  justify-content: center;
  // WCAG 2.2 SC 2.5.8 Target Size (Minimum), Level AA: at least 24x24 CSS px.
  min-width: var(--j1nn0-vue-modal-dialog-close-size);
  min-height: var(--j1nn0-vue-modal-dialog-close-size);
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--j1nn0-vue-modal-dialog-close-border-radius);
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;

  &:focus-visible {
    outline: var(--j1nn0-vue-modal-dialog-focus-ring-width) solid
      var(--j1nn0-vue-modal-dialog-focus-ring-color);
    outline-offset: var(--j1nn0-vue-modal-dialog-focus-ring-offset);
  }
}

// Respect a user's reduced-motion preference while keeping Vue transition hooks active.
@media (prefers-reduced-motion: reduce) {
  .backdrop,
  .fade-enter-active,
  .fade-leave-active,
  .fade-backdrop-enter-active,
  .fade-backdrop-leave-active {
    transition-duration: 0.01ms !important;
  }
}

.dialog-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: var(--j1nn0-vue-modal-dialog-body-padding);
  overflow-wrap: break-word;
  word-break: break-word;
}

// Dialog width classes
.dialog-sm {
  max-width: var(--j1nn0-vue-modal-dialog-max-width-sm);
}
.dialog-md {
  max-width: var(--j1nn0-vue-modal-dialog-max-width-md);
}
.dialog-lg {
  max-width: var(--j1nn0-vue-modal-dialog-max-width-lg);
}
.dialog-fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh !important;
  border-radius: 0;
  top: 0 !important;
  left: 0 !important;
  transform: none !important;

  .dialog-content {
    height: 100%;
  }

  .dialog-header,
  .dialog-footer {
    border-radius: 0;
  }
}
</style>
