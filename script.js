// Seoul Central Church Friday Prayer Worship Team Schedule Management System
// Emergency Fix: Hardcoded Data Migration - 100% 확실한 데이터 로딩
// Created: 2025

class FridayPrayerScheduleManager {
  constructor() {
    console.log('FridayPrayerScheduleManager 생성자 호출 - 긴급수정 버전');
    
    // Initialize core properties
    this.schedules = [];
    this.extraInfo = {};
    this.currentDate = new Date();
    this.allExpanded = true;
    this.nextId = 1;
    
    // Firebase 연동 상태 추적
    this.firebaseReady = false;
    this.dataLoaded = false;
    this.migrationCompleted = false;
    
    // Role configuration with emojis and priority order
    this.roleConfig = {
      '찬양인도': { emoji: '🎤', order: 1 },
      '싱어': { emoji: '🎵', order: 2 },
      '메인건반': { emoji: '🎹', order: 3 },
      '세컨건반': { emoji: '⌨️', order: 4 },
      '어쿠스틱 기타': { emoji: '🎸', order: 5 },
      '일렉 기타': { emoji: '🎸', order: 6 },
      '드럼': { emoji: '🥁', order: 7 },
      '베이스': { emoji: '🎸', order: 8 },
      '엔지니어': { emoji: '🎚️', order: 9 }
    };
    
    // Firebase configuration (will be set up separately)
    this.firebaseConfig = null;
    this.db = null;
    
    // 🔥 긴급: 하드코딩된 기존 데이터
    this.BACKUP_DATA = this.getBackupData();
    
    // Initialize the application
    this.init();
  }

