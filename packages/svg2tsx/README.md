# @justkits/svg2tsx

## 개요

`@justkits/svg2tsx`는 SVG를 React에 사용할 때, 가장 널리 사용되는 툴인 `svgr`을 사용 편의성을 위해 커스터마이징한 툴로, SVG 파일 세트를 React 컴포넌트로 자동 변환해주는 CLI 도구다.

내부 동작 방식은 [동작 원리 문서](./docs/converter.md)에서 확인할 수 있다.

## 목차

- [설치](#설치)
- [사용법](#사용법)
- [규칙 및 제약사항](#-규칙-및-제약사항)

## 설치

```bash
pnpm add -D @justkits/svg2tsx
# 또는
npm install --save-dev @justkits/svg2tsx
```

## 사용법

먼저, 패키지 내부에서 `assets/` 폴더(또는 설정한 커스텀 디렉토리) 안에 SVG 파일들을 저장한다. 그 다음, 패키지 루트에서 다음 명령어를 실행하여 React 컴포넌트로 변환한다.

```bash
pnpm svg2tsx generate
```

설정 파일을 명시적으로 지정하려면 `-c` 또는 `--config` 옵션을 사용한다. (기본적으로 프로젝트 루트에 svg2tsx.config.ts를 두면 자동으로 감지 & 적용한다)

```bash
npx svg2tsx generate --config custom.config.ts
```

설정 관련 자세한 내용은 [설정 문서](./docs/settings.md)를 참고하면 된다. 특히 커스텀 템플릿과 타입 정의를 활용하는 예시는 [여기](./docs/settings.md#커스텀-템플릿-사용하기)에서 확인할 수 있다.

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

   ```text
   ❌ assets/media/user.svg
   ❌ assets/app/user.svg
   ```

2. **SVG 내용 중복**: 동일한 SVG 내용을 가진 파일이 여러 개 존재할 수 없다.

### 3. 디렉토리 구조

- **FamilySvgBuilder**: `assets/[category]/[icon-name].svg` 구조 필수
- **StandaloneSvgBuilder**: `assets/[icon-name].svg` 플랫 구조 사용

### 4. 출력 경로 및 파일 보존

- **출력 경로**: 기본적으로 변환 결과물은 패키지 루트의 `src/` 디렉토리로 출력된다. `assetsDir`과 `srcDir` 옵션을 통해 입출력 디렉토리를 커스터마이징할 수 있다. 자세한 내용은 [설정 문서](./docs/settings.md)를 참고한다.
- **파일 보존**: 출력 폴더 내의 파일들은 생성 시 초기화되지만, `types.ts` 파일은 삭제되지 않고 보존된다. 공통 타입 정의가 필요한 경우 출력 폴더의 `types.ts`에 작성하면 된다.
