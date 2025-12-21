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
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

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
 *  Auth Screens
 *  ----------------------------- */
const LoginScreen = ({ navigation, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.trim().length > 0 && password.trim().length >= 4;

  const handleLogin = () => {
    // TODO: 백엔드 연동 (POST /auth/login) 후 JWT 저장
    // 지금은 임시로 성공 처리
    onLogin({ email });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.authContainer}>
          <Text style={styles.brandTitle}>UniHouse</Text>
          <Text style={styles.brandSub}>대학가 룸메이트 매칭</Text>

          <View style={styles.authCard}>
            <Text style={styles.authTitle}>로그인</Text>

            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="example@university.ac.kr"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호 (4자 이상)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={!canSubmit}
            >
              <Text style={styles.primaryButtonText}>로그인</Text>
            </TouchableOpacity>

            <View style={styles.authFooterRow}>
              <Text style={styles.mutedText}>계정이 없나?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                <Text style={styles.linkText}> 회원가입</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => alert("TODO: 비밀번호 재설정 화면 연결")}
              style={{ marginTop: 10 }}
            >
              <Text style={styles.mutedLinkText}>비밀번호를 잊었나?</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.authNotice}>
            * 현재는 UI 시연용 임시 로그인이다. 나중에 Spring JWT로 연결하면 됨.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const SignUpScreen = ({ navigation, onSignUp }) => {
  const [name, setName] = useState("");
  const [univEmail, setUnivEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const passwordOk = password.trim().length >= 6;
  const matchOk = password === password2 && password2.length > 0;

  const canSubmit =
    name.trim().length > 0 &&
    univEmail.trim().length > 0 &&
    passwordOk &&
    matchOk;

  const handleSignUp = () => {
    // TODO: 백엔드 연동 (POST /auth/signup)
    // 지금은 임시로 가입 성공 → 로그인 상태로 전환
    onSignUp({ email: univEmail, name });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.authContainer}>
          <Text style={styles.brandTitle}>UniHouse</Text>
          <Text style={styles.brandSub}>대학가 룸메이트 매칭</Text>

          <View style={styles.authCard}>
            <Text style={styles.authTitle}>회원가입</Text>

            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              placeholder="예) 재원"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>학교 이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="example@university.ac.kr"
              autoCapitalize="none"
              keyboardType="email-address"
              value={univEmail}
              onChangeText={setUnivEmail}
            />

            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="6자 이상"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {!passwordOk && password.length > 0 ? (
              <Text style={styles.warnText}>비밀번호는 6자 이상 권장</Text>
            ) : null}

            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호 재입력"
              secureTextEntry
              value={password2}
              onChangeText={setPassword2}
            />
            {!matchOk && password2.length > 0 ? (
              <Text style={styles.warnText}>비밀번호가 일치하지 않음</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={!canSubmit}
            >
              <Text style={styles.primaryButtonText}>가입하고 시작하기</Text>
            </TouchableOpacity>

            <View style={styles.authFooterRow}>
              <Text style={styles.mutedText}>이미 계정이 있나?</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}> 로그인</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.authNotice}>
            * 학교 이메일 인증, 약관 동의 UI는 다음 단계에서 추가하면 됨.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const AuthNavigator = ({ onLogin }) => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        options={{ headerShown: false }}
      >
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </AuthStack.Screen>

      <AuthStack.Screen
        name="SignUp"
        options={{ title: "회원가입" }}
      >
        {(props) => <SignUpScreen {...props} onSignUp={onLogin} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};

/** -----------------------------
 *  Main Screens (Existing)
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
          style={[styles.primaryButton, { marginTop: 16 }]}
          onPress={() => alert("TODO: 채팅 시작")}
        >
          <Text style={styles.primaryButtonText}>채팅으로 문의하기</Text>
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
    alert("임시: 콘솔 출력. 백엔드 붙이면 실제 등록으로 변경.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.screenContainer}>
        <Text style={styles.screenTitle}>룸메 모집글 작성</Text>

        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.input}
          placeholder="예) OO대 도보 5분 투룸 / 룸메 구함"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>학교 / 캠퍼스</Text>
        <TextInput
          style={styles.input}
          placeholder="예) OO대학교"
          value={campus}
          onChangeText={setCampus}
        />

        <Text style={styles.label}>월세 (만원)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="예) 35"
          value={rent}
          onChangeText={setRent}
        />

        <Text style={styles.label}>보증금 (만원)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="예) 200"
          value={deposit}
          onChangeText={setDeposit}
        />

        <Text style={styles.label}>선호 성별</Text>
        <TextInput
          style={styles.input}
          placeholder="예) 남성 / 여성 / 무관"
          value={gender}
          onChangeText={setGender}
        />

        <Text style={styles.label}>상세 설명</Text>
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: "top" }]}
          placeholder="집 구조, 생활 패턴, 하우스 룰 등"
          multiline
          value={desc}
          onChangeText={setDesc}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>등록하기</Text>
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
          style={[styles.primaryButton, { backgroundColor: "#ef4444" }]}
          onPress={onLogout}
        >
          <Text style={styles.primaryButtonText}>로그아웃</Text>
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

  const authValue = useMemo(
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
            {() => <TabNavigator onLogout={authValue.logout} user={user} />}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="Auth">
            {() => <AuthNavigator onLogin={authValue.login} />}
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
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Auth
  authContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 28,
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
  },
  brandSub: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
    color: "#6b7280",
  },
  authCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  authTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  authFooterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  authNotice: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 12,
  },

  // Common
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
    color: "#4b5563",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 13,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  mutedText: {
    color: "#6b7280",
  },
  linkText: {
    color: "#2563eb",
    fontWeight: "700",
  },
  mutedLinkText: {
    color: "#6b7280",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  warnText: {
    marginTop: 6,
    color: "#ef4444",
    fontSize: 12,
  },

  // Listing cards / detail
  card: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },
  cardSub: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 4,
  },
  cardTag: {
    fontSize: 12,
    color: "#2563eb",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: "#6b7280",
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  detailBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  detailRow: {
    fontSize: 14,
    marginBottom: 6,
    color: "#4b5563",
  },
  detailValue: {
    fontWeight: "700",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111827",
  },
  detailDesc: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
});
