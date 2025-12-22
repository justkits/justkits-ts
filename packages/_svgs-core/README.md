# @justkits/svgs-core

플랫폼 독립적인 SVG → React 컴포넌트 빌더 (내부 전용)

> 이 패키지는 내부 전용 패키지로, JustKits 모노레포 내에서 SVG 아이콘을 React 컴포넌트로 자동 변환하는 기능을 제공.

## 📘 개요

`@justkits/svgs-core`는 SVG 파일을 React 컴포넌트(`.tsx`)로 자동 변환하는 빌더 시스템을 제공한다. SVGR을 기반으로 하며, 다양한 프로젝트 구조에 맞춰 사용할 수 있도록 유연한 빌더 클래스를 제공한다.

### 핵심 기능

- ✅ **자동 변환**: SVG 파일을 TypeScript React 컴포넌트로 자동 변환
- ✅ **중복 검증**: 컴포넌트 이름 및 SVG 내용 중복 자동 감지
- ✅ **배럴 파일 생성**: 자동으로 `index.ts` 배럴 파일 생성
- ✅ **병렬 처리**: 대량의 SVG 파일을 효율적으로 처리
- ✅ **플랫폼 독립적**: Web과 React Native 모두 지원 가능
- ✅ **커스터마이징**: 템플릿 및 SVGR 옵션 완전 커스터마이징 가능

## 🚀 사용 가능한 빌더

### 1. FamilySvgBuilder

카테고리별로 분류된 아이콘 세트에 적합한 빌더.

**디렉토리 구조:**

```text
assets/
  ├── media/
  │   ├── album.svg
  │   ├── video.svg
  │   └── upload.svg
  ├── app/
  │   ├── settings.svg
  │   └── chevron-down.svg
```

**생성 결과:**

```text
src/
  ├── media/
  │   ├── components/
  │   │   ├── Album.tsx
  │   │   ├── Video.tsx
  │   │   └── Upload.tsx
  │   └── index.ts          // export { Album, Video, Upload }
  ├── app/
  │   ├── components/
  │   │   ├── Settings.tsx
  │   │   └── ChevronDown.tsx
  │   └── index.ts
  └── index.ts              // export { Album, Video, ... } from "./media"
```

### 2. StandaloneSvgBuilder

플랫 구조의 아이콘 세트에 적합한 빌더.

**디렉토리 구조:**

```text
assets/
  ├── album.svg
  ├── video.svg
  ├── settings.svg
  └── twitter.svg
```

**생성 결과:**

```text
src/
  ├── components/
  │   ├── Album.tsx
  │   ├── Video.tsx
  │   ├── Settings.tsx
  │   └── Twitter.tsx
  └── index.ts              // export { Album, Video, Settings, Twitter }
```

## 📦 설치

```bash
pnpm add @justkits/svgs-core
```

## 🔧 사용법

### 기본 사용 예제 (FamilySvgBuilder)

```typescript
import { FamilySvgBuilder, defaultOptions } from "@justkits/svgs-core";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// 빌더 생성
const builder = new FamilySvgBuilder(
  defaultOptions,
  join(dirname(fileURLToPath(import.meta.url)), ".."),
);

// SVG → React 컴포넌트 변환 실행
await builder.generate();
```

### 기본 사용 예제 (StandaloneSvgBuilder)

```typescript
import { StandaloneSvgBuilder, defaultOptions } from "@justkits/svgs-core";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const builder = new StandaloneSvgBuilder(
  defaultOptions,
  join(dirname(fileURLToPath(import.meta.url)), ".."),
);

await builder.generate();
```

### 커스텀 템플릿 사용

SVGR 템플릿을 커스터마이징하여 원하는 형태의 컴포넌트를 생성할 수 있다.

**예제: IconProps를 사용하는 커스텀 템플릿**

