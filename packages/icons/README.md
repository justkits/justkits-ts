# @justkits/icons

> 내부용 React 아이콘 패키지  
> 모든 SVG 파일은 **빌드 타임**에 자동으로 React 컴포넌트로 변환됩니다.  
> 비공개 패키지이므로 외부 공개나 오픈소스 배포는 의도하지 않았습니다.

---

## 📘 Overview

### ⭐️ 배경

이 프로젝트는 여러 오픈소스 아이콘 라이브러리를 사용하면서 느낀 불편함에서 출발했다.  
다양한 아이콘 세트를 써봤지만, 다음과 같은 문제가 반복적으로 발생했다.

#### ⚠️ 외부 아이콘 라이브러리의 한계

- 내가 사용하는 패키지에 정작 필요한 아이콘이 없는 경우가 많았다.
- 몇 개의 아이콘만 쓰기 위해 큰 라이브러리를 설치하는 것이 비효율적으로 느껴졌다.

#### 🛠️ 임시방편의 비효율성

그래서 주로 Figma 플러그인을 이용해 원하는 아이콘을 찾아 사용했고,  
그마저도 없을 때는 직접 Figma에서 아이콘을 제작해 사용했다.  
아이콘 프레임을 `.svg` 파일로 내보내고, 이를 앱 디렉토리에 추가한 뒤  
`svgr` 같은 도구로 React 컴포넌트로 변환했다.

하지만 이런 방식은 시간이 지날수록 불편함이 커졌다.

- 크고 작은 웹앱을 만들 때마다 환경에 맞는 세팅을 매번 반복해야 했고,
- 여러 프로젝트에서 동일한 아이콘이 중복 관리되었다.

#### 💡 결론

결국, 이러한 문제를 근본적으로 해결하기 위해  
아이콘을 한곳에서 통합 관리할 수 있는 **개인용 아이콘 라이브러리**를 만들기로 했다.  
이제 각 앱에서는 단순히 가져와서 사용하는 방식으로,  
불필요한 반복과 중복을 없애고자 한다.

> 이 라이브러리는 **React 기반의 모든 프로젝트(Vite, Next.js, React Native 등)** 에서 사용할 수 있으며,  
> 런타임 변환 도구에 의존하지 않고 **빌드 타임에 자동으로 React 컴포넌트로 변환**됩니다.

---

## 🧩 How to Add Icons

1️⃣ **SVG 파일 추가**

- 아이콘은 반드시 아래 경로 중 하나에 추가한다.
  - `src/icons/[icon-name].svg`
  - `src/logos/[logo-name].svg`
- 파일명은 **kebab-case** 로 작성해야 한다.
  - 예시: `chevron-down.svg`, `arrow-left.svg`, `github.svg`

2️⃣ **명령어 실행으로 아이콘 변환**

- 변환 명령어:
  ```bash
  pnpm generate
  ```
- 위 명령어를 실행하면 다음 과정이 자동으로 수행된다.
  - `src/icons/`와 `src/logos/`의 `.svg` 파일을 모두 스캔
  - React 컴포넌트(`.tsx`)로 변환
  - 타입(`IconName`, `LogoName`)과 매핑 파일(`icon-map.ts`) 자동 생성
  - 빌드 캐시 및 매니페스트 갱신

3️⃣ **빌드 & 배포**

```bash
pnpm build
pnpm publish
```

이 과정을 통해 새로운 아이콘이 반영된 버전이 배포된다.

---

## ⚙️ Usage

### 1️⃣ App Icons

```tsx
import { AppIcon } from "@justkits/icons";

<AppIcon icon="chevron-down" size={20} color="#333" />;
```

#### 💡 특징

- `icon` prop은 자동 생성된 타입(`IconName`) 기반으로 **타입 안전**하게 제공된다.  
  → 존재하지 않는 아이콘 이름을 입력하면 컴파일 타임 경고/에러 발생
- props:
  - `icon`: IconName
  - `size`: number
  - `color?`: string (`currentColor` 기본값)

---

### 2️⃣ Logo Icons

```tsx
import { Logo } from "@justkits/icons";

<Logo logo="github" size={24} />;
<Logo logo="github" size={24} disabled />;
<Logo logo="github" size={24} disabled disabledColor="#9AA0A6" />;
```

#### 💡 특징

- `logo` prop은 자동 생성된 타입(`LogoName`) 기반으로 **타입 안전**하게 제공된다.
- props:
  - `logo`: LogoName
  - `size`: number
  - `disabled?`: boolean (기본값 `false`)
  - `disabledColor?`: string (기본값 `#9AA0A6`)
- `disabled`가 `true`일 경우 로고의 색상이 단색으로 표시된다.

---

> ✅ **요약**  
> 아이콘은 단순히 추가하고(`.svg`), 명령어를 실행하면(`pnpm generate`)  
> 타입이 안전한 React 컴포넌트로 바로 사용할 수 있다.
