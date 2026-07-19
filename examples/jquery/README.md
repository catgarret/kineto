# jQuery adapter example

```bash
npm install kineto jquery
```

```js
import $ from 'jquery';
import installKineto from 'kineto/jquery';
import 'kineto/style.css';

installKineto($);

$('.card').kineto('reveal', { preset: 'fade-up' });
$('.counter').kineto('counter', { mode: 'plain', to: 1234, format: ',' });

// 한 모듈만 정리
$('.card').destroyKineto('reveal');

// 요소에 연결된 모든 Kineto 모듈 정리
$('.card').destroyKineto();
```

브라우저 글로벌 환경에서는 jQuery를 먼저 로드하고 adapter ESM을 불러오면 자동 설치됩니다. UMD만 사용할 때는 jQuery 없이 `Kineto.autoInit()` 또는 `Kineto.<module>()`을 직접 사용해도 됩니다.