```typescript
import { Config } from "@svgr/core";
import { FamilySvgBuilder, defaultOptions } from "@justkits/svgs-core";

// 커스텀 템플릿 정의
function template(variables: any, { tpl }: any) {
  return tpl`
    ${variables.imports}
    import type { IconProps } from "./types";

    export function ${variables.componentName}({ size = 24, color = "#000" }: Readonly<IconProps>) {
      return (${variables.jsx});
    }
  `;
}

// SVGR 옵션 커스터마이징
const customOptions: Config = {
  ...defaultOptions,
  svgoConfig: {
    plugins: [
      {
        name: "preset-default",
        params: { overrides: { removeViewBox: false } },
      },
      {
        name: "convertColors",
        params: { currentColor: true },
      },
      "prefixIds",
      "removeDimensions",
    ],
  },
  template,
};

const builder = new FamilySvgBuilder(customOptions, "/path/to/package");
await builder.generate();
```

### React Native 지원

React Native에서 사용하려면 템플릿을 `react-native-svg`용으로 변경하면 된다.

```typescript
function nativeTemplate(variables: any, { tpl }: any) {
  return tpl`
    import React from "react";
    import Svg, { Path, G, Circle } from "react-native-svg";
    import type { IconProps } from "./types";

    export function ${variables.componentName}({ size = 24, color = "#000" }: Readonly<IconProps>) {
      return (${variables.jsx});
    }
  `;
}

const nativeOptions: Config = {
  ...defaultOptions,
  native: true, // React Native 모드 활성화
  template: nativeTemplate,
};
```

## ⚙️ API 레퍼런스

### defaultOptions

SVGR에서 사용할 기본 옵션.

```typescript
const defaultOptions: Config = {
  icon: true, // 아이콘 모드 활성화
  typescript: true, // TypeScript 생성
  prettier: true, // Prettier 포맷팅
  jsxRuntime: "automatic", // React 17+ 자동 JSX 런타임
  expandProps: false, // props 확장 비활성화
  plugins: [svgoPlugin, jsxPlugin],
  svgProps: {
    width: "{size}",
    height: "{size}",
    color: "{color}",
  },
};
```

## 📝 규칙 및 제약사항

### 1. 파일명 규칙

모든 SVG 파일명은 **엄격한 kebab-case**를 사용해야 한다.

커스텀 규칙: 소문자 알파벳(a-z)과 단일 대시(-)만 허용되며, 숫자, 선행/후행 대시, 이중 대시는 허용되지 않는다. (`/^[a-z]+(-[a-z]+)*$/`)

✅ **올바른 예:**

- `my-icon.svg`
- `chevron-down.svg`
- `user-profile.svg`

❌ **잘못된 예:**

- `MyIcon.svg` (PascalCase)
- `my_icon.svg` (snake_case)
- `myIcon.svg` (camelCase)
- `icon-2.svg` (숫자 포함)
- `-my-icon.svg` (선행 대시)
- `my-icon-.svg` (후행 대시)
- `my--icon.svg` (이중 대시)

### 2. 중복 검증

빌더는 다음 두 가지 중복을 자동으로 검증한다:

1. **컴포넌트 이름 중복**: 서로 다른 카테고리에도 동일한 이름의 아이콘은 허용되지 않는다.

   ```
   ❌ assets/media/user.svg
   ❌ assets/app/user.svg
   ```

2. **SVG 내용 중복**: 동일한 SVG 내용을 가진 파일이 여러 개 존재할 수 없다.

### 3. 디렉토리 구조

- **FamilySvgBuilder**: `assets/[category]/[icon-name].svg` 구조 필수
- **StandaloneSvgBuilder**: `assets/[icon-name].svg` 플랫 구조 사용

## 🔄 워크플로우

`generate()` 메서드는 다음 순서로 실행된다:

1. **Clean**: `src/` 디렉토리의 기존 `.tsx` 및 `index.ts` 파일 삭제
2. **Process**: `assets/` 디렉토리의 모든 SVG 파일을 스캔하고 변환
3. **Generate Barrels**: `index.ts` 배럴 파일 자동 생성
4. **Summary**: 변환 결과 요약 출력
