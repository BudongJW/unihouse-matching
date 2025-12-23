import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

/**
 * ✅ 중요: app.json(app.config.js)에 아래 추가 필요
 * {
 *   "expo": { "scheme": "unihouse" }
 * }
 * 변경 후 앱 재시작 필수
 */

/** -----------------------------
 *  🔧 환경설정 값
 *  ----------------------------- */
const KAKAO_REST_API_KEY = "🔧KAKAO_REST_API_KEY";

const GOOGLE_EXPO_CLIENT_ID = "🔧GOOGLE_EXPO_CLIENT_ID";
const GOOGLE_IOS_CLIENT_ID = "🔧GOOGLE_IOS_CLIENT_ID";
const GOOGLE_ANDROID_CLIENT_ID = "🔧GOOGLE_ANDROID_CLIENT_ID";
const GOOGLE_WEB_CLIENT_ID = "🔧GOOGLE_WEB_CLIENT_ID";

/** -----------------------------
 *  Types
 *  ----------------------------- */
type Listing = {
  id: string;
  title: string;
  campus: string;
  rent: number;
  deposit: number;
  gender: string;
  desc: string;
};

type User =
  | { provider: "email"; email: string }
  | { provider: "google"; accessToken?: string }
  | { provider: "kakao"; code: string };

type EmailLoginPayload = { email: string; password: string };
type SignUpPayload = { email: string; name: string };

type NavLike = {
  navigate: (screen: string, params?: any) => void;
  goBack?: () => void;
};

type LoginScreenProps = {
  navigation: NavLike;
  onEmailLogin?: (payload: EmailLoginPayload) => void | Promise<void>;
  onGoogleLogin?: () => void | Promise<void>;
  onKakaoLogin?: () => void | Promise<void>;
};

type SignUpScreenProps = {
  navigation: NavLike;
  onSignUp?: (payload: SignUpPayload) => void | Promise<void>;
};

type AuthNavigatorProps = {
  onLogin: (u: User) => void;
  onGoogleLogin: () => void | Promise<void>;
  onKakaoLogin: () => void | Promise<void>;
};

type TabNavigatorProps = {
  onLogout: () => void;
  user: User;
};

/** -----------------------------
 *  Mock Data
 *  ----------------------------- */
const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "OO대학교 도보 5분 투룸 / 남성 룸메 구함",
    campus: "OO대학교",
    rent: 35,
    deposit: 200,
    gender: "남성",
    desc: "조용하고 깔끔한 성격이면 좋겠음. 생활 패턴 비슷한 분 환영.",
  },
  {
    id: "2",
    title: "원룸 쉐어 / 여성 룸메이트",
    campus: "XX대학교",
    rent: 40,
    deposit: 100,
    gender: "여성",
    desc: "기숙사 느낌으로 함께 살 분 찾는 중. 비흡연자만.",
  },
  {
    id: "3",
    title: "역 바로 앞 오피스텔 / 성별무관",
    campus: "OO대학교",
    rent: 50,
    deposit: 300,
    gender: "무관",
    desc: "역세권, 편의점/카페 근처. 자취 경력 있으면 좋음.",
  },
];

/** -----------------------------
 *  Navigation
 *  ----------------------------- */
const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/** -----------------------------
 *  Login Screen (구글/카카오 버튼 props 연결)
 *  ----------------------------- */
