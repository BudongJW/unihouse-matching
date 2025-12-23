import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type EmailLoginPayload = {
  email: string;
  password: string;
};

type NavigationLike = {
  navigate?: (screen: string) => void;
};

type LoginScreenProps = {
  navigation?: NavigationLike;
  onEmailLogin?: (payload: EmailLoginPayload) => void | Promise<void>;
  onGoogleLogin?: () => void | Promise<void>;
  onKakaoLogin?: () => void | Promise<void>;
  onGoSignUp?: () => void;
};

export default function LoginScreen({
  navigation, // (Stack에서 넘기는 경우)
  onEmailLogin,
  onGoogleLogin,
  onKakaoLogin,
  onGoSignUp,
}: LoginScreenProps) {
  const [email, setEmail] = useState<string>("");
  const [pw, setPw] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && pw.trim().length >= 4 && !loading,
    [email, pw, loading]
  );

  const run = async (fn?: () => void | Promise<void>) => {
    if (!fn) return;
    try {
      setLoading(true);
      await fn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoIcon}>
            <Ionicons name="home" size={22} color="#ffffff" />
          </View>
          <Text style={styles.logoText}>UniHouse</Text>
        </View>
        <Text style={styles.tagline}>대학생 룸메이트 매칭 플랫폼</Text>

        {/* Form */}
        <View style={styles.formWrap}>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={20} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <View style={[styles.inputRow, { marginTop: 12 }]}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={pw}
              onChangeText={setPw}
              editable={!loading}
            />
          </View>

          {/* 이메일 로그인 */}
          <TouchableOpacity
            style={[styles.primaryBtn, !canSubmit && styles.btnDisabled]}
            disabled={!canSubmit}
            onPress={() => run(() => onEmailLogin?.({ email, password: pw }))}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.primaryBtnText}>로그인</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={[styles.googleBtn, loading && styles.btnDisabled]}
            onPress={() => run(onGoogleLogin)}
            activeOpacity={0.9}
            disabled={loading}
          >
            <View style={styles.googleIconCircle}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>구글로 로그인</Text>
          </TouchableOpacity>

          {/* Kakao */}
          <TouchableOpacity
            style={[styles.kakaoBtn, loading && styles.btnDisabled]}
            onPress={() => run(onKakaoLogin)}
            activeOpacity={0.9}
            disabled={loading}
          >
            <View style={styles.kakaoBubble}>
              <Text style={styles.kakaoTalk}>Talk</Text>
            </View>
            <Text style={styles.kakaoBtnText}>카카오톡으로 로그인</Text>
          </TouchableOpacity>

          {/* Sign up */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>계정이 없으신가요?</Text>
            <TouchableOpacity
              onPress={() => {
                if (onGoSignUp) onGoSignUp();
                else navigation?.navigate?.("SignUp");
              }}
              disabled={loading}
            >
              <Text style={styles.bottomLink}> 회원가입</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.authNotice}>
            * 구글/카카오 로그인은 버튼 클릭 시 OAuth를 시작하도록 연결하면 됨.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 26,
    alignItems: "center",
  },

  // Logo
  logoWrap: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: { fontSize: 34, fontWeight: "800", color: "#0f172a" },
  tagline: {
    marginTop: 10,
    marginBottom: 30,
    fontSize: 14,
    color: "#64748b",
  },

  // Form
  formWrap: { width: "100%", maxWidth: 420 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    backgroundColor: "#ffffff",
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: "#0f172a" },

  primaryBtn: {
    marginTop: 18,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#ffffff", fontSize: 20, fontWeight: "800" },
  btnDisabled: { opacity: 0.45 },

  dividerRow: {
    marginTop: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e2e8f0" },
  dividerText: { marginHorizontal: 12, color: "#64748b", fontWeight: "700" },

  // Google
  googleBtn: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  googleIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  googleG: { fontSize: 16, fontWeight: "900", color: "#ef4444" },
  googleBtnText: { fontSize: 16, fontWeight: "800", color: "#334155" },

  // Kakao
  kakaoBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FEE500",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  kakaoBubble: {
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 10,
  },
  kakaoTalk: { color: "#FEE500", fontWeight: "900" },
  kakaoBtnText: { fontSize: 16, fontWeight: "900", color: "#111827" },

  // Bottom
  bottomRow: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
  },
  bottomText: { color: "#64748b", fontSize: 14 },
  bottomLink: { color: "#F59E0B", fontWeight: "900", fontSize: 14 },

  authNotice: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 12,
  },
});
