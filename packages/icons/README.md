# @justkits/icons

JustKits 아이콘 라이브러리 - React용 SVG 아이콘 컴포넌트 (내부용)

> 비공개 패키지이므로 외부 공개나 오픈소스 배포는 의도하지 않았다.
> React Native용 아이콘 컴포넌트들은 해당 레포지토리의 `native-icons` 패키지를 참조 [native-icons 패키지](https://github.com/justkits/justkits-ts/tree/main/packages/native-icons)

## 📘 개요 (개발 배경)

이 프로젝트는 여러 오픈소스 아이콘 라이브러리를 사용하면서 느낀 불편함에서 출발했다.
다양한 아이콘 세트를 써봤지만, 다음과 같은 문제가 반복적으로 발생했다:

### ⚠️ 외부 아이콘 라이브러리의 한계

- 외부 아이콘 라이브러리에는 필요한 아이콘이 부족하기도 하고, 어떤 아이콘은 A 라이브러리의 것이, 다른 아이콘은 B 라이브러리의 것이 적절하다고 판단이 들 때도 있었다.
- 또한, 고작 두세개의 아이콘을 위해 큰 라이브러리를 설치하는 것이 비효율적이라고 느껴지기도 했다.

> 이에, Figma에서 주로 플러그인을 활용하여 원하는 아이콘을 찾아 사용했고, 그마저도 없을 때는 직접 아이콘을 제작하여 프로젝트에 추가하는 과정을 거쳤다.

### 🛠️ 임시방편의 비효율성

Figma를 통해, 아이콘 프레임을 `.svg` 파일로 내보내고, 이를 개발 디렉토리에 추가한 뒤 `svgr` 이나 `react-native-svg` 같은 도구로 React 컴포넌트로 변환하는 과정을 거쳤다. 그러나, 이런 방식 역시 반복되다보니 불편했다.

- 크고 작은 웹앱을 만들 때마다 환경에 맞는 세팅을 매번 반복해야 했으며,
- 여러 프로젝트에서 동일한 아이콘이 중복 관리되었다.
- 하나의 컴포넌트 (`<AppIcon icon={icon-name} />`)로 export해서 사용하는 패턴을 만들었는데, API로부터 icon 이름을 받아서 사용하는 경우에는 좋았지만, 없는 icon을 찾을 때 콘솔에 오류를 찍는 것 외에 할 수 있는게 딱히 없었고, 사용하지 않는 아이콘을 찾아서 삭제할 때도 불편했다.

### 💡 결론

이러한 비효율성을 해결하고, 일관된 아이콘 관리 및 재사용을 위해 자체적인 아이콘 라이브러리를 구축하기로 결정했다.

> 이 라이브러리는 **React Web 기반의 프로젝트(Vite, Next.js 등)** 에서 사용할 수 있으며, 런타임 변환 도구에 의존하지 않고 **빌드 타임에 자동으로 React 컴포넌트로 변환**된다.

---

## 🚀 개발 워크플로우

라이브러리 개발 프로세스는 개발자의 실수를 방지하고 일관성을 유지하기 위해 자동화된 워크플로우를 따른다. 따라서, 개발자는 간단한 작업만 수행하면 된다.

### 1단계: SVG 파일 추가/수정/삭제

개발자는 `assets/` 디렉토리 안에서 아이콘을 관리한다.

- **경로**: `assets/[family]/[icon-name].svg`
- **`family`**: 아이콘의 분류/그룹 (예: `app`, `logos`, `social`)
- **`icon-name`**: 아이콘의 이름 (편의를 위해 반드시 kebab-case로 추가한다)

추가하는 모든 아이콘은 아래의 **두 가지 핵심 규칙**을 반드시 지켜야 한다. 위반 시 스크립트가 오류를 발생시키며 중단된다.

1.  **고유한 아이콘 이름**: 모든 `family`를 통틀어 아이콘 파일 이름(`icon-name`)은 중복될 수 없다.

    > 예: `assets/app/user.svg`와 `assets/social/user.svg`는 허용되지 않는다.

2.  **고유한 아이콘 콘텐츠**: 서로 다른 두 파일이 동일한 SVG 내용을 가질 수 없다.

### 2단계: 스크립트 실행 (`pnpm generate`)

SVG 파일을 추가, 수정, 또는 삭제했다면 아래의 스크립트를 실행하여 라이브러리에 반영한다.

개발자가 주로 사용하게 될 핵심적인 명령어 `pnpm generate`이다. 실행을 하면 내부적으로 다음 과정이 순서대로 진행된다.

1.  **Clean**: `src/` 폴더의 기존 컴포넌트들을 삭제하여 기존 빌드를 초기화한다.
2.  **Scan**: `assets/` 폴더를 스캔하여 변환해야 할 아이콘들의 정보를 수집한다. 이 과정에서 중복되는 이름이나, 중복되는 내용이 있다면, 개발자에게 알리고 동작을 멈춘다.
3.  **Convert**: `assets/` 에서 스캔한 SVG들을 React 컴포넌트로 변환하고, `.tsx` 파일로 저장한다.
4.  **Barrel Files**: 변환한 파일들을 `index.ts` barrel file에서 다시 한번 export한다. 각 family 폴더에서 한번 export하고, root에서 한번 더 export해서 consumer 패키지에서 유연하게 사용할 수 있도록 한다.
5.  **Format**: Prettier로 생성된 파일들의 코드 포맷을 자동으로 정리한다.

### 3단계: Changeset 생성

아이콘을 추가, 수정, 삭제했다면 changeset을 생성하여 변경 내역을 기록한다.

```bash
pnpm changeset
```

대화형 프롬프트에 따라:

1. 변경할 패키지 선택 (`@justkits/icons`)
2. 버전 유형 선택 (patch/minor/major)
3. 변경 사항 요약 작성

### 4단계: 변경사항 커밋

생성된 컴포넌트 파일과 changeset 파일을 함께 Git에 커밋한다.

```bash
git add .
git commit -m "Add new icons"
```

### 5단계: 배포

Pull Request를 생성하면, Changesets 봇이 자동으로 버전 업데이트 PR을 생성한다. 이 PR이 머지되면 GitHub Actions를 통해 자동으로 배포된다.

## 기술 전략

- **SVGR 기반 변환**: `.svg` 파일을 빌드 타임에 React 컴포넌트(`.tsx`)로 자동 변환
- **FamilySvgBuilder**: `@justkits/svgs-core`의 빌더를 사용하여 카테고리별 아이콘 관리
- **타입 안정성**: 모든 아이콘은 `IconProps` 타입을 사용하여 일관된 인터페이스 제공
- **Props 제한**: `color`와 `size`만 지원하여 복잡도 최소화

## 설치 방법

```bash
# npm
npm install @justkits/icons

# pnpm
pnpm add @justkits/icons

# yarn
yarn add @justkits/icons
```

> **참고**: 이 패키지는 GitHub Packages를 통해 배포되므로, 설치 전에 `.npmrc` 파일에 GitHub Packages 레지스트리 설정이 선행되어야 한다. (자세한 내용은 GitHub Packages 문서를 참조)

## 사용법 (Usage)

### 기본 임포트

```tsx
import { ChevronDown, Album } from "@justkits/icons";

function App() {
  return (
    <div>
      <ChevronDown size={24} color="#000" />
      <Album size={32} color="blue" />
    </div>
  );
}
```

### 카테고리별 임포트

필요에 따라 아이콘을 특정 카테고리에서 직접 임포트할 수 있다.

```tsx
import { ChevronDown } from "@justkits/icons/app";
import { Bat } from "@justkits/icons/baseball";
import { Album } from "@justkits/icons/media";

function App() {
  return (
    <div>
      <ChevronDown size={24} color="#000" />
      <Bat size={32} color="green" />
      <Album size={24} color="purple" />
    </div>
  );
}
```

## Props

모든 아이콘 컴포넌트는 동일한 props를 받는다:

| Prop    | 타입     | 기본값   | 설명                      |
| ------- | -------- | -------- | ------------------------- |
| `size`  | `number` | `24`     | 아이콘의 너비와 높이 (px) |
| `color` | `string` | `"#000"` | 아이콘 색상               |

## 사용 가능한 아이콘

### App

- `ChevronDown`
- `ChevronLeft`
- `ChevronRight`
- `ChevronUp`

### Baseball

- `Bat`

### Media

- `Album`
- `File`
- `Gallery`
- `Upload`
- `Video`

## 요구사항

- React 18.0.0 이상

## 플랫폼 지원

- React (Web): Vite, Next.js, Create React App 등

## 개발

```bash
# 패키지 빌드
pnpm build

# 아이콘 생성
pnpm generate

# 테스트 실행
pnpm test

# 커버리지 리포트
pnpm coverage
```

## 배포

이 패키지는 Changesets를 통한 자동 배포를 사용한다.

### 배포 프로세스

1. **Changeset 생성**: 변경 사항이 있을 때마다 `pnpm changeset` 실행
2. **PR 생성**: 변경 사항을 포함한 Pull Request 생성
3. **Version PR**: Changesets 봇이 자동으로 버전 업데이트 PR 생성
4. **자동 배포**: Version PR이 머지되면 GitHub Actions가 자동으로:
   - 패키지 빌드
   - 테스트 실행 및 검증
   - 버전 업데이트
   - GitHub Packages에 배포

### 버전 가이드라인

- **Patch** (`0.0.x`): 버그 수정, 아이콘 추가
- **Minor** (`0.x.0`): 새로운 기능, props 추가
- **Major** (`x.0.0`): Breaking changes, API 변경

## 라이선스

LICENSE 파일 참조
