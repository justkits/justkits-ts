# @justkits/icons

JustKits 아이콘 라이브러리 - React 및 React Native용 SVG 아이콘 컴포넌트

## 설치

```bash
# npm
npm install @justkits/icons

# pnpm
pnpm add @justkits/icons

# yarn
yarn add @justkits/icons
```

### React Native 추가 설정

React Native 프로젝트에서는 `react-native-svg`가 필요합니다:

```bash
pnpm add react-native-svg
```

## 사용법

### React (Web)

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

### React Native

```tsx
import { ChevronDown, Album } from "@justkits/icons";

function App() {
  return (
    <View>
      <ChevronDown size={24} color="#000" />
      <Album size={32} color="blue" />
    </View>
  );
}
```

> 플랫폼에 따라 자동으로 적절한 컴포넌트가 로드됩니다.

## Props

모든 아이콘 컴포넌트는 동일한 props를 받습니다:

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

## 플랫폼 지원

| 플랫폼       | 지원 |
| ------------ | ---- |
| React (Web)  | ✅   |
| React Native | ✅   |

## 요구사항

- React 18.0.0 이상
- React Native: `react-native-svg` 15.0.0 이상

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

이 패키지는 태그 기반 배포를 사용합니다. 새 버전을 배포하려면:

### 1. 버전 업데이트

```bash
cd packages/icons
npm version patch  # 또는 minor, major
```

package.json이 업데이트되고 git 커밋이 생성됩니다.

### 2. 버전 태그 생성 및 푸시

```bash
git tag icons-v0.0.3  # 1단계의 버전 사용
git push origin main --tags
```

### 3. 자동 배포

GitHub Actions 워크플로우가 자동으로:

- 패키지 빌드
- 테스트 실행 및 검증
- GitHub Packages에 배포

### 버전 가이드라인

- **Patch** (`0.0.x`): 버그 수정, 아이콘 추가
- **Minor** (`0.x.0`): 새로운 기능, props 추가
- **Major** (`x.0.0`): Breaking changes, API 변경

## 라이선스

LICENSE 파일 참조
