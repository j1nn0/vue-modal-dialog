# vue-modal-dialog

Vue 3 向けの再利用可能なモーダルダイアログコンポーネントです。フォーカストラップと ARIA アクセシビリティに対応しています。

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
- [🔔 Events](#-events)
- [🔓 Expose](#-expose)
- [🎯 Programmatic API](#-programmatic-api)
- [🖱 Draggable Dialogs](#-draggable-dialogs)
- [🚪 Non-modal Dialogs](#-non-modal-dialogs)
- [🔒 Prevent Close](#-prevent-close)
- [♿ Accessibility](#-accessibility)
- [🎨 Styles](#-styles)
- [📝 Notes on Multiple Modals](#-notes-on-multiple-modals)
- [🏷 License](#-license)

---

## ✨ Features

- Vue 3 対応
- モーダル内のフォーカストラップ
- フォーカス復元: 最後のダイアログが閉じたとき、最初のダイアログを開く前にフォーカスされていた要素にフォーカスを戻す
- キーボードアクセシビリティ（Escape で閉じる）
- ぼかし + フェードアニメーション付きバックドロップ
- 複数モーダルの同時表示と自動スタック管理に対応
- ヘッダー / ボディ / フッターのスロット
- 任意のフッタースロット
- ヘッダー内の閉じるボタン
- ダイアログサイズ設定: `sm`, `md`, `lg`, `fullscreen`
- ダイアログ幅の設定（`width` prop でカスタム幅も指定可能）
- `mode` prop によるライト/ダークモード対応（`"light"`, `"dark"`, `null` は OS/ブラウザ設定に追従）
- **v0.12.0 の新機能**:
  - Teleport 対応: DOM 内の任意の場所（`body` など）にレンダリング可能
  - 非モーダル対応: ダイアログ表示中も背景の操作を許可
  - ドラッグ移動: ヘッダー部分をドラッグしてダイアログを移動可能
  - プログラマティック API: `useDialog()` コンポーザブルによるダイアログ制御
  - Before-close ガード: 閉じる前のロジック（保存確認など）を追加可能
  - カスタムトランジション: ダイアログと背景のアニメーションをカスタマイズ可能
  - 初期フォーカス: 開いたときにフォーカスする要素を明示的に指定可能
  - Role 設定: `dialog` または `alertdialog` を選択可能
  - ボディスクロールロック: 背景のスクロールを自動的に防止
  - 豊富な配置オプション: 9方向の配置システム（中央、上下左右、四隅など）
  - 新しいライフサイクルイベント: `before-open`, `opening`, `before-close`, `closing`
  - プログラムからのクローズ: `requestClose()` メソッドを公開

---

## 🧪 Storybook

Storybook を使って、モーダルの挙動や props をインタラクティブに確認できます。

```bash
pnpm storybook
```

静的ビルドを生成する場合:

```bash
pnpm build-storybook
```

---

## 💾 Installation

```bash
npm install @j1nn0/vue-modal-dialog
```

または

```bash
yarn add @j1nn0/vue-modal-dialog
```

---

## ⚙️ Peer Dependencies

このコンポーネントを利用する前に、次の peer dependencies をインストールしてください。

```bash
npm install vue @vueuse/core @vueuse/integrations focus-trap
```

または

```bash
yarn add vue @vueuse/core @vueuse/integrations focus-trap
```

これらの依存関係は、ライブラリを正しく動作させるために必須です。

---

## 🛠 Usage

このコンポーネントは **2つの方法** で利用できます。

1. 個別インポート（推奨、tree-shaking が有効）
2. Vue プラグインとしてグローバル登録

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

複数のダイアログを同時に開くことができます。スタック挙動は自動で管理されます。

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

複数のダイアログが開いている場合、Escape キーと backdrop による close は最前面のダイアログのみが処理します。

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

`<VueModalDialog>`（またはカスタム名）を、各ファイルで個別 import せずに利用できます。

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

`@j1nn0/vue-modal-dialog` は、バンドラなしで CDN 経由でも利用できます。**個別 import** と **グローバルプラグイン** の両方に対応しています。

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

| Prop                 | Type                       | Default    | Description                                                                                                       |
| -------------------- | -------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `backdrop`           | `Boolean` \| `String`      | `true`     | `true` = 背景クリックで閉じる, `false` = 背景なし, `"static"` = 背景ありだがクリックで閉じない                    |
| `escape`             | `Boolean`                  | `true`     | Escapeキー押下でダイアログを閉じる                                                                                |
| `role`               | `String`                   | `"dialog"` | ARIA role: `"dialog"` または `"alertdialog"`                                                                      |
| `initialFocus`       | `String` \| `HTMLElement`  | `undefined`| ダイアログが開いたときにフォーカスする要素のセレクタまたは要素                                                    |
| `modal`              | `Boolean`                  | `true`     | `true` = 背景の操作をブロックし、フォーカスをダイアログ内に閉じ込める                                             |
| `teleport`           | `Boolean` \| `String`      | `false`    | `true` = `body` にテレポート、または CSS セレクタでターゲットを指定                                               |
| `scrollLock`         | `Boolean`                  | `true`     | ダイアログ表示中にページのスクロールをロックする                                                                  |
| `draggable`          | `Boolean`                  | `false`    | ヘッダーによるドラッグ移動を有効にする                                                                            |
| `transition`         | `String`                   | `"fade"`   | ダイアログパネルのトランジション名                                                                                |
| `backdropTransition` | `String`                   | `"fade-backdrop"` | バックドロップレイヤーのトランジション名                                                                          |
| `beforeClose`        | `Function`                 | `undefined`| 閉じる前のコールバック。`false` を返すとクローズをキャンセルします                                                |
| `position`           | `String`                   | `"center"` | 配置: `"center"`, `"top"`, `"bottom"`, `"left"`, `"right"`, `"topleft"`, `"topright"`, `"bottomleft"`, `"bottomright"` |
| `width`              | `String`                   | `"md"`     | ダイアログ幅。プリセット: `sm`, `md`, `lg`, `fullscreen`。`"400px"`, `"50%"`, `"80vw"` のようなカスタム幅にも対応 |
| `mode`               | `String` \| `null`         | `null`     | カラーモード: `"light"` はライト、`"dark"` はダーク、`null` はOS/ブラウザ設定に追従                               |

---

## 🎛 Slots

| Slot     | Description                                   |
| -------- | --------------------------------------------- |
| `header` | 任意。ヘッダー用コンテンツ。×ボタンは常に表示 |
| default  | ボディ用コンテンツ                            |
| `footer` | 任意。空の場合は描画されない                  |

---

## 🔔 Events

| Event          | Payload   | Description                                            |
| -------------- | --------- | ------------------------------------------------------ |
| `before-open`  | `void`    | ダイアログが開く処理を開始する前に発火します           |
| `opening`      | `void`    | オープニングトランジションが開始されたときに発火します |
| `opened`       | `void`    | オープニングトランジションが完了したときに発火します   |
| `before-close` | `void`    | ダイアログが閉じる処理を開始する前に発火します         |
| `closing`      | `void`    | クロージングトランジションが開始されたときに発火します |
| `closed`       | `void`    | クロージングトランジションが完了したときに発火します   |

---

## 🔓 Expose

| Method         | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `requestClose` | プログラムからダイアログのクローズをリクエストします。`beforeClose` ガードを尊重します。 |

---

## ♿ Accessibility

- `role="dialog"` + 最上位ダイアログに `aria-modal="true"`
- 下層ダイアログには `aria-modal="false"` + `aria-hidden="true"`
- `aria-labelledby` は header slot を参照
- `aria-describedby` は body slot を参照
- 閉じるボタンには `aria-label="Close"`
- フォーカストラップは最上位ダイアログで有効化され、キーボード操作を一貫化
- 最初のダイアログを開く前にフォーカスされていた要素に、最後のダイアログが閉じたときにフォーカスを復元
- Escape でのクローズは有効時のみ（stack時は最上位ダイアログのみ）

---

## 🎨 Styles

- ダイアログ幅: `sm`, `md`, `lg`, `fullscreen`
- ダイアログ高さ: auto、最大 `80vh`（デフォルト）。内容超過時はスクロール
- ヘッダーとボディで自動改行を有効化
- バックドロップはぼかし付きフェードイン/アウトアニメーション
- `mode` prop によるライト/ダークモード対応

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

このライブラリは **複数モーダルの同時表示** をサポートしています。

ダイアログがスタックされた場合:

- Escapeキーと backdrop click に反応するのは最上位ダイアログのみ
- backdrop を描画するのは最上位ダイアログのみ（`fullscreen` は backdrop を描画しません）
- フォーカストラップは最上位ダイアログのみ有効
- ARIA属性はスタック位置に応じて更新
  - 最上位ダイアログ: `aria-modal="true"`, `aria-hidden="false"`
  - 下層ダイアログ: `aria-modal="false"`, `aria-hidden="true"`
- ダイアログの z-index はスタック順で自動計算
- すべてのダイアログが閉じられたとき、最初のダイアログを起動した要素にフォーカスを復元

スタック挙動の利用に追加設定は不要です。

---

## 🎯 Programmatic API

`useDialog` コンポーザブルを使用して、子コンポーネントやロジックからダイアログの状態を制御できます。

```vue
<script setup>
import { VueModalDialog, useDialog } from '@j1nn0/vue-modal-dialog';

const { isOpen, open, close } = useDialog();
</script>

<template>
  <button @click="open">API経由で開く</button>

  <VueModalDialog v-model="isOpen">
    <p>useDialog() で制御されています</p>
    <button @click="close">閉じる</button>
  </VueModalDialog>
</template>
```

---

## 🖱 Draggable Dialogs

`draggable` prop を追加することで、ヘッダーによるドラッグ移動を有効にできます。

```vue
<VueModalDialog v-model="isOpen" draggable>
  <template #header>ドラッグして移動</template>
  <p>このダイアログは画面内の好きな場所に移動できます。</p>
</VueModalDialog>
```

---

## 🚪 Non-modal Dialogs

`modal` を `false` に設定すると、ダイアログが表示されている間も背景の要素を操作できるようになります。

```vue
<VueModalDialog v-model="isOpen" :modal="false" backdrop="static">
  <p>背景の要素をそのまま操作できます。</p>
</VueModalDialog>
```

---

## 🔒 Prevent Close

`beforeClose` を使用して、ダイアログを閉じる前にバリデーションや確認ダイアログを追加できます。

```vue
<script setup>
const handleBeforeClose = async () => {
  return window.confirm('変更が保存されていません。閉じてもよろしいですか？');
};
</script>

<template>
  <VueModalDialog v-model="isOpen" :beforeClose="handleBeforeClose">
    <p>閉じてみてください。</p>
  </VueModalDialog>
</template>
```

---

## 🏷 License

MIT License

Copyright © 2025–PRESENT j1nn0
