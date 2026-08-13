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
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
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
import '@j1nn0/vue-modal-dialog/style.css';

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
import '@j1nn0/vue-modal-dialog/style.css';

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
    <script src="https://unpkg.com/@j1nn0/vue-modal-dialog/dist/vue-modal-dialog.umd.cjs"></script>
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

| Prop                 | Type                      | Default           | Description                                                                                                            |
| -------------------- | ------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `backdrop`           | `String`                  | `"default"`      | `"default"` = 最上位ダイアログの背景クリックで閉じる, `"static"` = 背景ありだがクリックで閉じない                  |
| `escape`             | `Boolean`                 | `true`            | Escapeキー押下でダイアログを閉じる                                                                                     |
| `role`               | `String`                  | `"dialog"`        | ARIA role: `"dialog"` または `"alertdialog"`。alertdialog では `describedBy` が必須                                  |
| `describedBy`        | `String`                  | `undefined`        | 説明要素のID（複数可）。`aria-describedby` として出力し、`role="alertdialog"` では必須                                 |
| `closeLabel`         | `String`                  | `"Close"`         | 閉じるボタンのアクセシブルなラベル                                                                                       |
| `initialFocus`       | `String` \| `HTMLElement` | `undefined`       | ダイアログが開いたときにフォーカスする要素のセレクタまたは要素                                                         |
| `teleport`           | `Boolean` \| `String`     | `true`             | 既定で `body` にテレポート。インライン描画は `false`、任意ターゲットは CSS セレクタで指定                              |
| `scrollLock`         | `Boolean`                 | `true`            | ダイアログ表示中にページのスクロールをロックする。open 中の変更は即時反映される                                         |
| `draggable`          | `Boolean`                 | `false`           | ヘッダーによるドラッグ移動を有効にする                                                                                 |
| `transition`         | `String`                  | `"fade"`          | ダイアログパネルのトランジション名                                                                                     |
| `backdropTransition` | `String`                  | `"fade-backdrop"` | バックドロップレイヤーのトランジション名                                                                               |
| `beforeClose`        | `Function`                | `undefined`       | 閉じる前のコールバック。`false` を返すとクローズをキャンセルします                                                     |
| `position`           | `String`                  | `"center"`        | 配置: `"center"`, `"top"`, `"bottom"`, `"left"`, `"right"`, `"topleft"`, `"topright"`, `"bottomleft"`, `"bottomright"` |
| `width`              | `String`                  | `"md"`            | ダイアログ幅。プリセット: `sm`, `md`, `lg`, `fullscreen`。`"400px"`, `"50%"`, `"80vw"` のようなカスタム幅にも対応      |
| `mode`               | `String` \| `null`        | `null`            | カラーモード: `"light"` はライト、`"dark"` はダーク、`null` はOS/ブラウザ設定に追従                                    |

---

## 🛠 v1.0 移行

v1.0 は modal 専用です。`modal` prop と boolean の `backdrop={true|false}` は廃止されました。
ダイアログは既定で `body` にテレポートされます。インライン描画が必要な場合だけ `:teleport="false"` を指定してください。
`role="alertdialog"` では、alert メッセージ要素を指す `describedBy` が必須です。
背景クリックで最上位ダイアログを閉じる場合はデフォルトの `backdrop="default"` を、閉じない場合は
`backdrop="static"` を使用してください。non-modal ダイアログには対応しません。

背景を視覚的に透明にしつつ interaction shield を維持する場合は、既存の CSS custom property を
名前変更せずに上書きします。

```css
:root {
  --j1nn0-vue-modal-dialog-backdrop-background: transparent;
  --j1nn0-vue-modal-dialog-backdrop-background-dark: transparent;
  --j1nn0-vue-modal-dialog-backdrop-blur: 0;
}
```

---

## 🎛 Slots

| Slot     | Description                                   |
| -------- | --------------------------------------------- |
| `header` | 任意。ヘッダー用コンテンツ。×ボタンは常に表示 |
| default  | ボディ用コンテンツ                            |
| `footer` | 任意。空の場合は描画されない                  |

---

## 🔔 Events

| Event          | Payload | Description                                                                                 |
| -------------- | ------- | ------------------------------------------------------------------------------------------- |
| `before-open`  | `void`  | 開く要求時に発火します。initially-open の場合は、初回の DOM mount 後に発火します。             |
| `opening`      | `void`  | ダイアログの開く処理が開始されたときに発火します。                                             |
| `opened`       | `void`  | DOM 更新とフォーカス処理後に発火します。enter transition の完了は待ちません。                  |
| `before-close` | `void`  | 閉じる前、`beforeClose` ガードの実行前に発火します。ガードでキャンセルされる場合があります。 |
| `closing`      | `void`  | ダイアログの閉じる処理が開始されたときに発火します。                                           |
| `closed`       | `void`  | Vue が close を適用した後に発火します。leave transition は継続中の場合があります。            |
| `after-leave`  | `void`  | ダイアログパネルの leave transition 完了後に発火します。                                      |

---

## 🔓 Expose

| Method         | Description                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| `requestClose` | `Promise<boolean>` を返します。close 開始時は `true`、guard拒否・guard実行中は `false` です。                 |

---

## ♿ Accessibility

- ダイアログは常に modal です。最上位ダイアログには `aria-modal="true"` を設定し、フォーカストラップを有効化します
- 下層ダイアログには `aria-modal="false"` + `aria-hidden="true"`
- `aria-labelledby` は header slot がある場合に表示タイトルを参照します。ない場合は `aria-label` を指定してください
- `role="alertdialog"` では `describedBy` prop が必須で、`aria-describedby` として出力されます
- 通常の dialog では直接の `aria-describedby` 属性も互換フォールバックとして使えます。`describedBy` が優先されます
- 閉じるボタンのアクセシブルなラベルは `closeLabel` prop で変更できます（デフォルトは `"Close"`）
- `aria-label`、`data-*`、`id` などの追加属性はダイアログに fallthrough します
- フォーカストラップは最上位ダイアログで有効化され、キーボード操作を一貫化
- 最初のダイアログを開く前にフォーカスされていた要素に、最後のダイアログが閉じたときにフォーカスを復元
- Escape でのクローズは有効時のみ（stack 時は最上位ダイアログのみ）

背景ページのコンテンツに `inert` は設定されません。modal 性は `aria-modal` とフォーカストラップで示し、モーダルダイアログの背景操作を防ぎます。ダイアログは既定で `body` にテレポートされるため、変形された祖先要素や局所的な stacking context を避けられます。

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
- backdrop を描画するのは最上位ダイアログのみ（`fullscreen` はダイアログ自身が viewport を覆うため別 backdrop を描画しません）
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
