import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// 임시 더미 데이터
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * 홈 화면 - 매물 리스트 + 간단 필터
 */
const HomeScreen = ({ navigation }) => {
  const [keyword, setKeyword] = useState("");
  const [filtered, setFiltered] = useState(MOCK_LISTINGS);

  const handleSearch = (text) => {
    setKeyword(text);
    if (!text) {
      setFiltered(MOCK_LISTINGS);
      return;
    }
    const lower = text.toLowerCase();
    const result = MOCK_LISTINGS.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.campus.toLowerCase().includes(lower)
    );
    setFiltered(result);
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
        <Text style={styles.screenTitle}>캠퍼스 룸메 찾기</Text>

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

/**
 * 매물 상세 화면
 */
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
            월세:{" "}
            <Text style={styles.detailValue}>{listing.rent}만원 / 월</Text>
          </Text>
          <Text style={styles.detailRow}>
            보증금:{" "}
            <Text style={styles.detailValue}>{listing.deposit}만원</Text>
          </Text>
          <Text style={styles.detailRow}>
            선호 성별:{" "}
            <Text style={styles.detailValue}>{listing.gender}</Text>
          </Text>
        </View>

        <Text style={styles.sectionTitle}>상세 설명</Text>
        <Text style={styles.detailDesc}>{listing.desc}</Text>

        {/* TODO: 여기 나중에 채팅 시작 버튼, 신고, 찜 등 추가 */}
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * 글쓰기 화면 (룸메 모집글 작성)
 * 아직은 상태만 가지고 있고, submit 시 console.log 정도만
 */
const CreateListingScreen = () => {
  const [title, setTitle] = useState("");
  const [campus, setCampus] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [gender, setGender] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = () => {
    // TODO: 나중에 백엔드 POST /listings 연결
    console.log({
      title,
      campus,
      rent,
      deposit,
      gender,
      desc,
    });
    alert("임시: 콘솔에 데이터 출력함. 백엔드 붙이면 실제로 전송 예정.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.screenContainer}>
        <Text style={styles.screenTitle}>룸메 모집글 작성</Text>

        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.input}
          placeholder="예) OO대 도보 5분 투룸 / 남성 룸메 구함"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>학교 / 캠퍼스</Text>
        <TextInput
          style={styles.input}
          placeholder="예) OO대학교, XX캠퍼스"
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
          placeholder="집 구조, 생활 패턴, 하우스 룰 등을 적어주세요."
          multiline
          value={desc}
          onChangeText={setDesc}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>등록하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * 마이페이지(임시)
 */
const MyPageScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>마이페이지</Text>
        <Text style={{ fontSize: 16, marginTop: 8 }}>
          - 내 프로필{"\n"}
          - 내가 쓴 모집글{"\n"}
          - 찜한 매물{"\n"}
          - 설정
        </Text>
      </View>
    </SafeAreaView>
  );
};

/**
 * 하단 탭 네비게이션
 */
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: "홈" }}
      />
      <Tab.Screen
        name="Create"
        component={CreateListingScreen}
        options={{ title: "글쓰기" }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ title: "마이페이지" }}
      />
    </Tab.Navigator>
  );
};

/**
 * 홈 + 상세를 위한 Stack
 */
const HomeStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "룸메 찾기" }}
      />
      <HomeStack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{ title: "매물 상세" }}
      />
    </HomeStack.Navigator>
  );
};

/**
 * App Entry
 */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 나중에 Auth Stack(Login, SignUp) 추가 가능 */}
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

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
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
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
    fontWeight: "600",
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
  submitButton: {
    marginTop: 18,
    marginBottom: 32,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});
