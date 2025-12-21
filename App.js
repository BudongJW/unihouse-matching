import React, { useMemo, useState } from "react";
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
  Alert,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

/** -----------------------------
 *  Mock Data
 *  ----------------------------- */
const MOCK_LISTINGS = [
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
 *  Login Screen (디자인 버전)
 *  ----------------------------- */
const LoginScreen = ({ navigation, onEmailLogin, onGoogleLogin, onKakaoLogin }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const canSubmit = useMemo(
    () => email.trim().length > 0 && pw.trim().length >= 4,
    [email, pw]
  );

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

        {/* 입력 폼 */}
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
            />
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.primaryBtn, !canSubmit && styles.btnDisabled]}
            disabled={!canSubmit}
            onPress={() => onEmailLogin?.({ email, password: pw })}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryBtnText}>로그인</Text>
          </TouchableOpacity>

          {/* 구분선 */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 구글 로그인 */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => onGoogleLogin?.()}
            activeOpacity={0.9}
          >
            <View style={styles.googleIconCircle}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>구글로 로그인</Text>
          </TouchableOpacity>

          {/* 카카오 로그인 */}
          <TouchableOpacity
            style={styles.kakaoBtn}
            onPress={() => onKakaoLogin?.()}
            activeOpacity={0.9}
          >
            <View style={styles.kakaoBubble}>
              <Text style={styles.kakaoTalk}>Talk</Text>
            </View>
            <Text style={styles.kakaoBtnText}>카카오톡으로 로그인</Text>
          </TouchableOpacity>

          {/* 회원가입 */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>계정이 없으신가요?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.bottomLink}> 회원가입</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.authNotice}>
            * 현재는 UI 테스트용이다. 백엔드 붙이면 실제 로그인으로 바꾸면 됨.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/** -----------------------------
 *  SignUp Screen (간단 버전)
 *  ----------------------------- */
const SignUpScreen = ({ navigation, onSignUp }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const pwOk = pw.trim().length >= 6;
  const matchOk = pw === pw2 && pw2.length > 0;

  const canSubmit = useMemo(
    () => name.trim().length > 0 && email.trim().length > 0 && pwOk && matchOk,
    [name, email, pwOk, matchOk]
  );

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

            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 14 }}>
              <Text style={{ color: "#64748b" }}>이미 계정이 있나요?</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{ color: "#2563eb", fontWeight: "800" }}> 로그인</Text>
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

const AuthNavigator = ({ onLogin }) => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => (
          <LoginScreen
            {...props}
            onEmailLogin={({ email }) => onLogin({ email })}
            onGoogleLogin={() => Alert.alert("Google 로그인", "TODO: Google OAuth 연결")}
            onKakaoLogin={() => Alert.alert("Kakao 로그인", "TODO: Kakao OAuth 연결")}
          />
        )}
      </AuthStack.Screen>

      <AuthStack.Screen name="SignUp" options={{ title: "회원가입" }}>
        {(props) => <SignUpScreen {...props} onSignUp={onLogin} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};

/** -----------------------------
 *  Main Screens
 *  ----------------------------- */
const HomeScreen = ({ navigation }) => {
  const [keyword, setKeyword] = useState("");
  const [filtered, setFiltered] = useState(MOCK_LISTINGS);

  const handleSearch = (text) => {
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

  const renderItem = ({ item }) => (
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
    <SafeAreaView style={styles.safeArea}>
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

const ListingDetailScreen = ({ route }) => {
  const { listing } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
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

const CreateListingScreen = () => {
  const [title, setTitle] = useState("");
  const [campus, setCampus] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [gender, setGender] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = () => {
    console.log({ title, campus, rent, deposit, gender, desc });
    Alert.alert("등록", "임시: 콘솔 출력. 백엔드 붙이면 실제 등록으로 변경.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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

const MyPageScreen = ({ onLogout, user }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>마이페이지</Text>

        <View style={styles.detailBox}>
          <Text style={styles.detailRow}>
            로그인: <Text style={styles.detailValue}>{user?.email}</Text>
          </Text>
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
const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: "홈" }} />
    <HomeStack.Screen
      name="ListingDetail"
      component={ListingDetailScreen}
      options={{ title: "매물 상세" }}
    />
  </HomeStack.Navigator>
);

const TabNavigator = ({ onLogout, user }) => (
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
 *  App Root
 *  ----------------------------- */
export default function App() {
  const [user, setUser] = useState(null);

  const auth = useMemo(
    () => ({
      login: (u) => setUser(u),
      logout: () => setUser(null),
    }),
    []
  );

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main">
            {() => <TabNavigator onLogout={auth.logout} user={user} />}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="Auth">
            {() => <AuthNavigator onLogin={auth.login} />}
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

  // Login design
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

  // SignUp layout
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

  // Main screens
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