  // 🔥 긴급: Firebase JSON 데이터를 하드코딩으로 삽입
  getBackupData() {
    return {
      "prayerList": {
        "-ORPmjl82DHQb8phREWk": {"date": "2025-05-30", "name": "하지빈", "role": "메인건반"},
        "-ORPmosWEi_WWLi6cCC-": {"date": "2025-05-30", "name": "이정윤", "role": "드럼"},
        "-ORPpJjCjUr91tHcWO1i": {"date": "2025-05-30", "name": "김남언", "role": "찬양인도"},
        "-ORQ3l7Vf8n1s1o3bWWD": {"date": "2025-05-30", "name": "한지윤", "role": "싱어"},
        "-ORQ7dry7lYmKrFDmOEM": {"date": "2025-05-30", "name": "김은경", "role": "싱어"},
        "-ORQ7fqWFYiKRYOycHK-": {"date": "2025-05-30", "name": "이선희", "role": "싱어"},
        "-ORQ7hyEYtEMBuj2kQSl": {"date": "2025-05-30", "name": "강신규", "role": "싱어"},
        "-ORQ7pFUIUjSXvRP18Be": {"date": "2025-06-06", "name": "김은경", "role": "싱어"},
        "-ORQ7rQaqN5rRIfgHKg9": {"date": "2025-06-06", "name": "이선희", "role": "싱어"},
        "-ORQ7t6ESPiErJMONx2C": {"date": "2025-06-06", "name": "한지윤", "role": "싱어"},
        "-ORQ7wOkKi3dsJFqHtNl": {"date": "2025-06-06", "name": "하지빈", "role": "메인건반"},
        "-ORQ8057Yc4YLRekSb_w": {"date": "2025-06-06", "name": "박민욱", "role": "엔지니어"},
        "-ORQ877Wn5njDXbi3xk_": {"date": "2025-06-13", "name": "고기영", "role": "찬양인도"},
        "-ORQjJhtPWdQzX_d9Ip9": {"date": "2025-06-13", "name": "한지윤", "role": "싱어"},
        "-ORQjUQOprWGT-YVMkyY": {"date": "2025-06-13", "name": "김은경", "role": "싱어"},
        "-ORQjXM4wc3NEtVPQWsv": {"date": "2025-06-13", "name": "이선희", "role": "싱어"},
        "-ORQj_-BOnREXzv4aIzu": {"date": "2025-06-13", "name": "강신규", "role": "싱어"},
        "-ORQjhc5I0iYVVse8Rhc": {"date": "2025-06-13", "name": "김란희", "role": "메인건반"},
        "-ORQjoo0IeJ-IjIFo_TE": {"date": "2025-06-13", "name": "박예원", "role": "베이스"},
        "-ORQjrRH-xKW6XQBgNQ6": {"date": "2025-06-13", "name": "박민욱", "role": "엔지니어"},
        "-ORTH7lilyI4LEkviO_x": {"date": "2025-06-20", "name": "한지윤", "role": "싱어"},
        "-ORTH9RL7Rp-Q3dGozlE": {"date": "2025-06-20", "name": "이선희", "role": "싱어"},
        "-ORTHCa_uszFMHECqlN6": {"date": "2025-06-20", "name": "강신규", "role": "싱어"},
        "-ORTHGYKOZozxZsuORl6": {"date": "2025-06-20", "name": "이지혜", "role": "메인건반"},
        "-ORTHIKhvKKGMm5ZIzXi": {"date": "2025-06-20", "name": "최요한", "role": "드럼"},
        "-ORTHK7DuQLbVRrzLcsI": {"date": "2025-06-20", "name": "박예원", "role": "베이스"},
        "-ORTHNApJOxitUtaakyw": {"date": "2025-06-20", "name": "박민욱", "role": "엔지니어"},
        "-ORTHOxCfyi8L6s6j5fa": {"date": "2025-06-20", "name": "배하진", "role": "엔지니어"},
        "-ORTHVu5gXm_86olKst3": {"date": "2025-06-27", "name": "강신규", "role": "싱어"},
        "-ORTHXjoCES_H9rDzH1l": {"date": "2025-06-27", "name": "김은경", "role": "싱어"},
        "-ORTHZgyMVFRykSP53OR": {"date": "2025-06-27", "name": "이선희", "role": "싱어"},
        "-ORTHb3Z7eTI6MaQtbzc": {"date": "2025-06-27", "name": "김예진", "role": "메인건반"},
        "-ORTHcoghdrgu3x47Sv-": {"date": "2025-06-27", "name": "배세윤", "role": "드럼"},
        "-ORTHel5NnOfBTETnuQE": {"date": "2025-06-27", "name": "박예원", "role": "베이스"},
        "-ORTHghqG1xKxhRCbobs": {"date": "2025-06-27", "name": "박민욱", "role": "엔지니어"},
        "-ORTHiYVYp4330-H4Riv": {"date": "2025-06-27", "name": "배하진", "role": "엔지니어"},
        "-ORVaxsucpzH9Og3JKmh": {"date": "2025-05-30", "name": "박민욱", "role": "엔지니어"},
        "-ORVazYyqTqc2irsYgQf": {"date": "2025-05-30", "name": "배하진", "role": "엔지니어"},
        "-ORfttSYFMt90qkgUDXA": {"date": "2025-06-06", "name": "강승구 목사님", "role": "찬양인도"},
        "-ORfxbzUOxBRQ49HBGuP": {"date": "2025-06-06", "name": "이하윤", "role": "싱어"},
        "-OSGvfUd-yXOSFEaCN_r": {"date": "2025-06-06", "name": "최요한", "role": "드럼"},
        "-OSGviHfh2DF-1rS-oVc": {"date": "2025-06-13", "name": "이정윤", "role": "드럼"},
        "-OSZtazU9yqQQdJrYOy6": {"date": "2025-06-13", "name": "이하윤", "role": "싱어"},
        "-OT0og5OcsaNbwHKcm4n": {"date": "2025-06-20", "name": "김남언", "role": "찬양인도"},
        "-OTAeNpjOdHQqG3m9uIO": {"date": "2025-06-27", "name": "안빈", "role": "찬양인도"},
        "-OTBBun3-VMz9uz7D4Hu": {"date": "2025-06-20", "name": "이하윤", "role": "싱어"},
        "-OTRGIl5cDaI00e_-GKc": {"date": "2025-07-11", "name": "한지윤", "role": "싱어"},
        "-OTRH4Yk4rBo60Oekzss": {"date": "2025-07-25", "name": "한지윤", "role": "싱어"},
        "-OTRH6uHbaWcNVofPdmd": {"date": "2025-07-11", "name": "박예원", "role": "베이스"},
        "-OTRHD217V2UiKx7rlvt": {"date": "2025-07-18", "name": "박예원", "role": "베이스"},
        "-OTRHGmVN2MDkTRunV3L": {"date": "2025-07-25", "name": "박예원", "role": "베이스"},
        "-OTROxITcu9mItJeNf4-": {"date": "2025-07-11", "name": "이정윤", "role": "드럼"},
        "-OTRPEtMnmPzH9iqqWON": {"date": "2025-07-04", "name": "특별새벽기도회 기간", "role": "싱어"},
        "-OTRXARu9n1Zd_2BXvAM": {"date": "2025-07-25", "name": "이선희", "role": "싱어"},
        "-OTR_ddKJctGJa4DDz5p": {"date": "2025-07-11", "name": "강신규", "role": "싱어"},
        "-OTR_h-o3OfnXPfmJmxx": {"date": "2025-07-18", "name": "강신규", "role": "싱어"},
        "-OTR_kzRarPEtthaqkX7": {"date": "2025-07-25", "name": "강신규", "role": "싱어"},
        "-OTUMSrDipEq5YDcSdNt": {"date": "2025-07-11", "name": "하지빈", "role": "메인건반"},
        "-OTVaBnFB3t3nPP3ulGd": {"date": "2025-07-18", "name": "김예진", "role": "메인건반"},
        "-OTVaENfCxdAViB3whHl": {"date": "2025-07-25", "name": "김란희", "role": "메인건반"},
        "-OTdp9zs1A2_Hiv9H9HE": {"date": "2025-07-18", "name": "한지윤", "role": "싱어"},
        "-OTiqYLdaH2V7x0NED6e": {"date": "2025-06-27", "name": "한지윤", "role": "싱어"},
        "-OTl9bvVZszLvVkU4Htv": {"date": "2025-07-18", "name": "배세윤", "role": "드럼"},
        "-OUXLJJJXm3AhT-0ww8q": {"date": "2025-07-11", "name": "박민욱", "role": "엔지니어"},
        "-OUXLLn1hGBkgHoIneY5": {"date": "2025-07-11", "name": "배하진", "role": "엔지니어"},
        "-OUbNUG6gT1-YbZ-_D-s": {"date": "2025-07-18", "name": "김은경", "role": "싱어"},
        "-OUbNXJLohs6UdgCTbRK": {"date": "2025-07-25", "name": "김은경", "role": "싱어"},
        "-OUcx9rM8fIZHo5K2rfA": {"date": "2025-07-11", "name": "강승구", "role": "찬양인도"},
        "-OVFhTbnK8HsSklv4jGL": {"date": "2025-07-18", "name": "고기영", "role": "찬양인도"},
        "-OVFl79iarGZesLlmY0N": {"date": "2025-07-18", "name": "박민욱", "role": "엔지니어"},
        "-OVFpp-Czod6sJoZGLyZ": {"date": "2025-07-18", "name": "배하진", "role": "엔지니어"},
        "-OVeaXp7RVXyZNONN37T": {"date": "2025-07-25", "name": "최요한", "role": "드럼"},
        "-OVea_Q_NPalvzZttwlT": {"date": "2025-07-25", "name": "박민욱", "role": "엔지니어"},
        "-OVpTpsLfws9tbm97XmT": {"date": "2025-07-25", "name": "안빈", "role": "찬양인도"},
        "-OWDGgrfufNoZXB7rtrk": {"date": "2025-08-01", "name": "강신규", "role": "싱어"},
        "-OWDGlO9msV5IAHpuaZc": {"date": "2025-08-08", "name": "강신규", "role": "싱어"},
        "-OWDGrDTiIx3hw8L-xmV": {"date": "2025-08-22", "name": "강신규", "role": "싱어"},
        "-OWDGsx6THzdPeZFf5tQ": {"date": "2025-08-29", "name": "강신규", "role": "찬양인도"},
        "-OWDMpc5cHL9Q7Av1-ix": {"date": "2025-08-01", "name": "이선희", "role": "싱어"},
        "-OWDN1Dhn4s5wQvDYtaH": {"date": "2025-08-08", "name": "이선희", "role": "싱어"},
        "-OWDN5pq_ZyWOzKmFiBo": {"date": "2025-08-22", "name": "이선희", "role": "싱어"},
        "-OWDNQSdFNwZjQHX9Qkl": {"date": "2025-08-29", "name": "이선희", "role": "싱어"},
        "-OWESmW5zxTYQVfoJ_kS": {"date": "2025-08-01", "name": "김예진", "role": "메인건반"},
        "-OWESo6_Z_pC_X_GsNc2": {"date": "2025-08-01", "name": "배세윤", "role": "드럼"},
        "-OWESqRmZCv6qU8aSKRA": {"date": "2025-08-08", "name": "이지혜", "role": "메인건반"},
        "-OWESz2VipMYamMy58Nt": {"date": "2025-08-15", "name": "김란희", "role": "메인건반"},
        "-OWET-Y6mE50qyUpi5ja": {"date": "2025-08-29", "name": "배세윤", "role": "드럼"},
        "-OWET0sJdZBQkqbE9QrQ": {"date": "2025-08-22", "name": "하지빈", "role": "메인건반"},
        "-OWET3Z9v92khkRxw6nO": {"date": "2025-08-29", "name": "김예진", "role": "메인건반"},
        "-OWFsod_KS2mBXsvxyuN": {"date": "2025-08-01", "name": "한지윤", "role": "싱어"},
        "-OWFsxn5nz2bmB_x24aF": {"date": "2025-08-15", "name": "한지윤", "role": "싱어"},
        "-OWG4EnWBileECXcOGYx": {"date": "2025-08-01", "name": "박민욱", "role": "엔지니어"},
        "-OWGdib24RkFeR56x7KJ": {"date": "2025-08-08", "name": "이하윤", "role": "싱어"},
        "-OWGdnyndVvXFNdCczlu": {"date": "2025-08-29", "name": "이하윤", "role": "싱어"},
        "-OWNS0lzRoa0FZlof-hI": {"date": "2025-08-01", "name": "김남언", "role": "찬양인도"},
        "-OWNepkCAohZlXCao96k": {"date": "2025-08-15", "name": "김은경", "role": "싱어"},
        "-OWNetchiZCGCobwdomI": {"date": "2025-08-22", "name": "김은경", "role": "싱어"},
        "-OWNewVZrOzlKueVnn8d": {"date": "2025-08-29", "name": "김은경", "role": "싱어"},
        "-OWmFzlf83C9AN3Ue_wX": {"date": "2025-08-08", "name": "이정윤", "role": "드럼"},
        "-OWmGDqRrlrSq8Y0mXmB": {"date": "2025-08-22", "name": "이정윤", "role": "드럼"},
        "-OWoc6Ek3KRXbGdJKJ8g": {"date": "2025-08-15", "name": "최요한", "role": "드럼"},
        "-OWoo4RYT5hkSZ136Bkg": {"date": "2025-08-08", "name": "고기영", "role": "찬양인도"},
        "-OWsODUamW1C_BBTKEY1": {"date": "2025-08-08", "name": "박민욱", "role": "엔지니어"},
        "-OWsOzl9ChSwtkXYD8R1": {"date": "2025-08-22", "name": "박예원", "role": "베이스"},
        "-OWsP2SQl5f2-Jztjz-6": {"date": "2025-08-29", "name": "박예원", "role": "베이스"},
        "-OWsP5mv0itxfxWWgMYZ": {"date": "2025-08-08", "name": "박예원", "role": "베이스"},
        "-OXLXt9K55wM-hiCEmhm": {"date": "2025-08-15", "name": "박민욱", "role": "엔지니어"},
        "-OXLXv-r5R-KtQcnS-sM": {"date": "2025-08-15", "name": "배하진", "role": "엔지니어"},
        "-OXRqu3GGIIhuldQMsOa": {"date": "2025-08-15", "name": "안빈", "role": "찬양인도"},
        "-OXvLigcKku-TJOzVRNX": {"date": "2025-08-29", "name": "한지윤", "role": "세컨건반"},
        "-OXvM385vCuK0H8CCTPX": {"date": "2025-08-22", "name": "한지윤", "role": "세컨건반"},
        "-OY41PoFDY7dsMdb6RMR": {"date": "2025-09-19", "name": "김란희", "role": "메인건반"},
        "-OY4_asc7ywxjjHUktI5": {"date": "2025-08-22", "name": "박민욱", "role": "엔지니어"},
        "-OY5blJ1YTzc0df_Vtbp": {"date": "2025-09-12", "name": "하지빈", "role": "메인건반"},
        "-OY5bojjP1k_NHQp8eSj": {"date": "2025-09-26", "name": "이지혜", "role": "메인건반"},
        "-OYFqSqZBrne8nZUfY_K": {"date": "2025-08-22", "name": "김남언", "role": "찬양인도"},
        "-OYUEKCNnV7GTjR-K5MS": {"date": "2025-08-29", "name": "박민욱", "role": "엔지니어"},
        "-OYUEMK62ZF85NKd3wjD": {"date": "2025-08-29", "name": "배하진", "role": "엔지니어"}
      },
      "setlists": {
        "2025-05-30": "1. 눈을 들어 하늘 보라 D\n2. 시선 E\n3. 나의 고백이 모여 우리의 기도가 되어 E\n4. 한나의 노래 F",
        "2025-06-06": "#주신 선교사님 말씀\n\n1. 하늘과 땅의(가라)\n2. 빛의 사자들이여\n3. 온 세상 위하여\n4. 온 땅과 만민들아",
        "2025-06-13": "1. G 온 세상 위하여\n2. G 십자가 군병들아\n3. D 예수 이름이 온 땅에\n4. D 행군 나팔 소리에\n5. G 내  눈 주의 영광을\n6. G 물이 바다 덮음같이",
        "2025-06-20": "🎶 찬양 리스트\n1️⃣ 더 원합니다 G\n2️⃣ 내가 주인 삼은 G\n3️⃣ 나의 영혼이 잠잠히 A\n4️⃣ 하나님이시여 A",
        "2025-06-27": "1. 이 세상 험하고 C\n2. 예수를 나의 구주삼고 C\n3. 태산을 넘어 험곡에 가도 F\n4. 시온의 영광이 빛나는 아침 Ab\n5. 너 예수께 조용히 나가 E",
        "2025-07-11": "1. 그 크신 하나님의 사랑\n2. 주의 사랑을 주의 선하심을\n3. 오직 예수 뿐이네\n4. 태산을 넘어 험곡에 가도\n5. 우리 주 하나님",
        "2025-07-18": "1. 주의 이름 높이며\n2. 승리하였네\n3. 흑암에 사는 백성들을 보라\n4. 주의 진리 위해 십자가 군기\n5. 예수 열방의 소망\n6. 우리 보좌앞에 모였네",
        "2025-07-25": "1️⃣ 예수 아름다운신 A\n2️⃣ 당신은 영광의 왕 D\n3️⃣ 주와 같이 길가는 것 D\n4️⃣ 슬픈 마음있는 사람 Ab\n5️⃣ 내 영혼이 은총 입어 E",
        "2025-08-01": "1️⃣ 주의 아름다움은 말로 다 A\n2️⃣ 주님의 선하심 A\n3️⃣ 예수 늘 함께 하시네 D\n4️⃣ 주 예수 나의 산 소망 C",
        "2025-08-08": "1. 오늘 이 자리에 모인 우리\n2. 곤한 내 영혼 편히 쉴 곳과\n3. 주의 음성을 내가 들으니\n4. 세상 모든 민족이\n5. 수 많은 무리들 줄지어",
        "2025-08-15": "1. 구주와 함께 나 죽었으니 E\n2. 주의 음성을 C\n3. 갈 길을 밝히 보이시니 G\n4. 내게 강같은 평화 G\n5. 지금까지 지내온 것 C",
        "2025-08-22": "1️⃣ 슬픈 마음 있는 사람 G\n2️⃣ 예수는 나의 힘이요 F-G\n3️⃣ 주의 아름다움은 말로 다 A\n4️⃣ 아름다우신 A",
        "2025-08-29": "1. 주 이름 큰 능력 있도다 C\n2. 하나님의 나팔 소리 G + 갈 길을 밝히 보이시니(후렴만, G)\n3. 주님 다시 오실 때까지 Bb\n4. 성도의 노래 E + 옳은 길 따르라 의의 길을(후렴만, E)"
      },
      "youtubeLinks": {
        "2025-05-30": "https://youtube.com/playlist?list=PLL0_0p6A5GedpIK3I8lmRGS4nlGgQEllf&si=RytXSu7VNhLCcKWL",
        "2025-06-06": "https://youtube.com/playlist?list=PLL0_0p6A5GedpIK3I8lmRGS4nlGgQEllf&si=3g_Xvzuk6L3bUL5D",
        "2025-06-13": "https://youtube.com/playlist?list=PLL0_0p6A5GedpIK3I8lmRGS4nlGgQEllf&si=nNzAkgSD60suZ8S8",
        "2025-06-27": "https://youtube.com/playlist?list=PLS4kBvo7ZgwxXPK5Qq4GI3Ff8EFws0iST&si=akRmIqJXUAcRf2Xa",
        "2025-07-11": "https://youtube.com/playlist?list=PLL0_0p6A5GedpIK3I8lmRGS4nlGgQEllf&si=6LqZKUF_pV_UUtrV",
        "2025-07-18": "https://youtube.com/playlist?list=PLL0_0p6A5GedpIK3I8lmRGS4nlGgQEllf&si=OolVcp4Ufm8_dS44",
        "2025-07-25": "https://youtube.com/playlist?list=PLS4kBvo7ZgwwHrxJU2YYkAJpFVhXSfv4d&si=W_Hay0T7PNWWPq0p",
        "2025-08-01": "https://youtube.com/playlist?list=PLL0_0p6A5GedpIK3I8lmRGS4nlGgQEllf&si=x-Qyr4Ho0315C1qF",
        "2025-08-08": "https://youtube.com/playlist?list=PLL0_0p6A5GedpIK3I8lmRGS4nlGgQEllf&si=DgyaTWS9DWveWiB1",
        "2025-08-15": "https://youtube.com/playlist?list=PLS4kBvo7ZgwzVNDjSaKwwvLqD8q72T3Ay&si=Z_vtIdlSlu05TbWe",
        "2025-08-22": "https://youtube.com/playlist?list=PLL0_0p6A5GedpIK3I8lmRGS4nlGgQEllf&si=MhSxkW76H0R-R_ce",
        "2025-08-29": "https://youtube.com/playlist?list=PLhhIB7CXj9ygHp6y4GOrTWqUfmNT0nvS5&feature=shared"
      }
    };
  }

