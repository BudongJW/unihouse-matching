import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

const REDIRECT_URI = Linking.createURL("oauth");

export async function startKakaoLogin() {
  const authUrl =
    "https://kauth.kakao.com/oauth/authorize" +
    "?response_type=code" +
    `&client_id=🔧KAKAO_REST_API_KEY` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  const result = await WebBrowser.openAuthSessionAsync(
    authUrl,
    REDIRECT_URI
  );

  if (result.type === "success" && result.url) {
    const parsed = Linking.parse(result.url);
    const code = parsed.queryParams?.code;

    if (code) {
      // 🔧 여기서 백엔드로 code 전달
      // POST /auth/kakao
      return code;
    }
  }
}