const LoginScreen: React.FC<LoginScreenProps> = ({
  navigation,
  onEmailLogin,
  onGoogleLogin,
  onKakaoLogin,
}) => {
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
        style={styles.loginContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* 로고 */}
        <View style={styles.logoWrap}>
          <View style={styles.logoIcon}>
            <Ionicons name="home" size={22} color="#ffffff" />
          </View>
          <Text style={styles.logoText}>UniHouse</Text>
        </View>
        <Text style={styles.tagline}>대학생 룸메이트 매칭 플랫폼</Text>

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

          {/* 이메일 로그인 (임시) */}
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

          {/* 회원가입 이동(일단 화면만) */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>계정이 없으신가요?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignUp")}
              disabled={loading}
            >
              <Text style={styles.bottomLink}> 회원가입</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.authNotice}>
            * 소셜 로그인 성공 시 임시로 로그인 처리한다. 다음 단계에서 백엔드 JWT로 연결하면 됨.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/** -----------------------------
 *  SignUp Screen (간단)
 *  ----------------------------- */
const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation, onSignUp }) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pw, setPw] = useState<string>("");
  const [pw2, setPw2] = useState<string>("");

  const pwOk = pw.trim().length >= 6;
  const matchOk = pw === pw2 && pw2.length > 0;
  const canSubmit = Boolean(name.trim() && email.trim() && pwOk && matchOk);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.authContainer}>
          <Text style={styles.brandTitle}>UniHouse</Text>
          <Text style={styles.brandSub}>회원가입</Text>

          <View style={styles.authCard}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.basicInput}
              placeholder="예) 재원"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.basicInput}
              placeholder="example@university.ac.kr"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.basicInput}
              placeholder="6자 이상"
              secureTextEntry
              value={pw}
              onChangeText={setPw}
            />
            {!pwOk && pw.length > 0 ? (
              <Text style={styles.warnText}>비밀번호는 6자 이상 권장</Text>
            ) : null}

            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={styles.basicInput}
              placeholder="비밀번호 재입력"
              secureTextEntry
              value={pw2}
              onChangeText={setPw2}
            />
            {!matchOk && pw2.length > 0 ? (
              <Text style={styles.warnText}>비밀번호가 일치하지 않음</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryBtn, !canSubmit && styles.btnDisabled]}
              disabled={!canSubmit}
              onPress={() => onSignUp?.({ email, name })}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnText}>가입하고 시작하기</Text>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 14,
              }}
            >
              <Text style={{ color: "#64748b" }}>이미 계정이 있나요?</Text>
              <TouchableOpacity onPress={() => navigation.goBack?.()}>
                <Text style={{ color: "#2563eb", fontWeight: "800" }}>
                  {" "}
                  로그인
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.authNotice}>
            * 학교 이메일 인증/약관동의는 다음 단계에서 추가하면 됨.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/** -----------------------------
 *  Auth Navigator
 *  ----------------------------- */