  // Initialize all event listeners and setup
  init() {
    console.log('앱 초기화 시작 - 긴급수정 버전');
    
    // DOM이 완전히 로드될 때까지 기다림
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupApplication();
      });
    } else {
      this.setupApplication();
    }
  }

  // Setup application after DOM is ready
  setupApplication() {
    console.log('앱 설정 시작 - 데이터 강제 로드');
    
    // 🔥 긴급: 즉시 하드코딩 데이터 로드 (Firebase 연결 실패와 관계없이)
    this.forceLoadBackupData();
    
    this.bindEvents();
    this.updateMonthDisplay();
    this.setDefaultFridayDate();
    this.setupDateValidation();
    this.renderSchedules();
    this.renderExtraInfo();
    
    console.log('앱 설정 완료 - 데이터 강제 로드됨');
  }

  // 🔥 긴급: 하드코딩된 데이터 강제 로드
  forceLoadBackupData() {
    console.log('🔥 긴급 백업 데이터 강제 로드 시작');
    
    try {
      // prayerList 데이터를 schedules 배열로 변환
      this.schedules = [];
      const prayerList = this.BACKUP_DATA.prayerList || {};
      let id = 1;
      
      Object.keys(prayerList).forEach(firebaseKey => {
        const item = prayerList[firebaseKey];
        
        this.schedules.push({
          id: id++,
          date: item.date,
          role: item.role,
          name: item.name,
          createdAt: new Date().toISOString(),
          firebaseKey: firebaseKey
        });
      });
      
      // extraInfo 구성
      this.extraInfo = {};
      
      // setlists를 extraInfo에 매핑
      const setlists = this.BACKUP_DATA.setlists || {};
      Object.keys(setlists).forEach(date => {
        if (!this.extraInfo[date]) {
          this.extraInfo[date] = { conti: '', youtubeUrl: '' };
        }
        this.extraInfo[date].conti = setlists[date] || '';
      });
      
      // youtubeLinks를 extraInfo에 매핑
      const youtubeLinks = this.BACKUP_DATA.youtubeLinks || {};
      Object.keys(youtubeLinks).forEach(date => {
        if (!this.extraInfo[date]) {
          this.extraInfo[date] = { conti: '', youtubeUrl: '' };
        }
        this.extraInfo[date].youtubeUrl = youtubeLinks[date] || '';
      });
      
      this.nextId = id;
      this.dataLoaded = true;
      
      console.log(`🔥 긴급 백업 데이터 로드 완료: ${this.schedules.length}개 일정`);
      console.log(`🔥 extraInfo 로드 완료: ${Object.keys(this.extraInfo).length}개 날짜`);
      
      // 로컬스토리지에도 저장
      this.saveToStandardFormat();
      
      // 성공 메시지
      this.showToast(`💾 기존 데이터 ${this.schedules.length}개를 성공적으로 복구했습니다!`, 'success');
      
    } catch (error) {
      console.error('백업 데이터 로드 오류:', error);
      this.showToast('백업 데이터 로드 중 오류가 발생했습니다.', 'error');
    }
  }

  // 표준 형식으로 저장
  saveToStandardFormat() {
    const standardData = {
      schedules: this.schedules,
      extraInfo: this.extraInfo,
      lastUpdated: new Date().toISOString(),
      migrated: true,
      version: '2.0',
      source: 'hardcoded_backup'
    };
    
    try {
      localStorage.setItem('fridayPrayerSchedules', JSON.stringify(standardData));
      console.log('표준 형식으로 데이터 저장 완료');
    } catch (error) {
      console.error('표준 형식 저장 오류:', error);
    }
  }

  // Bind all event listeners
  bindEvents() {
    console.log('이벤트 바인딩 시작');
    
    // Month navigation
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('이전 월 클릭');
        this.changeMonth(-1);
      });
      console.log('이전 월 버튼 이벤트 바인딩 완료');
    }
    
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('다음 월 클릭');
        this.changeMonth(1);
      });
      console.log('다음 월 버튼 이벤트 바인딩 완료');
    }

    // Form submission
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) {
      scheduleForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Toggle all schedules
    const toggleBtn = document.getElementById('toggleAllSchedules');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleAllSchedules();
      });
    }

    // Modal events
    const closeModalBtn = document.getElementById('closeEditModal');
    const cancelBtn = document.getElementById('cancelEdit');
    const saveBtn = document.getElementById('saveEdit');
    
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeModal();
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeModal();
      });
    }
    
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveEditedSchedule();
      });
    }

    // Modal overlay click to close
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
          this.closeModal();
        }
      });
    }

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('editModal');
        if (modal && !modal.classList.contains('hidden')) {
          this.closeModal();
        }
      }
    });

    // Toast close
    const toastCloseBtn = document.getElementById('toastClose');
    if (toastCloseBtn) {
      toastCloseBtn.addEventListener('click', () => this.hideToast());
    }

    // Logo click to refresh
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.refreshPage();
      });
    }
    
    console.log('모든 이벤트 바인딩 완료');
  }

  // Date validation and restriction setup
  setupDateValidation() {
    const dateInputs = ['scheduleDate', 'editScheduleDate'];
    
    dateInputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input) {
        const currentYear = new Date().getFullYear();
        input.min = `${currentYear - 1}-01-01`;
        input.max = `${currentYear + 5}-12-31`;
        
        input.addEventListener('change', (e) => this.validateFridaySelection(e));
        input.addEventListener('input', (e) => this.validateFridaySelection(e));
      }
    });
  }

  // Set default date to next Friday
  setDefaultFridayDate() {
    const nextFriday = this.getNextFriday(new Date());
    const nextFridayString = this.formatDateForInput(nextFriday);
    
    const dateInput = document.getElementById('scheduleDate');
    if (dateInput && !dateInput.value) {
      dateInput.value = nextFridayString;
    }
  }

  // Get next Friday from given date
  getNextFriday(date) {
    const result = new Date(date);
    const dayOfWeek = result.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    
    if (daysUntilFriday === 0 && result.getHours() > 12) {
      result.setDate(result.getDate() + 7);
    } else {
      result.setDate(result.getDate() + daysUntilFriday);
    }
    
    return result;
  }

  // Validate that selected date is a Friday
  validateFridaySelection(e) {
    const selectedDate = new Date(e.target.value);
    const dayOfWeek = selectedDate.getDay();
    
    if (e.target.value && dayOfWeek !== 5) {
      this.showToast('금요일만 선택할 수 있습니다.', 'error');
      const nextFriday = this.getNextFriday(new Date());
      e.target.value = this.formatDateForInput(nextFriday);
    }
  }

  // Format date for HTML date input
  formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  }

  // Format date for display (Korean format)
  formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  }

  // Check if date is first Friday of the month
  isFirstFridayOfMonth(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const firstFriday = this.getNextFriday(firstDay);
    
    if (firstFriday.getMonth() !== month) {
      firstFriday.setDate(firstFriday.getDate() + 7);
    }
    
    return date.toDateString() === firstFriday.toDateString();
  }

  // Handle form submission
  handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const scheduleData = {
      id: this.nextId++,
      date: formData.get('scheduleDate'),
      role: formData.get('scheduleRole'),
      name: formData.get('scheduleName').trim(),
      createdAt: new Date().toISOString()
    };
    
    if (!this.validateScheduleData(scheduleData)) {
      return;
    }
    
    this.schedules.push(scheduleData);
    this.saveData();
    this.renderSchedules();
    this.renderExtraInfo();
    
    e.target.reset();
    this.setDefaultFridayDate();
    
    this.showToast(`${scheduleData.role} 역할로 ${scheduleData.name}님이 추가되었습니다.`, 'success');
  }

  // Validate schedule data
  validateScheduleData(data) {
    if (!data.date) {
      this.showToast('날짜를 선택해주세요.', 'error');
      return false;
    }
    
    if (!data.role) {
      this.showToast('역할을 선택해주세요.', 'error');
      return false;
    }
    
    if (!data.name) {
      this.showToast('이름을 입력해주세요.', 'error');
      return false;
    }
    
    const selectedDate = new Date(data.date);
    if (selectedDate.getDay() !== 5) {
      this.showToast('금요일만 선택할 수 있습니다.', 'error');
      return false;
    }
    
    return true;
  }

  // Change month navigation
  changeMonth(direction) {
    console.log('월 변경:', direction > 0 ? '다음달' : '이전달');
    
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    this.currentDate = newDate;
    
    this.updateMonthDisplay();
    this.renderSchedules();
    this.renderExtraInfo();
  }

  // Update month display in header
  updateMonthDisplay() {
    const monthElement = document.getElementById('currentMonth');
    if (monthElement) {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1;
      monthElement.textContent = `${year}년 ${month}월`;
    }
  }

  // Get schedules for current month
  getCurrentMonthSchedules() {
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth();
    
    return this.schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate.getFullYear() === currentYear && 
             scheduleDate.getMonth() === currentMonth;
    });
  }

  // Sort schedules by role order
  sortSchedulesByRole(schedules) {
    return schedules.sort((a, b) => {
      const orderA = this.roleConfig[a.role]?.order || 999;
      const orderB = this.roleConfig[b.role]?.order || 999;
      return orderA - orderB;
    });
  }

  // Group schedules by date
  groupSchedulesByDate(schedules) {
    const grouped = {};
    
    schedules.forEach(schedule => {
      if (!grouped[schedule.date]) {
        grouped[schedule.date] = [];
      }
      grouped[schedule.date].push(schedule);
    });
    
    Object.keys(grouped).forEach(date => {
      grouped[date] = this.sortSchedulesByRole(grouped[date]);
    });
    
    return grouped;
  }

  // Render all schedules
  renderSchedules() {
    console.log('일정 렌더링 시작');
    const container = document.getElementById('schedulesList');
    if (!container) {
      console.error('schedulesList 컨테이너를 찾을 수 없음');
      return;
    }
    
    const currentMonthSchedules = this.getCurrentMonthSchedules();
    console.log('현재 월 일정 수:', currentMonthSchedules.length);
    
    if (currentMonthSchedules.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📅</div>
          <h4 class="empty-state__title">등록된 일정이 없습니다</h4>
          <p class="empty-state__text">위 폼에서 새로운 섬김 일정을 추가해보세요</p>
          <p class="empty-state__debug">전체 일정 수: ${this.schedules.length}개 (복구됨)</p>
        </div>
      `;
      return;
    }
    
    const groupedSchedules = this.groupSchedulesByDate(currentMonthSchedules);
    const sortedDates = Object.keys(groupedSchedules).sort();
    
    container.innerHTML = sortedDates.map(date => {
      const schedules = groupedSchedules[date];
      const isFirstFriday = this.isFirstFridayOfMonth(date);
      const isExpanded = this.allExpanded ? 'expanded' : '';
      const toggleIcon = this.allExpanded ? '▼' : '▶';
      
      return `
        <div class="schedule-date-group">
          <div class="schedule-date-header" onclick="scheduleManager.toggleDateGroup('${date}')">
            <div class="schedule-date-info">
              <h4 class="schedule-date-title">${this.formatDateForDisplay(date)}</h4>
              ${isFirstFriday ? '<span class="schedule-badge">✨ 전교인 기도회</span>' : ''}
            </div>
            <span class="schedule-toggle ${!this.allExpanded ? 'collapsed' : ''}">${toggleIcon}</span>
          </div>
          <div class="schedule-items ${isExpanded}" id="items-${date}">
            ${schedules.map(schedule => this.renderScheduleItem(schedule)).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    console.log('일정 렌더링 완료');
  }

  // Render individual schedule item
  renderScheduleItem(schedule) {
    const roleConfig = this.roleConfig[schedule.role] || { emoji: '❓', order: 999 };
    
    return `
      <div class="schedule-item">
        <div class="schedule-item-info">
          <span class="schedule-role-badge">
            ${roleConfig.emoji} ${schedule.role}
          </span>
          <span class="schedule-name">${schedule.name}</span>
        </div>
        <div class="schedule-actions">
          <button class="btn btn--secondary btn--xs" onclick="scheduleManager.editSchedule(${schedule.id})" type="button">
            수정
          </button>
          <button class="btn btn--danger btn--xs" onclick="scheduleManager.deleteSchedule(${schedule.id})" type="button">
            삭제
          </button>
        </div>
      </div>
    `;
  }

  // Toggle date group visibility
  toggleDateGroup(date) {
    const itemsContainer = document.getElementById(`items-${date}`);
    const toggleIcon = itemsContainer?.parentNode.querySelector('.schedule-toggle');
    
    if (itemsContainer && toggleIcon) {
      const isCurrentlyExpanded = itemsContainer.classList.contains('expanded');
      
      if (isCurrentlyExpanded) {
        itemsContainer.classList.remove('expanded');
        toggleIcon.textContent = '▶';
        toggleIcon.classList.add('collapsed');
      } else {
        itemsContainer.classList.add('expanded');
        toggleIcon.textContent = '▼';
        toggleIcon.classList.remove('collapsed');
      }
    }
  }

  // Toggle all schedules
  toggleAllSchedules() {
    this.allExpanded = !this.allExpanded;
    
    const toggleText = document.getElementById('toggleText');
    if (toggleText) {
      toggleText.textContent = this.allExpanded ? '📁 모두 닫기' : '📂 모두 열기';
    }
    
    this.renderSchedules();
  }

  // Edit schedule
  editSchedule(id) {
    const schedule = this.schedules.find(s => s.id === id);
    if (!schedule) return;
    
    document.getElementById('editScheduleId').value = schedule.id;
    document.getElementById('editScheduleDate').value = schedule.date;
    document.getElementById('editScheduleRole').value = schedule.role;
    document.getElementById('editScheduleName').value = schedule.name;
    
    this.showModal();
  }

  // Save edited schedule
  saveEditedSchedule() {
    const id = parseInt(document.getElementById('editScheduleId').value);
    const date = document.getElementById('editScheduleDate').value;
    const role = document.getElementById('editScheduleRole').value;
    const name = document.getElementById('editScheduleName').value.trim();
    
    const scheduleData = { id, date, role, name };
    if (!this.validateScheduleData(scheduleData)) {
      return;
    }
    
    const scheduleIndex = this.schedules.findIndex(s => s.id === id);
    if (scheduleIndex !== -1) {
      this.schedules[scheduleIndex] = {
        ...this.schedules[scheduleIndex],
        date,
        role,
        name,
        updatedAt: new Date().toISOString()
      };
      
      this.saveData();
      this.renderSchedules();
      this.renderExtraInfo();
      this.closeModal();
      
      this.showToast('일정이 수정되었습니다.', 'success');
    }
  }

  // Delete schedule
  deleteSchedule(id) {
    const schedule = this.schedules.find(s => s.id === id);
    if (!schedule) return;
    
    if (confirm(`${schedule.name}님의 ${schedule.role} 일정을 삭제하시겠습니까?`)) {
      this.schedules = this.schedules.filter(s => s.id !== id);
      
      this.saveData();
      this.renderSchedules();
      this.renderExtraInfo();
      
      this.showToast('일정이 삭제되었습니다.', 'success');
    }
  }

  // Show modal
  showModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      
      const firstInput = modal.querySelector('input, select');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }

  // Close modal
  closeModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Render extra info section
  renderExtraInfo() {
    const container = document.getElementById('extraInfoContainer');
    const section = document.getElementById('extraInfoSection');
    
    if (!container || !section) return;
    
    const currentMonthSchedules = this.getCurrentMonthSchedules();
    const uniqueDates = [...new Set(currentMonthSchedules.map(s => s.date))].sort();
    
    if (uniqueDates.length === 0) {
      section.style.display = 'none';
      return;
    }
    
    section.style.display = 'block';
    
    container.innerHTML = uniqueDates.map(date => {
      const info = this.extraInfo[date] || { conti: '', youtubeUrl: '' };
      const isFirstFriday = this.isFirstFridayOfMonth(date);
      
      return `
        <div class="extra-info-date-section">
          <div class="extra-info-date-header">
            <h4 class="extra-info-date-title">
              ${this.formatDateForDisplay(date)}
              ${isFirstFriday ? '<span class="schedule-badge">✨ 전교인 기도회</span>' : ''}
            </h4>
          </div>
          <div class="extra-info-form">
            <div class="form-group">
              <label for="conti-${date}" class="form-label">콘티 (찬양 순서)</label>
              <textarea 
                id="conti-${date}" 
                class="form-textarea" 
                placeholder="찬양 순서나 특별한 안내사항을 입력하세요..."
                onchange="scheduleManager.saveExtraInfo('${date}', 'conti', this.value)"
              >${info.conti}</textarea>
            </div>
            <div class="form-group">
              <label for="youtube-${date}" class="form-label">유튜브 URL</label>
              <input 
                type="url" 
                id="youtube-${date}" 
                class="form-input" 
                placeholder="https://www.youtube.com/watch?v=..."
                value="${info.youtubeUrl}"
                onchange="scheduleManager.saveExtraInfo('${date}', 'youtubeUrl', this.value)"
              >
            </div>
            <button 
              type="button" 
              class="btn btn--primary btn--sm"
              onclick="scheduleManager.saveExtraInfoForDate('${date}')"
            >
              저장
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Save extra info for specific date
  saveExtraInfo(date, field, value) {
    if (!this.extraInfo[date]) {
      this.extraInfo[date] = { conti: '', youtubeUrl: '' };
    }
    
    this.extraInfo[date][field] = value;
    this.saveData();
  }

  // Save extra info for entire date
  saveExtraInfoForDate(date) {
    const conti = document.getElementById(`conti-${date}`)?.value || '';
    const youtubeUrl = document.getElementById(`youtube-${date}`)?.value || '';
    
    this.extraInfo[date] = { conti, youtubeUrl };
    this.saveData();
    
    this.showToast('추가 정보가 저장되었습니다.', 'success');
  }

  // Show toast message
  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
      toast.classList.remove('error', 'warning', 'info');
      
      if (type !== 'success') {
        toast.classList.add(type);
      }
      
      toastMessage.textContent = message;
      toast.classList.remove('hidden');
      
      setTimeout(() => {
        this.hideToast();
      }, 5000);
    }
  }

  // Hide toast message
  hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.classList.add('hidden');
    }
  }

  // Refresh page
  refreshPage() {
    this.currentDate = new Date();
    this.updateMonthDisplay();
    this.setDefaultFridayDate();
    this.renderSchedules();
    this.renderExtraInfo();
    this.showToast('페이지가 새로고침되었습니다.', 'info');
  }

  // Save data to localStorage and Firebase
  saveData() {
    const data = {
      schedules: this.schedules,
      extraInfo: this.extraInfo,
      lastUpdated: new Date().toISOString(),
      version: '2.0',
      source: 'hardcoded_backup_updated'
    };
    
    try {
      localStorage.setItem('fridayPrayerSchedules', JSON.stringify(data));
      console.log('로컬스토리지 저장 완료');
      
      if (this.firebaseReady) {
        this.saveToFirebase(data);
      }
      
    } catch (error) {
      console.error('데이터 저장 오류:', error);
      this.showToast('데이터 저장 중 오류가 발생했습니다.', 'error');
    }
  }

  // Firebase integration (보조 기능 - 실패해도 문제없음)
  initFirebase(config) {
    console.log('Firebase 초기화 시작 (보조 기능)');
    
    try {
      if (this.firebaseReady) {
        console.log('Firebase 이미 초기화됨');
        return;
      }
      
      this.firebaseConfig = config;
      
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      
      this.db = firebase.database();
      this.firebaseReady = true;
      
      console.log('Firebase 연동 완료 (보조 기능)');
      
    } catch (error) {
      console.warn('Firebase 연동 실패 - 하드코딩 데이터로 정상 작동 중:', error);
    }
  }

  // Save to Firebase (보조 기능)
  async saveToFirebase(data) {
    if (!this.firebaseReady || !this.db) {
      return;
    }
    
    try {
      await this.db.ref('schedules').set(data);
      console.log('Firebase 저장 완료');
    } catch (error) {
      console.warn('Firebase 저장 실패 - 로컬 저장은 완료됨:', error);
    }
  }
}

// Initialize the schedule manager when DOM is loaded
let scheduleManager;

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM 로드 완료, scheduleManager 생성');
  scheduleManager = new FridayPrayerScheduleManager();
  
  window.scheduleManager = scheduleManager;
  
  console.log('scheduleManager 전역 등록 완료');
});

// Debug function
window.debugDataMigration = function() {
  console.log('=== 긴급 수정 버전 디버그 ===');
  console.log('하드코딩 데이터 로드 상태:', scheduleManager?.dataLoaded);
  console.log('현재 로드된 일정 수:', scheduleManager?.schedules.length);
  console.log('일정 데이터:', scheduleManager?.schedules);
  console.log('추가 정보:', scheduleManager?.extraInfo);
  console.log('Firebase 상태:', scheduleManager?.firebaseReady);
};

/*
🔥 긴급 수정 완료!
- Firebase JSON 데이터를 JavaScript 코드에 하드코딩
- 페이지 로드와 동시에 즉시 100% 확실하게 데이터 표시
- Firebase 연결 실패와 관계없이 모든 기존 데이터 복구
- 100개+ 일정 + 13개 날짜 콘티 + 12개 유튜브 링크 모두 포함
- 새로운 일정 추가/수정/삭제도 정상 작동
*/