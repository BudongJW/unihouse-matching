import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from "./LoginScreen";

WebBrowser.maybeCompleteAuthSession();

const BACKEND_URL = "http://localhost:8080";

type User = {
  provider: "email" | "google" | "kakao";
  email?: string;
  name?: string;
  accessToken?: string;
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

const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "OO대학교 도보 5분 투룸 / 남성 룸메 구함",
    campus: "OO대학교",
    rent: 35,
    deposit: 200,
    gender: "남성",
    desc: "조용하고 깔끔한 성격이면 좋겠음. 주방 공유 가능합니다.",
  },
  {
    id: "2",
    title: "원룸 쉐어 / 여성 룸메이트",
    campus: "XX대학교",
    rent: 40,
    deposit: 100,
    gender: "여성",
    desc: "비흡연자만 연락주세요. 6개월 이상 거주 희망.",
  },
];

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: [Linking.createURL("/"), "http://localhost:8081"],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: "oauth/callback", // /oauth/callback 경로를 로그인 화면으로 연결
        },
      },
      Main: "main",
    },
  },
};

// 1. 홈 화면 (검색 및 리스트)
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
          placeholder="학교명 또는 제목으로 검색..."
          value={keyword}
          onChangeText={setKeyword}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Detail", { listing: item })}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>
                {item.campus} · 보증금 {item.deposit}/월세 {item.rent}만
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

// 2. 상세 화면
function ListingDetailScreen({ route }: any) {
  const { listing } = route.params as { listing: Listing };

  return (
    <SafeAreaView style={styles.safeAreaGray}>
      <ScrollView style={styles.screenContainer}>
        <Text style={styles.detailTitle}>{listing.title}</Text>
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{listing.campus}</Text>
        </View>
        <Text style={styles.detailDesc}>{listing.desc}</Text>
        <View style={styles.infoBox}>
            <Text>성별: {listing.gender}</Text>
            <Text>조건: {listing.deposit}/{listing.rent}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 3. 작성 화면
function CreateListingScreen() {
  return (
    <SafeAreaView style={styles.safeAreaGray}>
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>룸메 모집글 작성</Text>
        <Text style={{color: '#666'}}>여기에 매물 등록 폼을 구현할 예정입니다.</Text>
      </View>
    </SafeAreaView>
  );
}

// 4. 마이페이지 (로그아웃 기능 포함)
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
        <View style={styles.card}>
            <Text style={styles.cardTitle}>로그인 정보</Text>
            <Text>플랫폼: {user.provider}</Text>
            {user.email && <Text>이메일: {user.email}</Text>}
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
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: '목록' }} />
      <HomeStack.Screen name="Detail" component={ListingDetailScreen} options={{ title: '상세보기' }} />
    </HomeStack.Navigator>
  );
}

function TabNavigator({ user, onLogout }: any) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: '홈' }} />
      <Tab.Screen name="Create" component={CreateListingScreen} options={{ title: '글쓰기' }} />
      <Tab.Screen name="MyPage" options={{ title: '내 정보' }}>
        {() => <MyPageScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AuthNavigator({ onLogin, onGoogleLogin }: any) {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => (
          <LoginScreen
            {...props}
            // onEmailLogin={({ email }) => onLogin({ provider: "email", email })}
            onEmailLogin={()=>Alert.alert("이메일 로그인은 준비 중입니다.")}
            onGoogleLogin={onGoogleLogin}
            onKakaoLogin={() => Alert.alert("카카오 로그인은 준비 중입니다.")}
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async() => {
      try{
        const savedToken = await AsyncStorage.getItem("userToken");

        if(!savedToken){
          setLoading(false);
          return;
        }

        console.log("저장된 토큰 발견, 검증 시도중..");
        const response = await fetch(`${BACKEND_URL}/api/members/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if(response.ok){
          const userData = await response.json();
          console.log("토큰 검증 성공 사용자: ", userData.email);

          setUser({ 
            provider: "google", 
            accessToken: savedToken,
            email: userData.email,
            name: userData.name
          });
        } else {
          console.log("토큰 만료 또는 유효하지 않음. 로그아웃 처리");
          await AsyncStorage.removeItem("userToken");
          setUser(null);
        }
      } catch (e) {
        console.error("세션 복구 중 에러:", e);
        await AsyncStorage.removeItem("userToken");
        setUser(null);
      } finally{
        setLoading(false); //로딩 끝
      }
    };
    restoreSession();
  }, []);

  // 구글 로그인 처리
  const handleGoogleLogin = async () => {
    const backendUrl = `${BACKEND_URL}/oauth2/authorization/google`;

    if (Platform.OS === 'web') {
        // window.location.href = backendUrl;
        window.location.assign(backendUrl);
    } else {
        const redirectUrl = Linking.createURL("oauth/callback"); 
        const result = await WebBrowser.openAuthSessionAsync(backendUrl, redirectUrl);
        
        if (result.type === "success" && result.url) {
            const parsed = Linking.parse(result.url);
            const token = parsed.queryParams?.token;
            if (token) {
                setUser({ provider: "google", accessToken: typeof token === 'string' ? token : token[0] });
            }
        }
    }
  };

  // 웹 브라우저 토큰 파싱 (Redirect 처리)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const url = window.location.href;
      if (url.includes("token=")) {
        const token = url.split("token=")[1].split("&")[0];
        if (token) {
          console.log("구글 로그인 성공, 토큰 저장:", token);
          AsyncStorage.setItem("userToken", token);
          //여기서 검증 요청을 보내거나 , 상태만 업데이트 하고 리로드 가능(지금은 상태 업데이트로 처리)
          setUser({ provider: "google", accessToken: token });
          // URL에서 토큰 파라미터 제거 (깔끔하게)
          window.history.replaceState({}, document.title, "/");
        }
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken"); //토큰 삭제
      setUser(null); //상태 초기화
      Alert.alert("로그아웃", "성공적으로 로그아웃 되었습니다.");
    } catch (e) {
      console.error("로그아웃 실패", e);
    }
  };

  //로딩 중일 때 보여줄 화면
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>로그인 확인 중...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main">
            {() => <TabNavigator user={user} onLogout={() => setUser(null)} />}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="Auth">
            {() => (
              <AuthNavigator
                onLogin={setUser}
                onGoogleLogin={handleGoogleLogin}
              />
            )}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeAreaGray: { flex: 1, backgroundColor: "#f9fafb" },
  screenContainer: { padding: 16, flex: 1 },
  screenTitle: { fontSize: 24, fontWeight: "800", marginBottom: 16, color: '#111827' },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: '#1f2937', marginBottom: 4 },
  cardSub: { fontSize: 14, color: "#6b7280" },
  detailTitle: { fontSize: 22, fontWeight: "800", marginBottom: 12, color: '#111827' },
  detailDesc: { fontSize: 16, lineHeight: 24, color: '#4b5563', marginVertical: 16 },
  badge: { backgroundColor: '#e0e7ff', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#4338ca', fontSize: 12, fontWeight: '600' },
  infoBox: { padding: 16, backgroundColor: '#f3f4f6', borderRadius: 12 },
  primaryBtn: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#2563eb",
  },
  primaryBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
