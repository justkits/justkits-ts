# JustKits ESLint 구성

이 패키지는 JustKits 프로젝트에서 사용되는 표준 ESLint 구성을 제공합니다. TypeScript, React, JSON, Markdown을 위한 규칙을 포함하며, [Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new) 형식을 사용합니다.

## 설치

프로젝트의 개발 의존성으로 이 패키지를 설치합니다:

```bash
pnpm add -D @justkits/eslint-config
```

## 사용법

`eslint.config.js` 파일을 프로젝트 루트에 생성하고 필요에 따라 구성을 가져와 사용합니다.

### 1. 전체 구성 (All-in-One)

가장 간단한 방법은 모든 규칙(Base, React, JSON, Markdown)이 포함된 `allConfig`를 사용하는 것입니다.

```javascript
// eslint.config.js
import { allConfig } from "@justkits/eslint-config";

export default [
  ...allConfig,
  // 여기에 프로젝트별 추가 규칙을 정의할 수 있습니다.
  // 예:
  // {
  //   rules: {
  //     'no-console': 'warn',
  //   }
  // }
];
```

### 2. 기본 구성 (Granular)

필요한 구성만 선택적으로 사용하고 싶다면 `baseConfig`를 기반으로 직접 조합할 수 있습니다.

`baseConfig`는 TypeScript와 JavaScript 파일에 대한 기본적인 규칙을 포함합니다.

```javascript
// eslint.config.js
import {
  baseConfig,
  reactConfig,
  jsonConfig,
  markdownConfig,
} from "@justkits/eslint-config";

export default [
  ...baseConfig,
  ...reactConfig, // React 프로젝트인 경우
  jsonConfig, // JSON 파일을 린트할 경우
  markdownConfig, // Markdown 파일을 린트할 경우
  // 추가적인 프로젝트별 규칙
];
```

### 개별 구성 상세

- **`baseConfig`**:
  - `**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}` 파일 대상
  - `@eslint/js`의 `recommended` 규칙 적용
  - `typescript-eslint`의 `recommended` 규칙 적용
  - `node_modules`, `dist` 등 일반적인 폴더 무시

- **`reactConfig`**:
  - React 프로젝트를 위한 구성 (`eslint-plugin-react`의 `recommended`)
  - `react/react-in-jsx-scope` 규칙 비활성화 (최신 React에서는 불필요)
  - CSS 파일(`.css`)에 대한 기본 린트 규칙 포함

- **`jsonConfig`**:
  - `**/*.{json,jsonc,json5}` 파일 대상
  - JSON 형식의 유효성을 검사

- **`markdownConfig`**:
  - `**/*.md` 파일 대상
  - GitHub Flavored Markdown 내의 코드 블록을 린트

프로젝트의 특성에 맞게 필요한 구성을 조합하여 사용하세요.
