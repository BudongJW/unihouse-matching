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
  Animated,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import LoginScreen from "./LoginScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const BACKEND_URL = "http://localhost:8080";
const { width } = Dimensions.get("window");

// 색상 시스템
const COLORS = {
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  primaryLight: "#DBEAFE",
  secondary: "#8B5CF6",
  background: "#F9FAFB",
  cardBg: "#FFFFFF",
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
  },
  border: "#E5E7EB",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  gradient: {
    start: "#3B82F6",
    end: "#8B5CF6",
  },
};

type User = {
  provider: "email" | "google" | "kakao";
  email?: string;
  accessToken?: string;
  gender?: string | null;
};

type Listing = {
  id: string;
  title: string;
  campus: string;
  rent: number;
  deposit: number;
  gender: string;
  desc: string;
  images?: string[];
  amenities?: string[];
  distance?: string;
  postedAt?: string;
  isBookmarked?: boolean;
};

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// function GenderSelectionModal({ visible, onSelect }: { visible: boolean; onSelect: (gender: string) => void }) {
//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>성별을 선택해주세요</Text>
//           <Text style={styles.modalSubtitle}>룸메이트 매칭을 위해 꼭 필요합니다.</Text>
          
//           <View style={styles.modalBtnRow}>
//             <TouchableOpacity style={styles.genderBtn} onPress={() => onSelect("MALE")}>
//               <Ionicons name="male" size={40} color="#3B82F6" />
//               <Text style={styles.genderBtnText}>남성</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.genderBtn} onPress={() => onSelect("FEMALE")}>
//               <Ionicons name="female" size={40} color="#EF4444" />
//               <Text style={styles.genderBtnText}>여성</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }
function ProfileSetupModal({ visible, onSubmit }: { visible: boolean; onSubmit: (gender: string, campus: string) => void }) {
  // 모달 안에서 임시로 값을 들고 있을 상태 (useState)
  const [selectedGender, setSelectedGender] = useState("");
  const [inputCampus, setInputCampus] = useState("");

  const handlePressSubmit = () => {
    if (!inputCampus.trim()) {
      Alert.alert("알림", "학교명을 입력해주세요.");
      return;
    }
    if (!selectedGender) {
      Alert.alert("알림", "성별을 선택해주세요.");
      return;
    }
    // 부모 컴포넌트(App)로 입력받은 값 2개를 전달!
    onSubmit(selectedGender, inputCampus);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>필수 정보 입력</Text>
          <Text style={styles.modalSubtitle}>룸메이트 매칭을 위해 꼭 필요합니다.</Text>
          
          {/* 1. 학교 입력란 */}
          <View style={{ width: "100%", marginBottom: 20 }}>
            <Text style={{ marginBottom: 8, fontWeight: "600", color: "#374151" }}>학교명</Text>
            <TextInput
              style={styles.searchInput} // 기존 검색창 스타일 재활용
              placeholder="예) OO대학교"
              value={inputCampus}
              onChangeText={setInputCampus}
            />
          </View>

          {/* 2. 성별 선택 버튼 */}
          <View style={{ width: "100%", marginBottom: 8 }}>
            <Text style={{ fontWeight: "600", color: "#374151" }}>성별</Text>
          </View>
          <View style={styles.modalBtnRow}>
            <TouchableOpacity 
              style={[
                styles.genderBtn, 
                selectedGender === "MALE" && { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight }
              ]} 
              onPress={() => setSelectedGender("MALE")}
            >
              <Ionicons name="male" size={40} color={selectedGender === "MALE" ? COLORS.primary : "#9CA3AF"} />
              <Text style={[styles.genderBtnText, selectedGender === "MALE" && { color: COLORS.primary }]}>남성</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.genderBtn, 
                selectedGender === "FEMALE" && { borderColor: COLORS.error, backgroundColor: "#FEE2E2" }
              ]} 
              onPress={() => setSelectedGender("FEMALE")}
            >
              <Ionicons name="female" size={40} color={selectedGender === "FEMALE" ? COLORS.error : "#9CA3AF"} />
              <Text style={[styles.genderBtnText, selectedGender === "FEMALE" && { color: COLORS.error }]}>여성</Text>
            </TouchableOpacity>
          </View>

          {/* 3. 확인 버튼 */}
          <TouchableOpacity 
            style={[styles.ctaPrimary, { width: "100%", marginTop: 24, height: 48 }]} 
            onPress={handlePressSubmit}
          >
            <Text style={styles.ctaPrimaryText}>완료</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================
