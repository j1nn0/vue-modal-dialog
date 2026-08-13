#!/usr/bin/env bash
# Type-check the packed package the way a consumer would.
#
# The published declaration file is the only thing consumers type-check against,
# and nothing else in this repo covers it: the type tests assert standalone
# exported types, and the smoke test only checks that the runtime entry resolves.
# A regression there is invisible until someone installs the package.
#
# Two assertions, and the second is the one that matters: valid usage must pass,
# and invalid usage must FAIL. Without the negative case a component typed as
# `any` would sail through, which is exactly the defect this guards against.
set -euo pipefail

repo_root="${1:-${GITHUB_WORKSPACE:-$(git rev-parse --show-toplevel)}}"
vue_tsc="$repo_root/node_modules/.bin/vue-tsc"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

pnpm --dir "$repo_root" pack --pack-destination "$tmp_dir" >/dev/null
archive="$(find "$tmp_dir" -maxdepth 1 -type f -name '*.tgz' -print -quit)"

package_dir="$tmp_dir/package"
mkdir "$package_dir"
tar -xzf "$archive" -C "$package_dir" --strip-components=1
# `vue` must resolve from inside the package too: dist/index.d.ts imports its
# types from 'vue', and if that fails the component type silently degrades to
# `any` and every assertion below passes for the wrong reason.
ln -s "$repo_root/node_modules" "$package_dir/node_modules"

consumer_dir="$tmp_dir/consumer"
mkdir -p "$consumer_dir/node_modules/@j1nn0"
ln -s "$package_dir" "$consumer_dir/node_modules/@j1nn0/vue-modal-dialog"
ln -s "$repo_root/node_modules/vue" "$consumer_dir/node_modules/vue"

cat > "$consumer_dir/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true
  },
  "include": ["Consumer.vue"],
  "vueCompilerOptions": {
    "strictTemplates": true
  }
}
EOF

cat > "$consumer_dir/Consumer.vue" <<'EOF'
<script setup lang="ts">
import { ref } from 'vue'
import { VueModalDialog } from '@j1nn0/vue-modal-dialog'
import type { VueModalDialogSlots } from '@j1nn0/vue-modal-dialog'

const open = ref(false)
const slots: VueModalDialogSlots = {
  header: () => null,
  default: () => null,
  footer: () => null
}
slots.header()
</script>

<template>
  <VueModalDialog v-model="open" width="lg" role="alertdialog" described-by="description">
    <template #header>Example</template>
    <p id="description">Body</p>
    <template #footer>Footer</template>
  </VueModalDialog>
</template>
EOF

echo 'Checking that valid consumer usage type-checks...'
"$vue_tsc" --noEmit -p "$consumer_dir/tsconfig.json"

cat > "$consumer_dir/Consumer.vue" <<'EOF'
<script setup lang="ts">
import { ref } from 'vue'
import { VueModalDialog } from '@j1nn0/vue-modal-dialog'
import type { VueModalDialogSlots } from '@j1nn0/vue-modal-dialog'

const open = ref(false)
const invalidSlots: VueModalDialogSlots = {
  nonexistent: () => null
}
void invalidSlots
</script>

<template>
  <VueModalDialog v-model="open" :widthh="123">
    <template #nonexistent>Bad</template>
  </VueModalDialog>
</template>
EOF

echo 'Checking that invalid consumer usage is rejected...'
if bad_output="$("$vue_tsc" --noEmit -p "$consumer_dir/tsconfig.json" 2>&1)"; then
  echo 'Expected invalid packed-package usage to fail type-checking.' >&2
  exit 1
fi

# Indent so these deliberate errors do not match the tsc problem matcher that
# setup-node registers; otherwise a passing run is decorated with red annotations.
printf '%s\n' "$bad_output" | sed 's/^/  expected | /'

grep -q 'widthh' <<<"$bad_output" || {
  echo 'Expected an error for the unknown "widthh" prop; the component type is not being checked.' >&2
  exit 1
}
grep -q 'nonexistent' <<<"$bad_output" || {
  echo 'Expected an error for the unknown "nonexistent" slot.' >&2
  exit 1
}

echo 'Packed package types behave correctly for consumers.'
