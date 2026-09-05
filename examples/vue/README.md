# Vue 3 adapter example

```bash
npm install kineto vue
```

```js
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import KinetoVue from 'kineto/vue';
import 'kineto/style.css';

createApp(App)
  .use(KinetoVue)
  .mount('#app');
```

```vue
<template>
  <h1 v-motion:textReveal="{ options: { mode: 'hangul', speed: 80 } }">
    디자이너가 직접 만든 모션
  </h1>

  <strong v-motion:counter="{ options: { mode: 'plain', to: 1234, format: ',' } }">
    0
  </strong>
</template>
```

Composable도 사용할 수 있습니다.

```vue
<script setup>
import { ref } from 'vue';
import { useKineto } from 'kineto/vue';

const preset = ref('fade-up');
const { element, replay } = useKineto(
  'reveal',
  () => ({ preset: preset.value }),
  [preset]
);
</script>

<template>
  <h2 ref="element">Hello</h2>
  <button @click="replay">Replay</button>
</template>
```

`watchSources`가 변경되면 기존 인스턴스를 정리한 뒤 새로 생성합니다. options를
ref 또는 getter로 넘기면 이때 `setup()` 시점의 값이 아니라 최신 값을 사용합니다.

Nuxt에서는 client-only plugin 또는 client component 안에서 어댑터를 등록합니다.
