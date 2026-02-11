export function decodeJWT(token: string) {
  try {
    // 0. 토큰을 . 으로 분리하고, 총 3부분인지 확인
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // 1. Payload 부분을 추출
    const payload = parts[1];

    // 2. base64url 형식을 base64 형식으로 변환
    const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");

    // 3. base64 디코딩
    // atob는 ASCII 문자열을 디코딩하므로, UTF-8 문자를 처리하기 위해
    // URI 컴포넌트로 변환하는 과정을 거친다
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + (c.codePointAt(0) ?? 0).toString(16)).slice(-2);
        })
        .join(""),
    );

    // 4. JSON 파싱
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
