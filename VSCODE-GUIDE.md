# VS Code 가이드 (빌드 · Git · npm 배포)

GitHub 웹 업로드만으로도 배포는 가능합니다(`PUBLISH-GUIDE.md`). 다만 아래 두 가지는 터미널이 필요합니다.

- `dist/` 결과물을 새로 빌드하기
- npm 패키지 배포하기

이 문서는 VS Code에서 그 과정을 처음부터 따라 할 수 있게 정리한 것입니다.

---

## 1. 준비

### 1-1. 설치

- Node.js LTS: <https://nodejs.org> (설치 후 확인)
- VS Code: <https://code.visualstudio.com>

### 1-2. 프로젝트 열기

VS Code 실행 → `File` → `Open Folder…` → `motionKit` 폴더 선택.

### 1-3. 터미널 열기

상단 메뉴 `Terminal` → `New Terminal`. 창 하단에 터미널이 열립니다. 버전을 확인합니다.

```bash
node -v
npm -v
```

숫자가 나오면 정상입니다(예: v22.x, 10.x).

---

## 2. 의존성 설치와 빌드

프로젝트를 처음 열었다면 한 번만 설치합니다.

```bash
npm install
```

라이브러리 결과물(`dist/`)을 다시 만들 때:

```bash
npm run build
```

전체 점검(권장) — 린트, 빌드, 테스트, 계약 검증을 한 번에 실행합니다.

```bash
npm run verify
```

`dist/motionkit.js`, `dist/motionkit.umd.js`, `dist/motionkit.umd.min.js`, `dist/motionkit.css` 등이 갱신됩니다. 데모를 로컬에서 확인하려면:

```bash
npm run dev
```

표시되는 주소(예: `http://localhost:5173/demo/`)를 브라우저에서 엽니다.

---

## 3. Git으로 GitHub에 올리기

웹 업로드가 익숙하면 이 장은 건너뛰어도 됩니다. VS Code에서 Git을 쓰면 이후 업데이트가 훨씬 빠릅니다.

### 3-1. 처음 한 번 (저장소 연결)

GitHub에 빈 저장소(`catgarret/motionKit`)를 먼저 만들어 둡니다. 그다음 터미널에서:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/catgarret/motionKit.git
git push -u origin main
```

`.gitignore`가 이미 있어서 `node_modules` 같은 불필요한 폴더는 자동으로 제외됩니다(웹 업로드와 달리 수동으로 뺄 필요가 없습니다).

> GitHub 로그인 창이 뜨면 브라우저 인증을 따르거나, 사용자명과 Personal Access Token을 입력합니다. GUI가 편하면 VS Code 왼쪽 `Source Control` 탭이나 GitHub Desktop을 써도 됩니다.

### 3-2. 이후 업데이트

```bash
git add .
git commit -m "Update: 변경 내용 요약"
git push
```

---

## 4. npm 배포

패키지 이름은 `@dong-gri/motionkit`(스코프 패키지)입니다.

### 4-1. 준비

- npm 계정: <https://www.npmjs.com> 에서 가입 (사용자명 `dong-gri`)
- 스코프가 사용자명과 같아야 합니다. `@dong-gri/...` 는 `dong-gri` 계정으로만 배포할 수 있습니다.

### 4-2. 로그인

```bash
npm login
```

브라우저 인증 또는 사용자명/비밀번호/이메일을 입력합니다. 확인:

```bash
npm whoami   # dong-gri 가 나오면 정상
```

### 4-3. 배포 전 점검

```bash
npm run verify
npm pack --dry-run   # 실제로 올라갈 파일 목록 미리보기
```

`npm pack --dry-run` 출력에 `node_modules`가 없고 `dist/`가 포함돼 있는지 확인합니다(`package.json`의 `files` 목록이 이를 결정합니다).

### 4-4. 배포

```bash
npm publish
```

스코프 패키지를 무료 계정에서 공개로 올리려면 `--access public`이 필요한데, `package.json`에 `publishConfig.access: "public"`을 넣어 두었으므로 위 명령만으로 공개 배포됩니다. 명시적으로 쓰고 싶다면:

```bash
npm publish --access public
```

배포 확인: <https://www.npmjs.com/package/@dong-gri/motionkit>

### 4-5. 새 버전 올리기

이미 배포한 버전 번호로는 다시 배포할 수 없습니다. 버전을 올린 뒤 다시 배포합니다.

```bash
npm version patch   # 0.8.0 -> 0.8.1 (버그 수정)
# npm version minor # 0.8.0 -> 0.9.0 (기능 추가)
# npm version major # 0.8.0 -> 1.0.0 (호환성 변경)
npm publish
git push --follow-tags
```

`npm version`은 `package.json` 버전을 올리고 Git 태그도 만들어 줍니다.

---

## 5. 자주 겪는 문제

- `push`가 거부됨 — `! [rejected] main -> main (fetch first)` / `Updates were rejected because the remote contains work...`: 원격 저장소에 로컬에 없는 커밋(대개 저장소 생성 시 자동 만들어진 README/LICENSE)이 있어서입니다. 방금 만든 저장소라 로컬이 정본이면 원격을 덮어씁니다.

  ```bash
  git push -u origin main --force
  ```

  원격 파일도 남기고 합치려면:

  ```bash
  git pull origin main --allow-unrelated-histories --no-rebase
  git add .
  git commit -m "Merge remote"
  git push -u origin main
  ```

- `no upstream branch`: 처음 푸시할 때 `git push -u origin main`으로 업스트림을 지정하면 이후에는 `git push`만으로 됩니다.


- `npm publish`에서 402/403 오류: 스코프가 계정과 다르거나 로그인이 안 된 경우입니다. `npm whoami`로 확인하고 이름이 `@dong-gri/...`인지 보세요.
- `You cannot publish over the previously published versions`: 버전을 올리지 않았습니다. `npm version patch` 후 다시 시도하세요.
- CDN에 최신이 안 뜸: jsDelivr/unpkg는 버전별로 캐시합니다. 새 버전을 배포하면 새 버전 URL에서 즉시 반영됩니다. GitHub 직접 서빙(`/gh/...@main`)은 커밋 태그를 쓰는 편이 안정적입니다.
- 데모가 `file://`로 열 때 깨짐: Safari는 `file://`에서 쿼리스트링을 막습니다. 로컬 확인은 `npm run dev`(로컬 서버)로 여는 것을 권장합니다.
