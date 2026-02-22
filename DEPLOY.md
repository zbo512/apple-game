# 사과 게임 배포 가이드

이 게임은 **정적 웹**이라 별도 서버 없이 무료로 배포할 수 있습니다.

## 배포 전 확인

배포할 폴더에 다음 파일이 모두 있어야 합니다.

- `index.html`
- `styles.css`
- `game.js`
- `apple.png` (사과 이미지)

---

## 방법 1: Netlify (가장 간단)

1. [https://app.netlify.com](https://app.netlify.com) 접속 후 회원가입(또는 로그인).
2. 화면에서 **"Drag and drop your site output folder here"** 영역으로 `apple-game` 폴더 전체를 끌어다 놓기.
3. 곧바로 배포되고, `https://랜덤이름.netlify.app` 형태의 주소가 생성됩니다.
4. (선택) 사이트 설정에서 **Domain management** → **Options** → **Edit site name**으로 주소를 바꿀 수 있습니다.

---

## 방법 2: GitHub Pages

1. GitHub에서 새 저장소(repository)를 만듭니다.
2. `apple-game` 폴더 안의 **모든 파일**을 그 저장소에 올립니다.
   - GitHub 웹에서 "Add file" → "Upload files"로 올리거나  
   - 로컬에서 Git으로 push 해도 됩니다.
3. 저장소 **Settings** → 왼쪽 메뉴 **Pages** 이동.
4. **Source**를 "Deploy from a branch"로 두고, **Branch**를 `main`(또는 `master`), 폴더를 `/ (root)`로 선택 후 **Save**.
5. 몇 분 뒤 `https://사용자이름.github.io/저장소이름/` 에서 게임이 열립니다.

---

## 방법 3: Vercel

1. [https://vercel.com](https://vercel.com) 접속 후 로그인.
2. **Add New** → **Project** 선택.
3. GitHub에 코드를 올려두었다면 저장소를 선택하고, 아니면 **Import Third-Party Git Repository** 대신 로컬에서 **Vercel CLI**로 배포할 수 있습니다.
4. 로컬에서 배포하려면:
   - 터미널에서 `apple-game` 폴더로 이동 후  
     `npx vercel` 실행하고 안내에 따라 진행하면 됩니다.

---

## 추천

- **코딩/터미널을 최소로 쓰고 싶다** → **Netlify** (폴더 드래그 앤 드롭).
- **GitHub을 이미 쓰고 있다** → **GitHub Pages** (저장소 하나만 만들면 됨).

배포 후 주소를 다른 사람에게 공유하면 바로 게임을 할 수 있습니다.
