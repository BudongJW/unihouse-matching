<img width="1536" height="1024" alt="Image" src="https://github.com/user-attachments/assets/65ad79fb-0312-47b0-ba2b-6a6abb9df996" />

# 📱 UniHouse(Campus Roommate) App  
> 대학가 인근 룸메이트·매물 매칭 서비스  
> *Built with Spring Boot (Backend) & React Native (Mobile App)*

---

## 🏡 소개 (Overview)

**Campus Roommate App**은 대학생들이 학교 인근에서  
✔ 안전하고  
✔ 검증된 매물 기반으로  
✔ 룸메이트를 쉽게 찾을 수 있도록  
제작된 모바일 중심 룸메이트 매칭 플랫폼이다.

매물 게시판, 룸메 모집글, 추천 알고리즘, 실시간 채팅 기능을 갖춘  
**대학생 특화 주거 매칭 서비스**를 목표로 한다.

---

## 🚀 주요 기능 (Features)

### 🔍 1. 룸메이트 찾기 / 매물 검색
- 대학·지역·가격·성별 조건 필터링  
- 이미지 기반 매물 브라우징  
- 북마크(찜) 기능  

### 📝 2. 룸메이트 모집글 등록
- 매물 사진 업로드  
- 상세 소개 및 조건 입력  
- 인증 여부 표시(예: 학교 인증, 본인 인증)

### 🏠 3. 매물 상세 정보
- 매물 이미지 갤러리  
- 월세/보증금/거주 형태 안내  
- 룸메 조건 표시  
- 하우스 룰, 세부 설명

### 💬 4. 실시간 채팅 (WebSocket 기반)
- 룸메이트 문의  
- 실시간 알림  
- 읽음 표시

### 🔔 5. 푸시 알림 (FCM)
- 새로운 채팅 알림  
- 매물 업데이트 알림  
- 관심 지역 신규 매물 알림

### 👤 6. 사용자 계정 관리
- JWT 기반 로그인/회원가입  
- 사용자 프로필  
- 인증 상태 관리

---

## 🧱 기술 스택 (Tech Stack)

### **Frontend (Mobile)**
- React Native  
- TypeScript  
- React Query  

### **Backend**
- Spring Boot  
- Spring Security + JWT  
- JPA (Hibernate)  
- WebSocket (STOMP)

### **Infrastructure**
- PostgreSQL / MySQL  
- Redis
- AWS S3 
- Docker  
- Firebase Cloud Messaging(FCM)

---

## 📡 API 구조 

| 기능 | 엔드포인트 | 설명 |
|------|-------------|------|
| 로그인 | POST /auth/login | JWT 발급 |
| 매물 조회 | GET /listings | 필터 + 페이징 |
| 매물 상세 | GET /listings/{id} | 매물 상세 정보 |
| 매물 등록 | POST /listings | 사진 포함 게시글 업로드 |
| 채팅 생성 | POST /chat/room | 룸 생성 |
| 실시간 메시지 | WS /chat | WebSocket 통신 |

---

## 🧪 테스트

- JUnit 기반 단위 테스트  
- Postman / Insomnia API 테스트  
- RN Expo 환경 실기기 테스트 권장  

---

## 🛠 개발 환경 셋업

### Backend 실행
```bash
cd backend
./gradlew bootRun
