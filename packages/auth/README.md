# @justkits/auth

## 0. Motivation & Philosophy

사이드 프로젝트를 진행하는데 있어, 반복적인 Auth 관련 코드를 매번 작성하는게 귀찮아서 공통 로직을 라이브러리화 해서 재사용하면 어떨까 하는 생각에 시작하게된 작은 라이브러리. 간편하게 사용할 수 있는 React 라이브러리로서, 쉽게 가져가서 쓸 수 있는 유틸리티들을 제공한다.

추후, 필요성을 느끼게 된다면, 범위를 넓혀 SPA와 SSR 환경에 (Next.js 포함) 모두 활용할 수 있는 개발자 친화적인 범용 라이브러리를 목표로 프로젝트 규모를 키울 생각도 있다. 그러나, 초기에는 일단 내가 직접 사이드 프로젝트에 사용할 기능들만 추가해서 배포하고, 필요하다면 조금씩 점차 완성도를 높여가며, 적절한 시기가 오면 공개여부를 다시 결정한다.

### Clarification

본 프로젝트에서 `token refresh`는 토큰을 갱신하는 기능을 말하고, `refresh token`은 리프레시 토큰 객체를 지칭한다.

---

## 1. 계획

Auth 라이브러리를 개발하는게 계획을 어떻게 하느냐에 따라 규모가 천차만별이 될 수 있기 때문에, 각 Phase 별로 어떤 기능들을 추가하였는지 기록한다.

### Phase 1 (v0): 유틸리티 Hook

첫 페이즈때 이 라이브러리는 프론트엔드를 위한 **유틸리티 모음집**이다. 복잡한 로직은 일단 추후로 미뤄두고, 별도 설정 없이 단순한 선언만 해도 사용할 수 있는 유틸리티들을 만들어서 배포한다. 먼저, 내 사이드 프로젝트들은 전부 httpOnly cookies를 기반으로 인증 로직들이 동작한다. 따라서, 그에 맞게 아래 3가지 기능들을 먼저 제공한다.

- `Session Initialize`: 앱 초기 렌더링 시 refreshFn을 호출하고, 완료 여부를 상태로 제공한다
- `Auth Sync`: BroadcastChannel API를 활용한 브라우저 탭간 이벤트 동기화 (2가지 방식을 제공한다: 강제 리프레시 / Silent)
- `Auto Refresh`: Axios 인스턴스에 Silent Refresh 기능을 연결할 수 있는 유틸리티

#### Auth Workflow

이 페이즈에서의 기본적인 Auth 워크플로우는 다음과 같다:

- **아키텍처**: `Refresh Token`은 `httpOnly cookies`로, `Access Token`은 `in-memory store`로 처리한다.
- **인증 서비스 (서버)**:
  - 프론트엔드가 NextJS처럼 BFF 서버가 있는 구성이라면, 인증 서비스에서 access와 refresh 토큰들을 모두 body에 담아 BFF 서버로 보내준다
  - 프론트엔드가 SPA 구성이라면, 인증 서비스에서 access 토큰은 body에 refresh 토큰은 쿠키에 담아서 전송한다
- **BFF 서버 (optional)**:
  - 인증 서비스로부터 넘어온 refresh 토큰을 middleware를 통해 httpOnly 쿠키로 처리하고 클라이언트로 전송한다.
- **클라이언트**:
  - 초기 렌더링 시, 가장 먼저 token refresh API를 호출해서 access token을 발급받는다
    - access token을 발급받는데 성공하면, 로그인 성공처리
    - 실패하면 로그아웃 처리한다
  - access token 만료가 임박하거나 만료가 되어 요청에 401이나 403 응답이 돌아왔다면, silent refresh처리를 한다 (race condition을 잘 처리할 수 있도록 request queue를 구현하여 제공한다)
  - Broadcast Channel API를 통해 로그인 성공 / 로그아웃 이벤트 발생 시 탭간 상태를 동기화한다.
