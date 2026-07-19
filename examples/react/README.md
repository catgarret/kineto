# React adapter example

```bash
npm install kineto react
```

```jsx
import 'kineto/style.css';
import { Motion, useKineto } from 'kineto/react';

export function Hero() {
  const counter = useKineto('counter', {
    mode: 'plain',
    from: 0,
    to: 1234,
    format: ','
  });

  return (
    <section>
      <Motion
        as="h1"
        type="textReveal"
        options={{ mode: 'hangul', speed: 80 }}
      >
        디자이너가 직접 만든 모션
      </Motion>

      <strong ref={counter.ref}>0</strong>
    </section>
  );
}
```

옵션 객체가 바뀔 때 모듈을 다시 만들려면 세 번째 인수에 의존성 배열을 전달합니다.

```jsx
const reveal = useKineto('reveal', { preset, duration }, [preset, duration]);
```

컴포넌트가 unmount되면 어댑터가 `Kineto.destroyModule()`을 호출합니다.

## Next.js

Kineto을 사용하는 컴포넌트는 client component로 둡니다.

```jsx
'use client';

import 'kineto/style.css';
import { Motion } from 'kineto/react';

export default function Title() {
  return <Motion as="h1" type="reveal" options={{ preset: 'fade-up' }}>Hello</Motion>;
}
```
