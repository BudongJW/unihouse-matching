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

// 색상 시스템 — 직방 × 디시인사이드 퓨전
const COLORS = {
  primary: "#1666F4",       // 직방 블루
  primaryDark: "#0D4ECC",
  primaryLight: "#E8F0FE",
  accent: "#FF4500",        // 디시 오렌지레드 (HOT/NEW 뱃지)
  accentLight: "#FFF1EB",
  navy: "#0A1628",          // 직방 다크 헤더
  background: "#F2F3F6",    // 디시 배경 회색
  cardBg: "#FFFFFF",
  text: {
    primary: "#1A1A2E",
    secondary: "#5C6370",
    tertiary: "#9CA3AF",
  },
  border: "#E0E2E8",
  success: "#00C471",       // 직방 그린
  warning: "#FF9500",
  error: "#FF3B30",
  hot: "#FF4500",           // 디시 HOT 컬러
  gradient: {
    start: "#1666F4",
    end: "#0D4ECC",
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
        {/* 이미지 영역 — 직방 그라데이션 플레이스홀더 */}
        <View style={styles.cardImagePlaceholder}>
          <Ionicons name="home" size={40} color="rgba(255,255,255,0.5)" />
          {/* HOT 뱃지 — 디시인사이드 스타일 */}
          {item.isBookmarked && (
            <View style={styles.hotBadge}>
              <Text style={styles.hotBadgeText}>🔥 HOT</Text>
            </View>
          )}
          {/* NEW 뱃지 */}
          {item.postedAt && item.postedAt.includes("방금") && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
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

          {/* 태그들 — 디시 스타일 메타 정보 행 */}
          <View style={styles.tags}>
            <View style={[styles.tag, styles.genderTag,
              item.gender === "FEMALE" && styles.genderTagFemale]}>
              <Ionicons
                name={item.gender === "MALE" ? "male" : item.gender === "FEMALE" ? "female" : "people"}
                size={11}
                color={item.gender === "FEMALE" ? COLORS.error : COLORS.primary}
              />
              <Text style={[styles.tagText,
                item.gender === "FEMALE" && { color: COLORS.error }]}>
                {getGenderLabel(item.gender)}
              </Text>
            </View>
            <Text style={styles.tagDivider}>·</Text>
            <Ionicons name="time-outline" size={11} color={COLORS.text.tertiary} />
            <Text style={styles.tagText}>{item.postedAt}</Text>
            <Text style={styles.tagDivider}>·</Text>
            <Ionicons name="eye-outline" size={11} color={COLORS.text.tertiary} />
            <Text style={styles.tagText}>조회 {Math.floor(Math.random() * 200 + 10)}</Text>
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
        {/* 헤더 — 직방 스타일 네이비 앱바 */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLogo}>
              <View style={styles.headerLogoIcon}>
                <Ionicons name="home" size={14} color="#FFF" />
              </View>
              <Text style={styles.headerLogoText}>UniHouse</Text>
            </View>
            <TouchableOpacity style={styles.headerNotifBtn}>
              <Ionicons name="notifications-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
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

        {/* 프로필 카드 — 직방 스타일 */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color="#FFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user.email || "사용자"}
            </Text>
            <Text style={styles.profileProvider}>
              {user.provider === "google" && "🔵 Google 계정"}
              {user.provider === "kakao" && "🟡 카카오 계정"}
              {user.provider === "email" && "📧 이메일 계정"}
            </Text>
          </View>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>일반</Text>
          </View>
        </View>

        {/* 활동 통계 — 직방 스타일 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>2</Text>
            <Text style={styles.statLabel}>찜한 매물</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>내가 쓴 글</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>채팅</Text>
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

let webInitialToken: string | null = null;

if (Platform.OS === "web") {
  const currentUrl = window.location.href;
  
  if (currentUrl.includes("token=")) {
    webInitialToken = currentUrl.split("token=")[1].split("&")[0].split("#")[0];
    const cleanUrl = currentUrl.split("?token=")[0].split("&token=")[0];
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

// ============================================================
// App Root
// ============================================================
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
      window.sessionStorage.setItem("keepLoggedIn", keepLoggedIn ? "true" : "false");
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
      
      if (webInitialToken) {
        setUser({ provider: "google", accessToken: webInitialToken });
        
        const keepLoggedIn = sessionStorage.getItem("keepLoggedIn") === "true";
        if (keepLoggedIn) {
          AsyncStorage.setItem("userToken", webInitialToken);
        } else {
          window.sessionStorage.setItem("userToken", webInitialToken);
        }
        
        setUser({ provider: "google", accessToken: webInitialToken });
        checkUserInfo(webInitialToken);
        
        webInitialToken = null;
        window.sessionStorage.removeItem("keepLoggedIn");
        
      } else {
        const sessionToken = window.sessionStorage.getItem("userToken");
        if (sessionToken) {
          checkUserInfo(sessionToken);
        } else {
          AsyncStorage.getItem("userToken").then((storedToken) => {
            if (storedToken) checkUserInfo(storedToken);
          });
        }
      }
      
    } else {
      AsyncStorage.getItem("userToken").then((token) => {
        if (token) checkUserInfo(token);
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

  // 헤더 — 직방 다크 네이비 앱바
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogoIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  headerLogoText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerNotifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },

  // 검색 — 직방 스타일 (헤더와 연속)
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    marginTop: -14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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
  // 정렬 버튼 — 디시인사이드 스타일 (주황 강조)
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.accentLight,
    borderWidth: 1,
    borderColor: COLORS.accent + "44",
    gap: 5,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.accent,
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

  // 매물 카드 — 직방 스타일
  listingCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  // 직방 이미지 그라데이션 플레이스홀더
  cardImagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: COLORS.navy,
    justifyContent: "center",
    alignItems: "center",
  },
  // 디시인사이드 HOT 뱃지
  hotBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLORS.hot,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  hotBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFF",
  },
  newBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLORS.success,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFF",
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
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
    borderWidth: 1,
    borderColor: COLORS.accent + "33",
  },
  campusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.accent,
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
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  // 디시인사이드 스타일 메타 정보 행
  tags: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 4,
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  // 성별 태그 — 직방 스타일 필터 칩
  genderTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genderTagFemale: {
    backgroundColor: "#FEE2E2",
  },
  tagText: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  tagDivider: {
    color: COLORS.text.tertiary,
    fontSize: 11,
  },
  // 가격 — 직방 강조 스타일
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: "600",
  },
  price: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
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
    height: 280,
    backgroundColor: COLORS.navy,
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
    backgroundColor: COLORS.navy,
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
  },
  priceCardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  priceCardValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
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
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
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

  // 마이페이지 — 직방 스타일
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileProvider: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  profileBadge: {
    marginLeft: "auto",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  profileBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFF",
  },
  // 활동 통계 행 — 직방 스타일
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  statNum: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  menuSection: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    borderRadius: 12,
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
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFF1F0",
    borderWidth: 1,
    borderColor: COLORS.error + "44",
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.error,
  },
})
