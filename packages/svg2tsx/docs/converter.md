# @justkits/svg2tsx converter 동작 방식

svg2tsx CLI에서 SVG → React 컴포넌트로 자동 변환하는 기능을 담당하는 코어 로직에 대한 간단한 설명

## 목차

- [핵심 기능](#-핵심-기능)
- [워크플로우](#-워크플로우)
- [사용 가능한 빌더](#-사용-가능한-빌더)

## 📘 핵심 기능

본 CLI 프로그램의 converter는 SVGR을 기반으로 SVG 파일을 React 컴포넌트(`.tsx`)로 자동 변환하는 빌더 시스템을 담당한다. 핵심 기능은 아래와 같다:

- ✅ **자동 변환**: SVG 파일을 TypeScript React 컴포넌트로 자동 변환
- ✅ **중복 검증**: 컴포넌트 이름 및 SVG 내용 중복 자동 감지
- ✅ **병렬 처리**: 대량의 SVG 파일을 효율적으로 처리
- ✅ **커스터마이징**: 템플릿 및 SVGR 옵션 완전 커스터마이징 가능
- ✅ **플랫폼 독립적**: 옵션을 설정하여 Web과 React Native 모두 지원 가능
- ✅ **배럴 파일 생성**: 옵션 설정을 통해 자동으로 `index.ts` 배럴 파일 생성 가능

## 🔄 워크플로우

`generate` 워크플로우 내부에서는 다음 순서로 변환이 실행된다:

1. **Clean**: `src/` 디렉토리의 기존 `.tsx` 및 `index.ts` 파일 삭제
2. **Process**: `assets/` 디렉토리의 모든 SVG 파일을 스캔하고 변환
3. **Generate Barrels**: `index.ts` 배럴 파일 자동 생성 (설정 시)
4. **Summary**: 변환 결과 요약 출력

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