const AuthNavigator: React.FC<AuthNavigatorProps> = ({
  onLogin,
  onGoogleLogin,
  onKakaoLogin,
}) => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" options={{ headerShown: false }}>
        {(props: any) => (
          <LoginScreen
            {...props}
            onEmailLogin={({ email }) => onLogin({ provider: "email", email })}
            onGoogleLogin={onGoogleLogin}
            onKakaoLogin={onKakaoLogin}
          />
        )}
      </AuthStack.Screen>

      <AuthStack.Screen name="SignUp" options={{ title: "회원가입" }}>
        {(props: any) => (
          <SignUpScreen {...props} onSignUp={onLogin as any} />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};

/** -----------------------------
 *  Kakao OAuth helper (OAuth + 딥링크)
 *  ----------------------------- */
async function startKakaoLogin(): Promise<string | null> {
  const redirectUri = Linking.createURL("oauth"); // unihouse://oauth
  const authUrl =
    "https://kauth.kakao.com/oauth/authorize" +
    "?response_type=code" +
    `&client_id=${KAKAO_REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === "success" && result.url) {
    const parsed = Linking.parse(result.url);
    const code = parsed.queryParams?.code;
    if (typeof code === "string" && code.length > 0) return code;
  }
  return null;
}

/** -----------------------------
 *  Main Screens
 *  ----------------------------- */
const HomeScreen: React.FC<{ navigation: NavLike }> = ({ navigation }) => {
  const [keyword, setKeyword] = useState<string>("");
  const [filtered, setFiltered] = useState<Listing[]>(MOCK_LISTINGS);

  const handleSearch = (text: string) => {
    setKeyword(text);
    if (!text) return setFiltered(MOCK_LISTINGS);
    const lower = text.toLowerCase();
    setFiltered(
      MOCK_LISTINGS.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          item.campus.toLowerCase().includes(lower)
      )
    );
  };

  const renderItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ListingDetail", { listing: item })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSub}>
        {item.campus} · 월세 {item.rent}만 / 보증금 {item.deposit}만
      </Text>
      <Text style={styles.cardTag}>선호 성별: {item.gender}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.desc}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#f9fafb" }]}>
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>매물 게시판</Text>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="학교명, 제목으로 검색"
            value={keyword}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>
    </SafeAreaView>
  );
};

const ListingDetailScreen: React.FC<{ route: any }> = ({ route }) => {
  const { listing } = route.params as { listing: Listing };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#f9fafb" }]}>
      <ScrollView style={styles.screenContainer}>
        <Text style={styles.detailTitle}>{listing.title}</Text>

        <View style={styles.detailBox}>
          <Text style={styles.detailRow}>
            캠퍼스: <Text style={styles.detailValue}>{listing.campus}</Text>
          </Text>
          <Text style={styles.detailRow}>
            월세: <Text style={styles.detailValue}>{listing.rent}만원/월</Text>
          </Text>
          <Text style={styles.detailRow}>
            보증금: <Text style={styles.detailValue}>{listing.deposit}만원</Text>
          </Text>
          <Text style={styles.detailRow}>
            선호 성별: <Text style={styles.detailValue}>{listing.gender}</Text>
          </Text>
        </View>

        <Text style={styles.sectionTitle}>상세 설명</Text>
        <Text style={styles.detailDesc}>{listing.desc}</Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: 16 }]}
          onPress={() => Alert.alert("채팅", "TODO: 채팅 화면 연결")}
        >
          <Text style={styles.primaryBtnText}>채팅으로 문의하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const CreateListingScreen: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [campus, setCampus] = useState<string>("");
  const [rent, setRent] = useState<string>("");
  const [deposit, setDeposit] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

  const handleSubmit = () => {
    console.log({ title, campus, rent, deposit, gender, desc });
    Alert.alert("등록", "임시: 콘솔 출력. 백엔드 붙이면 실제 등록으로 변경.");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#f9fafb" }]}>
      <ScrollView style={styles.screenContainer}>
        <Text style={styles.screenTitle}>룸메 모집글 작성</Text>

        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.basicInput}
          placeholder="예) OO대 도보 5분 투룸 / 룸메 구함"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>학교 / 캠퍼스</Text>
        <TextInput
          style={styles.basicInput}
          placeholder="예) OO대학교"
          value={campus}
          onChangeText={setCampus}
        />

        <Text style={styles.label}>월세 (만원)</Text>
        <TextInput
          style={styles.basicInput}
          keyboardType="numeric"
          placeholder="예) 35"
          value={rent}
          onChangeText={setRent}
        />

        <Text style={styles.label}>보증금 (만원)</Text>
        <TextInput
          style={styles.basicInput}
          keyboardType="numeric"
          placeholder="예) 200"
          value={deposit}
          onChangeText={setDeposit}
        />

        <Text style={styles.label}>선호 성별</Text>
        <TextInput
          style={styles.basicInput}
          placeholder="예) 남성 / 여성 / 무관"
          value={gender}
          onChangeText={setGender}
        />

        <Text style={styles.label}>상세 설명</Text>
        <TextInput
          style={[styles.basicInput, { height: 120, textAlignVertical: "top" }]}
          placeholder="집 구조, 생활 패턴, 하우스 룰 등"
          multiline
          value={desc}
          onChangeText={setDesc}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
          <Text style={styles.primaryBtnText}>등록하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const MyPageScreen: React.FC<{ onLogout: () => void; user: User }> = ({
  onLogout,
  user,
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#f9fafb" }]}>
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>마이페이지</Text>

        <View style={styles.detailBox}>
          <Text style={styles.detailRow}>
            provider: <Text style={styles.detailValue}>{user.provider}</Text>
          </Text>

          {"email" in user ? (
            <Text style={styles.detailRow}>
              email: <Text style={styles.detailValue}>{user.email}</Text>
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: "#ef4444" }]}
          onPress={onLogout}
        >
          <Text style={styles.primaryBtnText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/** -----------------------------
 *  Main Navigation
 *  ----------------------------- */
const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="Home" component={HomeScreen as any} options={{ title: "홈" }} />
    <HomeStack.Screen
      name="ListingDetail"
      component={ListingDetailScreen as any}
      options={{ title: "매물 상세" }}
    />
  </HomeStack.Navigator>
);

const TabNavigator: React.FC<TabNavigatorProps> = ({ onLogout, user }) => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#2563eb",
      tabBarInactiveTintColor: "#9ca3af",
    }}
  >
    <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: "게시판" }} />
    <Tab.Screen name="Create" component={CreateListingScreen} options={{ title: "글쓰기" }} />
    <Tab.Screen name="MyPage">
      {() => <MyPageScreen onLogout={onLogout} user={user} />}
    </Tab.Screen>
  </Tab.Navigator>
);

/** -----------------------------
 *  App Root (Google AuthSession + Kakao OAuth 연결 완료)
 *  ----------------------------- */
export default function App(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);

  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useAuthRequest({
      expoClientId: GOOGLE_EXPO_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ["profile", "email"],
    });

  useEffect(() => {
    if (googleResponse?.type === "success") {
      const accessToken = googleResponse.authentication?.accessToken;
      setUser({ provider: "google", accessToken });
    }
  }, [googleResponse]);

  const auth = useMemo(
    () => ({
      login: (u: User) => setUser(u),
      logout: () => setUser(null),
    }),
    []
  );

  const handleGoogleLogin = async (): Promise<void> => {
    if (!googleRequest) {
      Alert.alert("Google 로그인", "요청 객체가 준비되지 않았습니다. 잠시 후 다시 시도하세요.");
      return;
    }
    await googlePromptAsync();
  };

  const handleKakaoLogin = async (): Promise<void> => {
    const code = await startKakaoLogin();
    if (!code) {
      Alert.alert("Kakao 로그인", "로그인이 취소되었거나 실패했습니다.");
      return;
    }
    setUser({ provider: "kakao", code });
  };

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main">
            {() => <TabNavigator onLogout={auth.logout} user={user} />}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="Auth">
            {() => (
              <AuthNavigator
                onLogin={auth.login}
                onGoogleLogin={handleGoogleLogin}
                onKakaoLogin={handleKakaoLogin}
              />
            )}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

/** -----------------------------
 *  Styles
 *  ----------------------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },

  // Login
  loginContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 26,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
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
  tagline: { marginTop: 10, marginBottom: 30, fontSize: 14, color: "#64748b" },
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

  dividerRow: { marginTop: 18, marginBottom: 14, flexDirection: "row", alignItems: "center" },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e2e8f0" },
  dividerText: { marginHorizontal: 12, color: "#64748b", fontWeight: "700" },

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

  bottomRow: { marginTop: 22, flexDirection: "row", justifyContent: "center" },
  bottomText: { color: "#64748b", fontSize: 14 },
  bottomLink: { color: "#F59E0B", fontWeight: "900", fontSize: 14 },
  authNotice: { fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 12 },

  // SignUp
  authContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 28,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  brandTitle: { fontSize: 32, fontWeight: "800", textAlign: "center", color: "#111827" },
  brandSub: { fontSize: 14, textAlign: "center", marginTop: 6, marginBottom: 18, color: "#6b7280" },
  authCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: { fontSize: 13, fontWeight: "600", marginTop: 10, marginBottom: 4, color: "#4b5563" },
  basicInput: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 13,
  },
  warnText: { marginTop: 6, color: "#ef4444", fontSize: 12 },

  // Main
  screenContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 12, backgroundColor: "#f9fafb" },
  screenTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#111827" },
  searchContainer: { marginBottom: 12 },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4, color: "#111827" },
  cardSub: { fontSize: 13, color: "#4b5563", marginBottom: 4 },
  cardTag: { fontSize: 12, color: "#2563eb", marginBottom: 4 },
  cardDesc: { fontSize: 12, color: "#6b7280" },

  detailTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#111827" },
  detailBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  detailRow: { fontSize: 14, marginBottom: 6, color: "#4b5563" },
  detailValue: { fontWeight: "700", color: "#111827" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6, color: "#111827" },
  detailDesc: { fontSize: 14, color: "#4b5563", lineHeight: 20 },
});
