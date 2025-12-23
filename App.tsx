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

import LoginScreen from "./src/screens/LoginScreen";

WebBrowser.maybeCompleteAuthSession();

/* ======================================================
   🔧 OAuth 설정 값 (반드시 채우기)
====================================================== */
const GOOGLE_EXPO_CLIENT_ID = "🔧GOOGLE_EXPO_CLIENT_ID";
const GOOGLE_IOS_CLIENT_ID = "🔧GOOGLE_IOS_CLIENT_ID";
const GOOGLE_ANDROID_CLIENT_ID = "🔧GOOGLE_ANDROID_CLIENT_ID";
const GOOGLE_WEB_CLIENT_ID = "🔧GOOGLE_WEB_CLIENT_ID";

const KAKAO_REST_API_KEY = "🔧KAKAO_REST_API_KEY";

/* ======================================================
   타입 정의
====================================================== */
type User = {
  provider: "email" | "google" | "kakao";
  email?: string;
  accessToken?: string;
  code?: string;
};

type Listing = {
  id: string;
  title: string;
  campus: string;
  rent: number;
  deposit: number;
  gender: string;
  desc: string;
};

/* ======================================================
   더미 데이터
====================================================== */
const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "OO대학교 도보 5분 투룸 / 남성 룸메 구함",
    campus: "OO대학교",
    rent: 35,
    deposit: 200,
    gender: "남성",
    desc: "조용하고 깔끔한 성격이면 좋겠음.",
  },
  {
    id: "2",
    title: "원룸 쉐어 / 여성 룸메이트",
    campus: "XX대학교",
    rent: 40,
    deposit: 100,
    gender: "여성",
    desc: "비흡연자만.",
  },
];

/* ======================================================
   네비게이션
====================================================== */
const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ======================================================
   Kakao OAuth
====================================================== */
async function startKakaoLogin(): Promise<string | null> {
  const redirectUri = Linking.createURL("oauth");
  const authUrl =
    "https://kauth.kakao.com/oauth/authorize" +
    "?response_type=code" +
    `&client_id=${KAKAO_REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === "success" && result.url) {
    const parsed = Linking.parse(result.url);
    return (parsed.queryParams?.code as string) ?? null;
  }
  return null;
}

/* ======================================================
   Screens
====================================================== */
function HomeScreen({ navigation }: any) {
  const [keyword, setKeyword] = useState("");

  const filtered = MOCK_LISTINGS.filter(
    (item) =>
      item.title.includes(keyword) || item.campus.includes(keyword)
  );

  return (
    <SafeAreaView style={styles.safeAreaGray}>
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>매물 게시판</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="학교명 또는 제목"
          value={keyword}
          onChangeText={setKeyword}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("Detail", { listing: item })
              }
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>
                {item.campus} · 월세 {item.rent}만
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function ListingDetailScreen({ route }: any) {
  const { listing } = route.params as { listing: Listing };

  return (
    <SafeAreaView style={styles.safeAreaGray}>
      <ScrollView style={styles.screenContainer}>
        <Text style={styles.detailTitle}>{listing.title}</Text>
        <Text>{listing.desc}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function CreateListingScreen() {
  return (
    <SafeAreaView style={styles.safeAreaGray}>
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>룸메 모집글 작성</Text>
        <Text>TODO</Text>
      </View>
    </SafeAreaView>
  );
}

function MyPageScreen({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeAreaGray}>
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>마이페이지</Text>
        <Text>provider: {user.provider}</Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: "#ef4444" }]}
          onPress={onLogout}
        >
          <Text style={styles.primaryBtnText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ======================================================
   Navigation Wrappers
====================================================== */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Detail" component={ListingDetailScreen} />
    </HomeStack.Navigator>
  );
}

function TabNavigator({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="Create" component={CreateListingScreen} />
      <Tab.Screen name="MyPage">
        {() => <MyPageScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AuthNavigator({
  onLogin,
  onGoogleLogin,
  onKakaoLogin,
}: {
  onLogin: (u: User) => void;
  onGoogleLogin: () => Promise<void>;
  onKakaoLogin: () => Promise<void>;
}) {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => (
          <LoginScreen
            {...props}
            onEmailLogin={({ email }) =>
              onLogin({ provider: "email", email })
            }
            onGoogleLogin={onGoogleLogin}
            onKakaoLogin={onKakaoLogin}
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

/* ======================================================
   App Root
====================================================== */
export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // Google AuthSession
  const [_, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_EXPO_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      setUser({
        provider: "google",
        accessToken: response.authentication?.accessToken,
      });
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    await promptAsync();
  };

  const handleKakaoLogin = async () => {
    const code = await startKakaoLogin();
    if (!code) {
      Alert.alert("카카오 로그인 실패");
      return;
    }
    setUser({ provider: "kakao", code });
  };

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main">
            {() => (
              <TabNavigator
                user={user}
                onLogout={() => setUser(null)}
              />
            )}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="Auth">
            {() => (
              <AuthNavigator
                onLogin={setUser}
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

/* ======================================================
   Styles
====================================================== */
const styles = StyleSheet.create({
  safeAreaGray: { flex: 1, backgroundColor: "#f9fafb" },
  screenContainer: { padding: 16, flex: 1 },
  screenTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardTitle: { fontWeight: "700" },
  cardSub: { color: "#6b7280" },
  detailTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  primaryBtn: {
    marginTop: 20,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#2563eb",
  },
  primaryBtnText: { color: "white", fontWeight: "700" },
});
