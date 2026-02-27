# @justkits/auth

## 0. Motivation & Philosophy

사이드 프로젝트를 진행하는데 있어, 반복적인 Auth 관련 코드를 매번 작성하는게 귀찮아서 공통 로직을 라이브러리화 해서 재사용하면 어떨까 하는 생각에 시작하게된 라이브러리.

본 라이브러리는 React SPA 앱에 적합한 Auth 라이브러리로, NextJS 등 SSR 환경에서는 사용하지 않는 것을 추천한다.

### Clarification

본 프로젝트에서 `token refresh`는 토큰을 갱신하는 기능을 말하고, `refresh token`은 리프레시 토큰 객체를 지칭한다.

---

## Architecture

`Refresh Token`은 `httpOnly cookies`로, `Access Token`은 `in-memory store`로 처리한다.

## Future Considerations

- React Strict Mode를 고려해서 initialize 로직 수정
- Access 토큰의 exp를 파싱해서, 1분정도 전에 refresh를 스케줄링하는 로직 추가
- Token Refresh의 모든 실패 케이스를 똑같이 처리하는데, 이걸 구체화 하는 전략
  - 가령, 네트워크 연결 상태 불량으로 인한 token refresh 실패는 유저가 오프라인이어서 실패하는 것과 다르게 처리할 수 있다.
