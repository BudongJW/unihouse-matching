import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "🔧GOOGLE_CLIENT_ID",
    scopes: ["profile", "email"],
  });

  return { request, response, promptAsync };
}
