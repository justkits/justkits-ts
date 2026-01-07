# @justkits/svgs-cli

`@justkits/svgs-cli`는 SVG 파일을 React 컴포넌트로 자동 변환해주는 CLI 도구다. `@justkits/svgs-core`를 기반으로, 프로젝트의 요구사항에 맞춰 컴포넌트 생성 구조를 설정할 수 있다.

## 설치

```bash
pnpm add -D @justkits/svgs-cli
# 또는
npm install --save-dev @justkits/svgs-cli
```

## 사용법

패키지 루트에서 다음 명령어를 실행하여 SVG 컴포넌트를 생성한다.

```bash
npx svgs generate
```

설정 파일을 명시적으로 지정하려면 `-c` 또는 `--config` 옵션을 사용한다.

```bash
npx svgs generate --config custom.config.ts
```

## 설정 (svg.config.ts)

프로젝트 루트에 `svg.config.ts` (또는 `.js`, `.mjs`, `.cjs`) 파일을 생성하여 동작을 커스터마이징할 수 있다.

```typescript
import { defineConfig } from "@justkits/svgs-cli";

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

### 설정 옵션

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
import { defineConfig } from "@justkits/svgs-cli";

export default defineConfig({
  suffix: "Icon",
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

---

## 빌더 타입 상세

### 1. Standalone 모드 (`type: 'standalone'`)

단순한 플랫 구조의 프로젝트에 적합하다.

- **입력 (Assets):** `assets/*.svg`
- **출력 (Source):** `src/components/*.tsx`
- **배럴 파일:** `src/index.ts` (모든 컴포넌트를 export)

### 2. Family 모드 (`type: 'family'`)

아이콘을 카테고리(Family)별로 분류하여 관리할 때 적합하다.

- **입력 (Assets):** `assets/[family-name]/*.svg` (예: `assets/media/play.svg`)
- **출력 (Source):** `src/[family-name]/components/*.tsx`
- **배럴 파일:**
  - `src/[family-name]/index.ts`: 해당 family의 컴포넌트들을 export
  - `src/index.ts`: 모든 family의 컴포넌트들을 통합하여 export
