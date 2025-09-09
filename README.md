# vue-modal-dialog

A reusable Vue 3 modal dialog component with focus trap and ARIA accessibility support.

---

## Features

- Vue 3 support
- Focus trap inside the modal
- Keyboard accessibility (Escape to close)
- Backdrop with blur and fade animation
- Header, body, and footer slots
- Optional footer slot
- Close button in the header

---

## Installation

```bash
npm install @j1nn0/vue-modal-dialog
```

or

```bash
yarn add @j1nn0/vue-modal-dialog
```

---

## Peer Dependencies

Before using this component, make sure you have installed the following peer dependencies:

```bash
npm install vue @vueuse/core @vueuse/integrations focus-trap
```

or

```bash
yarn add vue @vueuse/core @vueuse/integrations focus-trap
```

These dependencies are **required** for the library to function properly.

---

## Usage

You can use this component in **two ways**:

1. Import individually (recommended, enables tree-shaking)
2. Register globally as a Vue plugin

---

### 1. Individual Import (recommended)

```vue
<script setup>
import { ref } from 'vue';
import { VueModalDialog } from '@j1nn0/vue-modal-dialog';
import '@j1nn0/vue-modal-dialog/dist/vue-modal-dialog.css';

const isOpen = ref(false);

const submitForm = () => {
  alert('Form submitted!');
  isOpen.value = false;
};
</script>

<template>
  <button @click="isOpen = true">Open Dialog</button>

  <VueModalDialog v-model="isOpen">
    <!-- Header slot -->
    <template #header> Dialog Title </template>

    <!-- Body slot (default) -->
    <p>
      This is the body content of the dialog. It supports long text and will wrap automatically.
    </p>

    <!-- Footer slot (optional) -->
    <template #footer>
      <button @click="isOpen = false">Cancel</button>
      <button @click="submitForm">Submit</button>
    </template>
  </VueModalDialog>
</template>
```

---

### 2. Global Plugin Registration

```js
// main.js
import { createApp } from 'vue';
import App from './App.vue';

import { J1nn0VueModalDialogPlugin } from '@j1nn0/vue-modal-dialog';
import '@j1nn0/vue-modal-dialog/dist/vue-modal-dialog.css';

const app = createApp(App);
app.use(J1nn0VueModalDialogPlugin);
app.mount('#app');
```

Now you can use `<J1nn0VueModalDialog>` anywhere in your app without importing it:

```vue
<template>
  <J1nn0VueModalDialog v-model="isOpen">
    <template #header> Global Dialog </template>
    <p>Body content</p>
  </J1nn0VueModalDialog>
</template>
```

---

## Props

| Prop       | Type                | Default    | Description                                                                  |
| ---------- | ------------------- | ---------- | ---------------------------------------------------------------------------- |
| `backdrop` | `Boolean \| String` | `true`     | `true` = click on backdrop closes dialog, `"static"` = backdrop does nothing |
| `escape`   | `Boolean`           | `true`     | Pressing Escape key closes the dialog                                        |
| `position` | `String`            | `"center"` | Position of the dialog: `"center"` or `"top"`                                |

---

## Slots

| Slot     | Description                                               |
| -------- | --------------------------------------------------------- |
| `header` | Optional. Content for the header. × button always present |
| default  | Content for the body of the dialog                        |
| `footer` | Optional. Content for footer, not rendered if empty       |

---

## Accessibility

- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` points to header slot
- `aria-describedby` points to body slot
- Close button has `aria-label="Close"`
- Focus trap inside the dialog ensures keyboard navigation
- Escape key closes the dialog if enabled

---

## Styles

- Dialog width (default): `90%` up to `600px` max
- Dialog height (default): auto, max `80vh`, scrollable if content overflows
- Word wrapping enabled in header and body
- Backdrop has fade-in/out animation with blur effect

---

## License

MIT
