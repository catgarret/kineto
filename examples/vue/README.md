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
import { useKineto } from 'kineto/vue';

const { element, replay } = useKineto(
  'reveal',
  { preset: 'fade-up' }
);
</script>

<template>
  <h2 ref="element">Hello</h2>
  <button @click="replay">Replay</button>
</template>
```

Nuxt에서는 client-only plugin 또는 client component 안에서 어댑터를 등록합니다.
