# @justkits/svg2tsx 옵션 설정 방법

프로젝트 루트에 `svg2tsx.config.ts` 파일을 생성하여 동작을 커스터마이징할 수 있다.

## 목차

- [설정 옵션](#설정-옵션)
- [커스텀 템플릿 사용하기](#커스텀-템플릿-사용하기)
- [SVGO 옵션 커스터마이징](#svgo-옵션-커스터마이징)
- [React Native 지원](#react-native-지원)

```typescript
import { defineConfig } from "@justkits/svg2tsx";

export default defineConfig({
  // 빌더 타입: 'standalone' (기본값) 또는 'family'
  type: "standalone",

  // 컴포넌트 이름 뒤에 붙을 접미사 (예: 'Icon')
  suffix: "Icon",

  // index.ts 배럴 파일 생성 여부
  index: true,

  // 커스텀 assets 디렉토리 경로 (baseDir 기준 상대경로 또는 절대경로)
  assetsDir: "assets",

  // 커스텀 src 디렉토리 경로 (baseDir 기준 상대경로 또는 절대경로)
  srcDir: "src",

  // SVGR 설정 옵션
  options: {
    typescript: true,
    icon: true,
    // ... 기타 SVGR 옵션
  },
});
```

## 설정 옵션

| 옵션        | 타입                       | 기본값           | 설명                                                                            |
| ----------- | -------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `type`      | `'standalone' \| 'family'` | `'standalone'`   | 컴포넌트 생성 구조를 결정한다.                                                  |
| `suffix`    | `string`                   | `""`             | 생성된 컴포넌트 이름 뒤에 추가할 문자열이다.                                    |
| `index`     | `boolean`                  | `false`          | `index.ts` 배럴 파일 생성 여부를 결정한다.                                      |
| `options`   | `Config` (SVGR)            | `defaultOptions` | [SVGR 설정](https://react-svgr.com/docs/options/)과 동일한 옵션을 지원한다.     |
| `baseDir`   | `string`                   | `process.cwd()`  | `assetsDir`와 `srcDir`의 기준 디렉토리다.                                       |
| `assetsDir` | `string`                   | `"assets"`       | SVG 파일이 위치한 디렉토리 경로다. (baseDir 기준 상대경로 또는 절대경로)        |
| `srcDir`    | `string`                   | `"src"`          | 변환된 컴포넌트가 출력될 디렉토리 경로다. (baseDir 기준 상대경로 또는 절대경로) |

---

## 커스텀 템플릿 사용하기

생성되는 React 컴포넌트의 구조를 변경하고 싶다면 `options.template`을 사용하여 커스텀 템플릿을 정의할 수 있다.

기본적으로 `size`와 `color` 같은 커스텀 props를 지원하려면 다음과 같은 3단계 설정이 필요하다.

### 1단계: 타입 정의 (types.ts)

svg2tsx는 매니페스트(`.svg2tsx/manifest.json`)에 기록된 파일만 삭제하므로, 직접 작성한 `src/types.ts` 같은 파일은 보존된다. 이 파일에 공통 인터페이스를 정의한다.

```typescript
// src/types.ts
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}
```

### 2단계: 설정 파일 작성 (svg2tsx.config.ts)

`svgProps`를 사용하여 SVG 속성을 props로 매핑하고, 템플릿에서 이를 활용하도록 설정한다.

```typescript
// svg2tsx.config.ts
import { defineConfig } from "@justkits/svg2tsx";

export default defineConfig({
  options: {
    // 1. SVG 속성 매핑 (width/height -> size, color -> color)
    svgProps: {
      width: "{size}",
      height: "{size}",
      color: "{color}",
    },
    // 2. SVGR 템플릿 정의
    template: (variables, { tpl }) => {
      return tpl`
        ${variables.imports}
        import type { IconProps } from '../types'; 
        // ⚠️ Family 모드는 '../types', Standalone 모드는 './types' 경로 주의

        export function ${variables.componentName}({ size = 24, color = "currentColor", ...props }: IconProps) {
          return (${variables.jsx});
        }
      `;
    },
  },
});
```

> **주의**: `FamilySvgBuilder`를 사용하는 경우 컴포넌트가 하위 폴더(`src/category/components/`)에 생성되므로 `types.ts`를 import 할 때 `../../../types` 등의 경로 조정이 필요할 수 있다. 프로젝트 구조에 맞게 import 경로를 설정해야 한다.

더 자세한 템플릿 작성 방법은 [SVGR Custom Template](https://react-svgr.com/docs/templates/) 문서를 참고한다.

## SVGO 옵션 커스터마이징

SVGO 옵션 역시 SVGR에서 사용하는 것처럼 커스터마이징이 가능하다.

```typescript
// svg2tsx.config.ts
import { defineConfig } from "@justkits/svg2tsx";

export default defineConfig({
  options: {
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
  },
});
```

## React Native 지원

React Native에서 사용할 아이콘을 생성하려면, `native` 옵션을 `true`로 설정하면 된다. 단, 사용하는 프로젝트에서 `react-native-svg` 패키지를 반드시 설치해야 한다.

```typescript
// svg2tsx.config.ts
import { defineConfig } from "@justkits/svg2tsx";

export default defineConfig({
  options: {
    native: true,
  },
});
```
