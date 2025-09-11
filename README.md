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
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-f7df1e?style=flat-square&logo=javascript&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![ESLint](https://img.shields.io/badge/Linting-ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Formatting-Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=white)](https://prettier.io/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

---

## 📑 Table of Contents

- [✨ Features](#-features)
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
- Keyboard accessibility (Escape to close)
- Backdrop with blur and fade animation
- Header, body, and footer slots
- Optional footer slot
- Close button in the header
- Configurable dialog size: `sm`, `md`, `lg`, `fullscreen`
- Configurable dialog width (supports custom widths via width prop for flexible layouts)
- Supports dark mode and light mode via the `mode` prop (`"light"`, `"dark"`, or `null` to follow OS/browser preference)

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

---

### 2️⃣ Global Plugin Registration

```js
// main.js
import { createApp } from 'vue';
import App from './App.vue';

import { VueModalDialogPlugin } from '@j1nn0/vue-modal-dialog';
import '@j1nn0/vue-modal-dialog/dist/vue-modal-dialog.css';

const app = createApp(App);
app.use(VueModalDialogPlugin);
app.mount('#app');
```

Use `<J1nn0VueModalDialog>` anywhere in your app without importing it:

```vue
<template>
  <J1nn0VueModalDialog v-model="isOpen">
    <template #header> Global Dialog </template>
    <p>Body content</p>
  </J1nn0VueModalDialog>
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
      <j1nn0-vue-modal-dialog v-model="isOpenGlobal">
        <template #header>Global Dialog Title</template>
        <p>Body content goes here</p>
        <template #footer>
          <button @click="isOpenGlobal = false">Close</button>
        </template>
      </j1nn0-vue-modal-dialog>
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

      // Global plugin registration
      app.use(VueModalDialogPlugin);

      app.mount('#app');
    </script>
  </body>
</html>
```

---

## 📌 Props

| Prop       | Type                  | Default    | Description                                                                                                              |
| ---------- | --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `backdrop` | `Boolean` \| `String` | `true`     | `true` = click on backdrop closes dialog, `"static"` = backdrop does nothing                                             |
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

- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` points to header slot
- `aria-describedby` points to body slot
- Close button has `aria-label="Close"`
- Focus trap inside the dialog ensures keyboard navigation
- Escape key closes the dialog if enabled

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
  --j1nn0-vue-modal-dialog-header-background-dark: #1f2937;
  --j1nn0-vue-modal-dialog-footer-background-dark: #1f2937;
  --j1nn0-vue-modal-dialog-body-background-dark: #111827;
  --j1nn0-vue-modal-dialog-text-color-dark: #f9fafb;
}
```

---

## 📝 Notes on Multiple Modals

This library is designed with the assumption that **only one modal is open at a time**.  
Opening multiple modals simultaneously may cause the following issues:

- Backdrops stacking, making the screen too dark
- Focus trap not functioning correctly
- Escape key behavior becoming ambiguous
- Accessibility attributes (e.g. `aria-hidden`) breaking

Therefore, **it is recommended to control modals on the application side** so that only one is visible at any given time.

At present, supporting multiple simultaneous modals is **not planned**.  
If there is strong demand, it may be considered in the future.

---

## 🏷 License

MIT License

Copyright © 2025–PRESENT j1nn0
