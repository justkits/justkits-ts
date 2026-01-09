# @justkits/svg2tsx 옵션 설정 방법

프로젝트 루트에 `svg.config.ts` (또는 `.js`, `.mjs`, `.cjs`) 파일을 생성하여 동작을 커스터마이징할 수 있다.

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

  // SVGR 설정 옵션
  options: {
    typescript: true,
    icon: true,
    // ... 기타 SVGR 옵션
  },
});
```

## 설정 옵션

| 옵션      | 타입                       | 기본값           | 설명                                                                        |
| --------- | -------------------------- | ---------------- | --------------------------------------------------------------------------- |
| `type`    | `'standalone' \| 'family'` | `'standalone'`   | 컴포넌트 생성 구조를 결정한다.                                              |
| `suffix`  | `string`                   | `""`             | 생성된 컴포넌트 이름 뒤에 추가할 문자열이다.                                |
| `options` | `Config` (SVGR)            | `defaultOptions` | [SVGR 설정](https://react-svgr.com/docs/options/)과 동일한 옵션을 지원한다. |
| `baseDir` | `string`                   | `process.cwd()`  | `assets`와 `src` 폴더가 위치한 기준 디렉토리다.                             |

---

## 커스텀 템플릿 사용하기

생성되는 React 컴포넌트의 구조를 변경하고 싶다면 `options.template`을 사용하여 커스텀 템플릿을 정의할 수 있다.

```typescript
// svg.config.ts
import { defineConfig } from "@justkits/svg2tsx";

export default defineConfig({
  options: {
    // SVGR 템플릿 정의
    template: (variables, { tpl }) => {
      return tpl`
        ${variables.imports}
        import type { IconProps } from './types';

        export function ${variables.componentName}({ size = 24, color = "currentColor" }: IconProps) {
          return (${variables.jsx});
        }
      `;
    },
  },
});
```

더 자세한 템플릿 작성 방법은 [SVGR Custom Template](https://react-svgr.com/docs/templates/) 문서를 참고한다.

## SVGO 옵션 커스터마이징

SVGO 옵션 역시 SVGR에서 사용하는 것처럼 커스터마이징이 가능하다.

```typescript
// svg.config.ts
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
// svg.config.ts
import { defineConfig } from "@justkits/svg2tsx";

export default defineConfig({
  options: {
    native: true,
  },
});
```