// 컴포넌트: 매물 카드
// ============================================================
function ListingCard({
  item,
  onPress,
  onBookmark,
}: {
  item: Listing;
  onPress: () => void;
  onBookmark: () => void;
}) {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getGenderLabel = (gender: string) => {
    if(gender === "MALE") return "남성 전용";
    if(gender === "FEMALE") return "여성 전용"
    return "성별 무관";
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.listingCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* 이미지 영역 (placeholder) */}
        <View style={styles.cardImagePlaceholder}>
          <Ionicons name="home" size={40} color={COLORS.text.tertiary} />
        </View>

        {/* 북마크 버튼 */}
        <TouchableOpacity style={styles.bookmarkBtn} onPress={onBookmark}>
          <Ionicons
            name={item.isBookmarked ? "heart" : "heart-outline"}
            size={22}
            color={item.isBookmarked ? COLORS.error : COLORS.text.secondary}
          />
        </TouchableOpacity>

        {/* 정보 영역 */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.campusBadge}>
              <Ionicons
                name="school-outline"
                size={12}
                color={COLORS.primary}
              />
              <Text style={styles.campusBadgeText}>{item.campus}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <Ionicons
                name="walk-outline"
                size={12}
                color={COLORS.text.secondary}
              />
              <Text style={styles.distanceText}>{item.distance}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* 태그들 */}
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Ionicons
                name={item.gender === "MALE" ? "male" : "female"} // 아이콘 선택 로직 단순화
                size={12}
                color={COLORS.secondary}
              />
              <Text style={styles.tagText}>{getGenderLabel(item.gender)}</Text>
            </View>
            <Text style={styles.tagDivider}>·</Text>
            <Text style={styles.tagText}>{item.postedAt}</Text>
          </View>

          {/* 가격 */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>보증금/월세</Text>
            <Text style={styles.price}>
              {item.deposit}/{item.rent}
              <Text style={styles.priceUnit}>만원</Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================
// 화면 1: 홈 (검색 + 필터 + 리스트)
// ============================================================
function HomeScreen({ navigation }: any) {
  const [keyword, setKeyword] = useState("");
  // const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "price">("latest");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/api/posts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json", // 추가
          "Authorization": `Bearer ${token}`  // 큰따옴표("")로 감싸주세요
        },
      });

      if (response.ok) {
        const data = await response.json();
        setListings(data); // 받아온 데이터로 교체!
      }
    } catch (e) {
      console.error("게시글 로드 실패", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (id: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
      )
    );
  };

  // 필터링 및 정렬
  let filtered = listings.filter(
    (item) =>
      (item.title.includes(keyword) || item.campus.includes(keyword))
  );

  if (sortBy === "price") {
    filtered = [...filtered].sort((a, b) => a.rent - b.rent);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>룸메이트 찾기</Text>
          <Text style={styles.headerSubtitle}>
            나에게 딱 맞는 룸메를 찾아보세요
          </Text>
        </View>

        {/* 검색바 */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.text.secondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="학교명 또는 제목으로 검색..."
            value={keyword}
            onChangeText={setKeyword}
            placeholderTextColor={COLORS.text.tertiary}
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* 필터 칩 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() =>
              setSortBy(sortBy === "latest" ? "price" : "latest")
            }
          >
            <Ionicons
              name="swap-vertical"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.sortBtnText}>
              {sortBy === "latest" ? "최신순" : "가격순"}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 결과 카운트 */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultCount}>
            총 <Text style={styles.resultCountBold}>{filtered.length}</Text>개
            매물
          </Text>
        </View>

        {/* 리스트 */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListingCard
              item={item}
              onPress={() => navigation.navigate("Detail", { listing: item })}
              onBookmark={() => toggleBookmark(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={64}
                color={COLORS.text.tertiary}
              />
              <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
              <Text style={styles.emptySubtext}>
                다른 키워드로 검색해보세요
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// 화면 2: 상세보기
// ============================================================
function ListingDetailScreen({ route, navigation }: any) {
  const { listing } = route.params as { listing: Listing };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 이미지 영역 */}
        <View style={styles.detailImageContainer}>
          <View style={styles.detailImagePlaceholder}>
            <Ionicons name="image-outline" size={64} color={COLORS.text.tertiary} />
          </View>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* 상세 정보 */}
        <View style={styles.detailContent}>
          {/* 상단 정보 */}
          <View style={styles.detailHeader}>
            <View style={styles.campusBadge}>
              <Ionicons name="school-outline" size={14} color={COLORS.primary} />
              <Text style={styles.campusBadgeText}>{listing.campus}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <Ionicons name="walk-outline" size={14} color={COLORS.text.secondary} />
              <Text style={styles.distanceText}>{listing.distance}</Text>
            </View>
          </View>

          <Text style={styles.detailTitle}>{listing.title}</Text>

          {/* 가격 카드 */}
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceCardLabel}>보증금</Text>
              <Text style={styles.priceCardValue}>{listing.deposit}만원</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceCardLabel}>월세</Text>
              <Text style={styles.priceCardValue}>{listing.rent}만원</Text>
            </View>
          </View>

          {/* 기본 정보 */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons
                  name={
                    listing.gender === "남성"
                      ? "male"
                      : listing.gender === "여성"
                      ? "female"
                      : "people"
                  }
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.infoLabel}>선호 성별</Text>
                <Text style={styles.infoValue}>{listing.gender}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>등록일</Text>
                <Text style={styles.infoValue}>{listing.postedAt}</Text>
              </View>
            </View>
          </View>

          {/* 편의시설 */}
          {listing.amenities && listing.amenities.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>편의시설</Text>
              <View style={styles.amenitiesGrid}>
                {listing.amenities.map((amenity, idx) => (
                  <View key={idx} style={styles.amenityItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={COLORS.success}
                    />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 상세 설명 */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>상세 설명</Text>
            <Text style={styles.description}>{listing.desc}</Text>
          </View>

          {/* 호스트 정보 (placeholder) */}
          <View style={styles.hostCard}>
            <View style={styles.hostAvatar}>
              <Ionicons name="person" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>호스트</Text>
              <Text style={styles.hostBio}>룸메이트를 찾고 있어요</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.ctaSecondary}>
          <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctaPrimary}
          onPress={() => Alert.alert("문의하기", "채팅 기능은 준비 중입니다.")}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#FFF" />
          <Text style={styles.ctaPrimaryText}>문의하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function CreateListingScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [campus, setCampus] = useState("");
  const [deposit, setDeposit] = useState("");
  const [rent, setRent] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. 입력값 검사
    if (!title || !campus || !deposit || !rent || !content) {
      Alert.alert("알림", "모든 내용을 입력해주세요.");
      return;
    }
    const parsedDeposit = parseInt(deposit.replace(/[^0-9]/g, "")) || 0;
    const parsedRent = parseInt(rent.replace(/[^0-9]/g, "")) || 0;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      console.log("글쓰기 시 사용되는 토큰:", token);

      if (!token) {
        Alert.alert("오류", "로그인 정보가 없습니다.");
        return;
      }

      // 2. 서버로 전송
      const response = await fetch(`${BACKEND_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          campus: campus,
          deposit: parsedDeposit,
          rent: parsedRent,
          content: content,
        }),
      });

      if (response.ok) {
        Alert.alert("성공", "게시글이 등록되었습니다!", [
          {
            text: "확인",
            onPress: () => {
              // 입력창 초기화 후 홈으로 이동
              setTitle(""); setCampus(""); setDeposit(""); setRent(""); setContent("");
              navigation.navigate("HomeTab", { screen: "Home" });
            },
          },
        ]);
      } else {
        const errorText = await response.text(); 
        console.error("🚨 서버 응답 에러:", response.status, errorText);
        Alert.alert("등록 실패", `서버 에러(${response.status})가 발생했습니다.`);
      }
    } catch (e) {
      console.error("🚨 네트워크 또는 코드 에러:", e);
      Alert.alert("오류", "서버 연결 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>룸메이트 모집</Text>
        </View>

        <View style={{ padding: 20, gap: 16 }}>
          {/* 학교 */}
          <View>
            <Text style={{ marginBottom: 8, fontWeight: "600", color: "#374151" }}>학교명</Text>
            <TextInput
              style={styles.searchInput} // 기존 스타일 재활용
              placeholder="예) OO대학교"
              value={campus}
              onChangeText={setCampus}
            />
          </View>

          {/* 제목 */}
          <View>
            <Text style={{ marginBottom: 8, fontWeight: "600", color: "#374151" }}>제목</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="예) 깔끔한 룸메 구합니다"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* 가격 (보증금/월세) */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 8, fontWeight: "600", color: "#374151" }}>보증금 (만원)</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="0"
                keyboardType="number-pad"
                value={deposit}
                onChangeText={setDeposit}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 8, fontWeight: "600", color: "#374151" }}>월세 (만원)</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="0"
                keyboardType="number-pad"
                value={rent}
                onChangeText={setRent}
              />
            </View>
          </View>

          {/* 내용 */}
          <View>
            <Text style={{ marginBottom: 8, fontWeight: "600", color: "#374151" }}>상세 내용</Text>
            <TextInput
              style={[styles.searchInput, { height: 120, textAlignVertical: "top" }]}
              placeholder="룸메이트에게 바라는 점이나 방 정보를 자세히 적어주세요."
              multiline
              value={content}
              onChangeText={setContent}
            />
          </View>

          {/* 등록 버튼 */}
          <TouchableOpacity
            style={[styles.ctaPrimary, { marginTop: 20 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.ctaPrimaryText}>등록하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// 화면 4: 마이페이지
// ============================================================
function MyPageScreen({ user, onLogout }: { user: User; onLogout: () => void }) {
  const menuItems = [
    { icon: "heart-outline", label: "찜한 매물", count: 2 },
    { icon: "document-text-outline", label: "내가 쓴 글", count: 0 },
    { icon: "chatbubble-outline", label: "채팅 목록", count: 0 },
    { icon: "settings-outline", label: "설정", count: null },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>내 정보</Text>
        </View>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user.email || "사용자"}
            </Text>
            <Text style={styles.profileProvider}>
              {user.provider === "google" && "Google 계정"}
              {user.provider === "kakao" && "카카오 계정"}
              {user.provider === "email" && "이메일 계정"}
            </Text>
          </View>
        </View>

        {/* 메뉴 리스트 */}
        <View style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon as any} size={22} color={COLORS.text.primary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.count !== null && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{item.count}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutBtnText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// Navigation Wrappers
// ============================================================
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Detail" component={ListingDetailScreen} />
    </HomeStack.Navigator>
  );
}

function TabNavigator({ user, onLogout }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Create") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "MyPage") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.cardBg,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          height: Platform.OS === "ios" ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      })}
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
        options={{ title: "내 정보" }}
      >
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
            onEmailLogin={() => Alert.alert("이메일 로그인은 준비 중입니다.")}
            onGoogleLogin={onGoogleLogin}
            onKakaoLogin={() => Alert.alert("카카오 로그인은 준비 중입니다.")}
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

// ============================================================
// App Root
// ============================================================
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  // const [showGenderModal, setShowGenderModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // // 1. 내 정보 확인 및 성별 체크 함수
  // const checkUserGender = async (token: string) => {
  //   try {
  //     const response = await fetch(`${BACKEND_URL}/api/members/me`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       const userData = await response.json();
  //       console.log("내 정보 확인:", userData);

  //       // ✅ 성별이 없으면 모달 띄우기
  //       if (!userData.gender) {
  //         setShowGenderModal(true);
  //       }

  //       setUser({
  //         provider: "google", // or dynamic
  //         email: userData.email,
  //         accessToken: token,
  //         gender: userData.gender,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("사용자 정보 로드 실패:", error);
  //   }
  // };

  // // 2. 성별 업데이트 요청 함수 (모달에서 선택 시 실행)
  // const handleUpdateGender = async (selectedGender: string) => {
  //   if (!user?.accessToken) return;

  //   try {
  //     const response = await fetch(`${BACKEND_URL}/api/members/gender`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${user.accessToken}`,
  //       },
  //       body: JSON.stringify({ gender: selectedGender }),
  //     });

  //     if (response.ok) {
  //       Alert.alert("환영합니다!", "성별 정보가 저장되었습니다.");
  //       setShowGenderModal(false); // 모달 닫기
        
  //       // 유저 상태 업데이트
  //       setUser((prev) => prev ? { ...prev, gender: selectedGender } : null);
  //     } else {
  //       Alert.alert("오류", "정보 저장에 실패했습니다.");
  //     }
  //   } catch (e) {
  //     console.error(e);
  //     Alert.alert("오류", "서버 연결 실패");
  //   }
  // };
  const checkUserInfo = async (token: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/members/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("내 정보 확인:", userData);

        // ✅ 학교(campus)나 성별(gender) 중 하나라도 없으면 모달 띄움!
        if (!userData.gender || !userData.campus) {
          setShowProfileModal(true);
        }

        setUser({
          provider: "google",
          email: userData.email,
          accessToken: token,
          gender: userData.gender,
        });
      }
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
    }
  };

  // 2. 모달에서 "완료" 눌렀을 때 실행되는 저장 함수
  const handleUpdateProfile = async (selectedGender: string, inputCampus: string) => {
    if (!user?.accessToken) return;

    try {
      // API 1: 성별 저장
      await fetch(`${BACKEND_URL}/api/members/gender`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ gender: selectedGender }),
      });

      // API 2: 학교 저장
      await fetch(`${BACKEND_URL}/api/members/campus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ campus: inputCampus }),
      });

      Alert.alert("환영합니다!", "정보가 성공적으로 저장되었습니다.");
      setShowProfileModal(false); // 모달 닫기
      
      // 화면 상태 업데이트
      setUser((prev) => prev ? { ...prev, gender: selectedGender } : null);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "서버 연결에 실패했습니다.");
    }
  };
  
  const handleGoogleLogin = async (keepLoggedIn: boolean = false) => {
    const backendUrl = `${BACKEND_URL}/oauth2/authorization/google`;

    if (Platform.OS === "web") {
      sessionStorage.setItem("keepLoggedIn", keepLoggedIn ? "true" : "false");
      window.location.href = backendUrl;
    } else {
      const redirectUrl = Linking.createURL("oauth/callback");
      const result = await WebBrowser.openAuthSessionAsync(backendUrl, redirectUrl);

      if (result.type === "success" && result.url) {
        const parsed = Linking.parse(result.url);
        const token = parsed.queryParams?.token;
        if (token) {
          const validToken = typeof token === "string" ? token : token[0];
          setUser({
            provider: "google",
            accessToken: validToken,
          });

          AsyncStorage.setItem("userToken", validToken);
        }
      }
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      const url = window.location.href;
      if (url.includes("token=")) {
        const token = url.split("token=")[1].split("&")[0];
        if (token) {
          setUser({ provider: "google", accessToken: token });
          
          const keepLoggedIn = sessionStorage.getItem("keepLoggedIn") === "true";
          if(keepLoggedIn){
            AsyncStorage.setItem("userToken", token);
          } else {
            sessionStorage.setItem("userToken", token);
          }
          window.history.replaceState({}, document.title, "/");
          checkUserInfo(token);
        }
      } else {
        const sessionToken = sessionStorage.getItem("userToken");
        if(sessionToken) {
          checkUserInfo(sessionToken)
        } else {
          AsyncStorage.getItem("userToken").then((storedToken) => {
            if(storedToken) checkUserInfo(storedToken);
          })
        }
        AsyncStorage.getItem("userToken").then((token) => {
          // if(token) checkUserGender(token);
          if(token) checkUserInfo(token);
        });
      }
    } else {
      AsyncStorage.getItem("userToken").then((token) => {
        if(token) checkUserInfo(token);
      });
    }
  }, []);

  return (
    <NavigationContainer>
      <ProfileSetupModal
      visible ={showProfileModal}
      onSubmit={handleUpdateProfile}
      />

      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main">
            {() => <TabNavigator user={user} onLogout={async () => {
              await AsyncStorage.removeItem("userToken");

              if (Platform.OS === "web") {
                    sessionStorage.removeItem("userToken");
                    sessionStorage.removeItem("keepLoggedIn");
                  }

                  setUser(null);
            }} />}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="Auth">
            {() => <AuthNavigator onLogin={setUser} onGoogleLogin={handleGoogleLogin} />}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// ============================================================
// 스타일
// ============================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  // logoutBtn: { padding: 10, marginTop: 10 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    justifyContent: "center",
  },
  genderBtn: {
    flex: 1,
    height: 120,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  genderBtnText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },

  // 헤더
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
  },

  // 검색
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },

  // 필터
  filterRow: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
  chipTextSelected: {
    color: "#FFF",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    gap: 6,
  },
  sortBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // 결과
  resultHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  resultCountBold: {
    fontWeight: "700",
    color: COLORS.text.primary,
  },

  // 리스트
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // 매물 카드
  listingCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  bookmarkBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  campusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  campusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 10,
    lineHeight: 24,
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  tagDivider: {
    color: COLORS.text.tertiary,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text.primary,
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    marginTop: 4,
  },

  // 상세 화면
  detailImageContainer: {
    position: "relative",
  },
  detailImagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shareBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailContent: {
    padding: 20,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text.primary,
    lineHeight: 32,
    marginBottom: 20,
  },
  priceCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
    marginVertical: 12,
  },
  priceCardLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
  priceCardValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoItem: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginTop: 4,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amenityText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.text.secondary,
  },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 80,
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  hostBio: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },

  // CTA
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaSecondary: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaPrimary: {
    flex: 1,
    flexDirection: "row",
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaPrimaryText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFF",
  },

  // Coming Soon
  comingSoonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },

  // 마이페이지
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  profileProvider: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  menuSection: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: "center",
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.error,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.error,
  },
})
