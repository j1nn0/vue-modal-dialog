# vue-modal-dialog

A reusable Vue 3 modal dialog component with focus trap and ARIA accessibility support.

#### 📦 Project Info

[![License](https://img.shields.io/badge/License-MIT-ff0000?style=flat-square&logo=open-source-initiative&logoColor=white)](https://github.com/j1nn0/vue-modal-dialog/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/@j1nn0/vue-modal-dialog?style=flat-square&logo=npm&logoColor=white&cacheSeconds=60)](https://www.npmjs.com/package/@j1nn0/vue-modal-dialog)
[![Downloads](https://img.shields.io/npm/dm/@j1nn0/vue-modal-dialog?style=flat-square&logo=npm&logoColor=white&cacheSeconds=60)](https://www.npmjs.com/package/@j1nn0/vue-modal-dialog)

#### ⚙️ Build & Quality

[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@j1nn0/vue-modal-dialog?style=flat-square&logo=webpack&logoColor=white&cacheSeconds=60)](https://bundlephobia.com/package/@j1nn0/vue-modal-dialog)
[![Vite](https://img.shields.io/badge/build%20with-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://ja.vite.dev/)

#### 🛠 Tech Stack

[![Vue](https://img.shields.io/badge/Vue-v3.5-41b883?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-f7df1e?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![ESLint](https://img.shields.io/badge/Linting-ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org/)
[![Oxlint](https://img.shields.io/badge/Linting-Oxlint-4B32C3?style=flat-square&logo=oxc&logoColor=white)](https://oxc.rs/)
[![Oxfmt](https://img.shields.io/badge/Formatting-Oxfmt-F7B93E?style=flat-square&logo=oxc&logoColor=white)](https://oxc.rs/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🧪 Storybook](#-storybook)
- [💾 Installation](#-installation)
- [⚙️ Peer Dependencies](#%EF%B8%8F-peer-dependencies)
- [🛠 Usage](#-usage)
  - [1️⃣ Individual Import (recommended)](#1%EF%B8%8F⃣-individual-import-recommended)
  - [2️⃣ Global Plugin Registration](#2%EF%B8%8F⃣-global-plugin-registration)
- [🌐 CDN Usage](#-cdn-usage)
- [📌 Props](#-props)
- [🎛 Slots](#-slots)
- [♿ Accessibility](#-accessibility)
- [🎨 Styles](#-styles)
- [📝 Notes on Multiple Modals](#-notes-on-multiple-modals)
- [🏷 License](#-license)

---

## ✨ Features

- Vue 3 support
- Focus trap inside the modal
- Focus restoration: the element that opened the dialog is re-focused when the last dialog closes
- Keyboard accessibility (Escape to close)
- Backdrop with blur and fade animation
- Supports multiple modals opened simultaneously with automatic stack management
- Header, body, and footer slots
- Optional footer slot
- Close button in the header
- Configurable dialog size: `sm`, `md`, `lg`, `fullscreen`
- Configurable dialog width (supports custom widths via width prop for flexible layouts)
- Supports dark mode and light mode via the `mode` prop (`"light"`, `"dark"`, or `null` to follow OS/browser preference)

---

## 🧪 Storybook

Use Storybook to interactively verify modal behavior and props.

```bash
pnpm storybook
```

Build static Storybook output:

```bash
pnpm build-storybook
```

---

## 💾 Installation

```bash
npm install @j1nn0/vue-modal-dialog
```

or

```bash
yarn add @j1nn0/vue-modal-dialog
```

---

## ⚙️ Peer Dependencies

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

## 🛠 Usage

You can use this component in **two ways**:

1. Import individually (recommended, enables tree-shaking)
2. Register globally as a Vue plugin

---

### 1️⃣ Individual Import (recommended)

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

### Multiple Modals (Stack)

You can open multiple dialogs at the same time. Stack behavior is handled automatically.

```vue
<script setup>
import { ref } from 'vue';
import { VueModalDialog } from '@j1nn0/vue-modal-dialog';

const showDialog1 = ref(false);
const showDialog2 = ref(false);
</script>

<template>
  <button @click="showDialog1 = true">Open Dialog 1</button>

  <VueModalDialog v-model="showDialog1">
    <template #header>Dialog 1</template>
    <p>First dialog</p>
    <template #footer>
      <button @click="showDialog2 = true">Open Dialog 2</button>
    </template>
  </VueModalDialog>

  <VueModalDialog v-model="showDialog2">
    <template #header>Dialog 2</template>
    <p>Second dialog (topmost while open)</p>
  </VueModalDialog>
</template>
```

When multiple dialogs are open, only the topmost dialog handles Escape and backdrop close.

---

### 2️⃣ Global Plugin Registration

```js
// main.js
import { createApp } from 'vue';
import App from './App.vue';

import { VueModalDialogPlugin } from '@j1nn0/vue-modal-dialog';
import '@j1nn0/vue-modal-dialog/dist/vue-modal-dialog.css';

const app = createApp(App);

// Registers globally as <VueModalDialog> by default
app.use(VueModalDialogPlugin);
// Or specify a custom name
// app.use(VueModalDialogPlugin, { name: 'CustomName' });

app.mount('#app');
```

Use `<VueModalDialog>` (or your custom name) anywhere in your app without importing it:

```vue
<template>
  <VueModalDialog v-model="isOpen">
    <template #header> Global Dialog </template>
    <p>Body content</p>
  </VueModalDialog>
</template>
```

---

## 🌐 CDN Usage

You can use `@j1nn0/vue-modal-dialog` via CDN without any bundler. Both **individual import** and **global plugin** usage are supported.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue Modal Dialog CDN Example</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/tabbable/dist/index.umd.js"></script>
    <script src="https://unpkg.com/focus-trap/dist/focus-trap.umd.js"></script>
    <script src="https://unpkg.com/@vueuse/shared"></script>
    <script src="https://unpkg.com/@vueuse/core"></script>
    <script src="https://unpkg.com/@vueuse/integrations"></script>
    <link
      rel="stylesheet"
      href="https://unpkg.com/@j1nn0/vue-modal-dialog/dist/vue-modal-dialog.css"
    />
    <script src="https://unpkg.com/@j1nn0/vue-modal-dialog/dist/vue-modal-dialog.umd.js"></script>
  </head>
  <body>
    <div id="app">
      <!-- Individual Import -->
      <button type="button" @click="isOpenImport = true">Open Import Dialog</button>
      <vue-modal-dialog v-model="isOpenImport">
        <template #header>Import Dialog Title</template>
        <p>Body content goes here</p>
        <template #footer>
          <button @click="isOpenImport = false">Close</button>
        </template>
      </vue-modal-dialog>

      <!-- Global Plugin -->
      <button type="button" @click="isOpenGlobal = true">Open Global Dialog</button>
      <global-plugin-modal-dialog v-model="isOpenGlobal">
        <template #header>Global Dialog Title</template>
        <p>Body content goes here</p>
        <template #footer>
          <button @click="isOpenGlobal = false">Close</button>
        </template>
      </global-plugin-modal-dialog>
    </div>

    <script>
      const { createApp, ref } = Vue;
      const { VueModalDialogPlugin, VueModalDialog } = J1nn0VueModalDialog;

      const app = createApp({
        setup() {
          const isOpenImport = ref(false);
          const isOpenGlobal = ref(false);

          return { isOpenImport, isOpenGlobal };
        },
      });

      // Individual import registration
      app.component('VueModalDialog', VueModalDialog);

      // Global plugin registration (default name: 'VueModalDialog')
      app.use(VueModalDialogPlugin, { name: 'GlobalPluginModalDialog' });

      app.mount('#app');
    </script>
  </body>
</html>
```

---

## 📌 Props

| Prop       | Type                  | Default    | Description                                                                                                              |
| ---------- | --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `backdrop` | `Boolean` \| `String` | `true`     | `true` = backdrop click closes dialog, `false` = no backdrop, `"static"` = backdrop shown but click does not close       |
| `escape`   | `Boolean`             | `true`     | Pressing Escape key closes the dialog                                                                                    |
| `position` | `String`              | `"center"` | Position of the dialog: `"center"` or `"top"`                                                                            |
| `width`    | `String`              | `"md"`     | Dialog width. Presets: `sm`, `md`, `lg`, `fullscreen`. Also supports custom CSS width, e.g. `"400px"`, `"50%"`, `"80vw"` |
| `mode`     | `String` \| `null`    | `null`     | Dialog color mode: `"light"` for light mode, `"dark"` for dark mode, null to follow the OS/browser preference            |

---

## 🎛 Slots

| Slot     | Description                                               |
| -------- | --------------------------------------------------------- |
| `header` | Optional. Content for the header. × button always present |
| default  | Content for the body of the dialog                        |
| `footer` | Optional. Content for footer, not rendered if empty       |

---

## ♿ Accessibility

- `role="dialog"` + `aria-modal="true"` on the topmost dialog
- `aria-modal="false"` + `aria-hidden="true"` on lower-layered dialogs
- `aria-labelledby` points to header slot
- `aria-describedby` points to body slot
- Close button has `aria-label="Close"`
- Focus trap is active on the topmost dialog to keep keyboard navigation predictable
- Focus is restored to the element that was focused before the first dialog opened when the last dialog closes
- Escape key closes the dialog if enabled (topmost dialog only when stacked)

---

## 🎨 Styles

- Dialog width: `sm`, `md`, `lg`, `fullscreen`
- Dialog height: auto, max `80vh` (default), scrollable if content overflows
- Word wrapping enabled in header and body
- Backdrop has fade-in/out animation with blur effect
- Supports Light and Dark mode via `mode` prop

### CSS Custom Properties

```css
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

  /* Header */
  --j1nn0-vue-modal-dialog-header-background: #f5f5f5;
  --j1nn0-vue-modal-dialog-header-padding: 1rem;

  /* Body */
  --j1nn0-vue-modal-dialog-body-background: #fff;
  --j1nn0-vue-modal-dialog-body-padding: 1rem;

  /* Footer */
  --j1nn0-vue-modal-dialog-footer-background: #f5f5f5;
  --j1nn0-vue-modal-dialog-footer-padding: 1rem;

  /* Dark mode */
  --j1nn0-vue-modal-dialog-backdrop-background-dark: rgba(255, 255, 255, 0.2);
  --j1nn0-vue-modal-dialog-border-dark: none;
  --j1nn0-vue-modal-dialog-header-background-dark: #1f2937;
  --j1nn0-vue-modal-dialog-footer-background-dark: #1f2937;
  --j1nn0-vue-modal-dialog-body-background-dark: #111827;
  --j1nn0-vue-modal-dialog-text-color-dark: #f9fafb;
}
```

---

## 📝 Notes on Multiple Modals

This library supports **multiple modals opened simultaneously**.

When dialogs are stacked:

- Only the topmost dialog responds to Escape and backdrop click
- Only the topmost dialog renders a backdrop (`fullscreen` dialogs do not render a backdrop)
- Focus trap is active only for the topmost dialog
- ARIA attributes are updated by stack position:
  - topmost dialog: `aria-modal="true"`, `aria-hidden="false"`
  - lower-layered dialogs: `aria-modal="false"`, `aria-hidden="true"`
- Dialog z-index is automatically calculated from stack order
- Focus is restored to the element that triggered the first dialog when all dialogs are closed

No additional configuration is required to use stack behavior.

---

## 🏷 License

MIT License

Copyright © 2025–PRESENT j1nn0
