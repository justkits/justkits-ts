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

## 라이선스

LICENSE 파일 참조
