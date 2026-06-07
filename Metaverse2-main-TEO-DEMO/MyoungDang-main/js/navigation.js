function moveTo(pageId) {
  const pages = document.querySelectorAll(".page");
  const steps = document.querySelectorAll(".step");

  pages.forEach(page => page.classList.remove("active"));
  steps.forEach(step => step.classList.remove("active"));

  const targetPage = document.getElementById(pageId);

  if (targetPage) {
    targetPage.classList.add("active");
  }

  const stepMap = {
    lrod: 0,
    teo: 1,
    master: 2,
    map: 3,
    decision: 4
  };

  if (stepMap[pageId] !== undefined && steps[stepMap[pageId]]) {
    steps[stepMap[pageId]].classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function goHome() {
  moveTo("lrod");

  const chatWindow = document.getElementById("chatWindow");

  if (chatWindow) {
    chatWindow.scrollTop = 0;
  }
}

function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const loginError = document.getElementById("loginError");

  const savedName = localStorage.getItem("demoUserName");
  const savedEmail = localStorage.getItem("demoUserEmail");
  const savedPassword = localStorage.getItem("demoUserPassword");
  const savedHousehold = localStorage.getItem("demoUserHousehold");
  const savedJob = localStorage.getItem("demoUserJob");

  if (!email || !password) {
    loginError.textContent = "이메일과 비밀번호를 모두 입력해주세요.";
    return;
  }

  if (!savedEmail || !savedPassword) {
    loginError.textContent = "가입된 계정이 없습니다. 먼저 회원가입을 진행해주세요.";
    return;
  }

  if (email !== savedEmail || password !== savedPassword) {
    loginError.textContent = "이메일 또는 비밀번호가 일치하지 않습니다.";
    return;
  }

  loginError.textContent = "";

  setLoggedInUser(savedName, savedHousehold, savedJob);

  const hasPreference = localStorage.getItem("hasPreference");

  if (hasPreference) {
    activatePersonalizedResult();
    moveTo("lrod");
  } else {
    moveTo("preference");
  }
}

function signupUser() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const household = document.getElementById("signupHousehold").value;
  const job = document.getElementById("signupJob").value;
  const signupError = document.getElementById("signupError");

  if (!name || !email || !password || !household || !job) {
    signupError.textContent = "회원가입 정보를 모두 입력해주세요.";
    return;
  }

  localStorage.setItem("demoUserName", name);
  localStorage.setItem("demoUserEmail", email);
  localStorage.setItem("demoUserPassword", password);
  localStorage.setItem("demoUserHousehold", household);
  localStorage.setItem("demoUserJob", job);

  signupError.textContent = "";

  setLoggedInUser(name, household, job);
  moveTo("preference");
}

function setLoggedInUser(name, household, job) {
  localStorage.setItem("currentUserName", name);
  const userArea = document.getElementById("userArea");
  const mypageUserInfo = document.getElementById("mypageUserInfo");

  if (userArea) {
    userArea.innerHTML = `
      <div class="user-menu">
        <span class="user-profile">${name} · ${household} · ${job}</span>
        <button class="mypage-btn" onclick="moveTo('mypage')">마이페이지</button>
        <button class="logout-btn" onclick="logoutUser()">로그아웃</button>
      </div>
    `;
  }

  if (mypageUserInfo) {
    mypageUserInfo.textContent = `${name} · ${household} · ${job}`;
  }

  updateMypagePreference();
}

function logoutUser() {
  const userArea = document.getElementById("userArea");

  localStorage.removeItem("currentUserName");

  if (userArea) {
    userArea.innerHTML = `
      <button class="top-auth-btn" onclick="moveTo('login')">로그인</button>
      <button class="top-auth-btn signup" onclick="moveTo('signup')">회원가입</button>
    `;
  }

  location.reload();
}

function savePreference() {
  const region = document.getElementById("prefRegion").value;
  const dealType = document.getElementById("prefDealType").value;
  const noise = document.getElementById("prefNoise").value;
  const houseType = document.getElementById("prefHouseType").value;

  let budget = "";

  if (dealType === "월세") {
    const deposit = document.getElementById("prefDeposit").value;
    const monthlyRent = document.getElementById("prefMonthlyRent").value;

    budget = `보증금 ${deposit} / 월세 ${monthlyRent}`;

    localStorage.setItem("deposit", deposit);
    localStorage.setItem("monthlyRent", monthlyRent);
  } else {
    budget = document.getElementById("prefBudget").value;
  }

  const activeOptions = document.querySelectorAll(".pref-option.active");
  const priorities = Array.from(activeOptions).map(option => option.textContent.trim());

  localStorage.setItem("hasPreference", "true");
  localStorage.setItem("region", region);
  localStorage.setItem("dealType", dealType);
  localStorage.setItem("budget", budget);
  localStorage.setItem("noise", noise);
  localStorage.setItem("houseType", houseType);
  localStorage.setItem("priorities", priorities.join(", "));

  updateMypagePreference();
  activatePersonalizedResult();

  moveTo("lrod");
}

function changeDealType() {
  const dealType = document.getElementById("prefDealType").value;
  const saleBudgetBox = document.getElementById("saleBudgetBox");
  const rentBudgetBox = document.getElementById("rentBudgetBox");

  if (dealType === "월세") {
    saleBudgetBox.style.display = "none";
    rentBudgetBox.style.display = "block";
  } else {
    saleBudgetBox.style.display = "block";
    rentBudgetBox.style.display = "none";
  }
}

function updateMypagePreference() {
  const preferenceInfo = document.getElementById("mypagePreferenceInfo");

  if (!preferenceInfo) return;

  const region = localStorage.getItem("region") || "미설정";
  const dealType = localStorage.getItem("dealType") || "미설정";
  const budget = localStorage.getItem("budget") || "미설정";
  const noise = localStorage.getItem("noise") || "미설정";
  const houseType = localStorage.getItem("houseType") || "미설정";
  const priorities = localStorage.getItem("priorities") || "미설정";

  preferenceInfo.innerHTML = `
    지역: ${region}<br />
    거래 유형: ${dealType}<br />
    예산: ${budget}<br />
    중요 조건: ${priorities}<br />
    소음 민감도: ${noise}<br />
    주거 형태: ${houseType}
  `;
}

function editPreference() {
  loadPreferenceToForm();
  moveTo("preference");
}

function loadPreferenceToForm() {
  const region = localStorage.getItem("region");
  const dealType = localStorage.getItem("dealType");
  const budget = localStorage.getItem("budget");
  const noise = localStorage.getItem("noise");
  const houseType = localStorage.getItem("houseType");
  const priorities = localStorage.getItem("priorities");

  if (region && document.getElementById("prefRegion")) {
    document.getElementById("prefRegion").value = region;
  }

  if (dealType && document.getElementById("prefDealType")) {
    document.getElementById("prefDealType").value = dealType;
    changeDealType();
  }

  if (budget && dealType !== "월세" && document.getElementById("prefBudget")) {
    document.getElementById("prefBudget").value = budget;
  }

  if (noise && document.getElementById("prefNoise")) {
    document.getElementById("prefNoise").value = noise;
  }

  if (houseType && document.getElementById("prefHouseType")) {
    document.getElementById("prefHouseType").value = houseType;
  }

  if (priorities) {
    const selectedPriorities = priorities.split(",").map(item => item.trim());
    const buttons = document.querySelectorAll(".pref-option");

    buttons.forEach(button => {
      if (selectedPriorities.includes(button.textContent.trim())) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("pref-option")) {
    event.target.classList.toggle("active");
  }
});
function activatePersonalizedResult() {
  const userName = localStorage.getItem("currentUserName") || "사용자";
  const region = localStorage.getItem("region") || "용산구";
  const dealType = localStorage.getItem("dealType") || "매매";
  const budget = localStorage.getItem("budget") || "5억~7억";
  const noise = localStorage.getItem("noise") || "보통";
  const houseType = localStorage.getItem("houseType") || "오피스텔";
  const priorities = localStorage.getItem("priorities") || "직주근접, 역세권, 생활 인프라";

  const mainCard = document.querySelector("#lrod .main");
  const leftSubTexts = document.querySelectorAll("#lrod aside .sub");
  const lrodTags = document.getElementById("lrodTags");
  const lrodLoginBtn = document.getElementById("lrodLoginBtn");

  const lrodTitle = document.querySelector("#lrod .main h2");
  const lrodDesc = document.querySelector("#lrod .main > .sub");
  const scanBox = document.querySelector("#lrod .scan-box");
  const statusItems = document.querySelectorAll("#lrod .status");
  const propertyBox = document.querySelector("#lrod .property");
  const masterBubble = document.querySelector("#lrod .chat-window .bubble");
  const checkList = document.querySelector("#lrod .check-list");
  const chatInputBox = document.querySelector("#lrod .chat-input-box");
  const lockedMap = document.querySelector("#lrod .locked-map");
  const taoMapPreviewSection = document.getElementById("taoMapPreviewSection");
  const taoMapPreviewDesc = document.getElementById("taoMapPreviewDesc");

  if (mainCard) {
    mainCard.classList.add("analyzed");
  }

  if (leftSubTexts[0]) {
    leftSubTexts[0].textContent = `${region} 라이프스타일 레이더`;
  }

  if (leftSubTexts[1]) {
    leftSubTexts[1].textContent = `${userName}님의 생활 기준이 ${region} 공간 분석에 반영되었습니다.`;
  }

  if (lrodTags) {
    const priorityList = priorities.split(",").map(item => item.trim());

    lrodTags.innerHTML = priorityList
      .slice(0, 4)
      .map(item => `<span class="tag">${item}</span>`)
      .join("");
  }

  if (lrodLoginBtn) {
    lrodLoginBtn.style.display = "none";
  }

  if (lrodTitle) {
    lrodTitle.textContent = "L-Rod 개인화 분석 완료";
  }

  if (lrodDesc) {
    lrodDesc.innerHTML = `
      ${userName}님이 선택하신 생활 기준을 바탕으로 ${region} 후보지를 분석했습니다.<br />
      거래 유형: ${dealType} · 예산: ${budget} · 주거 형태: ${houseType}
    `;
  }

  if (scanBox) {
    scanBox.style.display = "none";
  }

  if (statusItems.length >= 4) {
    statusItems[0].textContent = "강남 접근 24분";
    statusItems[1].textContent = "한강 접근 8분";
    statusItems[2].textContent = "생활 인프라 93%";
    statusItems[3].textContent = `소음 ${noise}`;
  }

  if (propertyBox) {
    propertyBox.className = "top-recommend-card";

    propertyBox.innerHTML = `
    <div class="rank-badge">1</div>

    <img 
      class="top-recommend-img"
      src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80"
      alt="용산 푸르지오 써밋 오피스텔"
    />

    <div class="top-recommend-info">
      <div class="recommend-label">🏆 추천 1위</div>

      <h2>용산 푸르지오 써밋</h2>

      <p class="recommend-meta">
        용산구 한강로2가 <span>|</span> 오피스텔 <span>|</span> 84㎡
      </p>

      <div class="price">5억 ~ 7억</div>

      <div class="mini-score-row">
        <div>
          <span>역세권</span>
          <strong>95</strong>
        </div>
        <div>
          <span>직주근접</span>
          <strong>93</strong>
        </div>
        <div>
          <span>생활인프라</span>
          <strong>94</strong>
        </div>
        <div>
          <span>환경접근성</span>
          <strong>91</strong>
        </div>
      </div>
    </div>

    <div class="score-circle" style="--score: 92;">
      <div class="score-inner">
        <strong>92<span>점</span></strong>
        <small>적합도</small>
      </div>
    </div>

    <button class="outline-data-btn" onclick="moveTo('teo')">
      환경 데이터 보기
    </button>
  `;
  }

  if (masterBubble) {
    masterBubble.innerHTML = `
      ${userName}님이 설정하신 조건을 기준으로 분석한 결과,
      ${region}에서는 <strong>용산 푸르지오 써밋 오피스텔</strong>이 가장 적합합니다.
      직주근접, 역세권, 생활 인프라 측면에서 높은 점수를 받았습니다.
    `;
  }

  if (checkList) {
    checkList.innerHTML = `
      · 신용산역 도보권으로 출퇴근 접근성이 우수합니다.<br />
      · 한강과 생활 인프라 접근성이 좋아 1인 가구 생활 만족도가 높습니다.<br />
      · 관리비와 가격대는 계약 전 확인이 필요합니다.
    `;
  }

  const chatWindow = document.getElementById("chatWindow");

  if (chatWindow && !document.getElementById("quickQuestionBox")) {
    const quickBox = document.createElement("div");
    quickBox.id = "quickQuestionBox";
    quickBox.innerHTML = `
      <div class="quick-question" onclick="quickAsk('주변 소음은 어떤가요?')">주변 소음은 어떤가요?</div>
      <div class="quick-question" onclick="quickAsk('출퇴근은 괜찮나요?')">출퇴근은 괜찮나요?</div>
      <div class="quick-question" onclick="quickAsk('생활 인프라는 어떤가요?')">생활 인프라는 어떤가요?</div>
      <div class="quick-question" onclick="quickAsk('최종 추천 이유는?')">최종 추천 이유는?</div>
    `;

    chatWindow.appendChild(quickBox);
  }

  if (chatInputBox) {
    chatInputBox.classList.remove("locked-input");
    chatInputBox.innerHTML = `
      <input id="chatInput" type="text" placeholder="무엇이든 물어보세요..." onkeydown="handleEnter(event)" />
      <button class="send-btn" onclick="sendMessage()">➤</button>
    `;
  }

  if (taoMapPreviewSection) {
    taoMapPreviewSection.classList.remove("locked-card");
    taoMapPreviewSection.removeAttribute("onclick");
    taoMapPreviewSection.style.cursor = "default";
  }

  if (taoMapPreviewDesc) {
    taoMapPreviewDesc.textContent = `${region} 후보 공간을 거래유형, 방 구조, 가격대별로 비교합니다.`;
  }

  if (lockedMap) {
    lockedMap.className = "tao-preview-cards";

    const places = getTaoMapPreviewPlaces(dealType);

    lockedMap.innerHTML = places.map((place, index) => `
    <div class="tao-preview-card ${index === 0 ? "active" : ""}" onclick="moveTo('map')">
      <img src="${place.image}" alt="${place.name}" />

      <h4>${place.name}</h4>

      <div class="tao-preview-meta">
        ${place.dealType} · ${place.roomType} · ${place.area}<br />
        ${place.price}
      </div>

      <div class="tao-preview-score">
        적합도 ${place.score}
      </div>

      <span class="tao-preview-tag">${place.tag}</span>
    </div>
  `).join("");
  }
}
function quickAsk(question) {

  const chatWindow = document.getElementById("chatWindow");

  if (!chatWindow) return;

  const userBubble = document.createElement("div");
  userBubble.className = "bubble user";
  userBubble.textContent = question;

  chatWindow.appendChild(userBubble);

  let answer = "";

  switch (question) {

    case "주변 소음은 어떤가요?":
      answer =
        "도로변과의 거리가 있어 실내 유입 소음은 낮은 편으로 분석됩니다. 다만 야간 시간대 차량 흐름은 실제 방문 시 확인하는 것이 좋습니다.";
      break;

    case "출퇴근은 괜찮나요?":
      answer =
        "신용산역 도보권에 위치하여 강남과 여의도 접근성이 우수합니다. 직주근접을 중요하게 생각하는 직장인에게 적합합니다.";
      break;

    case "생활 인프라는 어떤가요?":
      answer =
        "반경 500m 내 편의점, 카페, 병원, 대형마트가 위치해 있어 생활 편의성이 높은 편입니다.";
      break;

    case "최종 추천 이유는?":
      answer =
        "설정하신 직주근접, 역세권, 생활 인프라 조건과 예산 범위를 가장 잘 충족하여 1순위 후보로 추천되었습니다.";
      break;

    default:
      answer =
        "추가 분석 기능은 준비 중입니다.";
  }

  const botWrap = document.createElement("div");
  botWrap.className = "chat-row";

  botWrap.innerHTML = `
    <div class="avatar">T</div>
    <div class="bubble">
      ${answer}
    </div>
  `;

  chatWindow.appendChild(botWrap);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}
function deleteAccount() {

  if (!confirm("정말 회원탈퇴 하시겠습니까?")) {
    return;
  }

  localStorage.removeItem("demoUserName");
  localStorage.removeItem("demoUserEmail");
  localStorage.removeItem("demoUserPassword");
  localStorage.removeItem("demoUserHousehold");
  localStorage.removeItem("demoUserJob");

  localStorage.removeItem("currentUserName");

  localStorage.removeItem("hasPreference");
  localStorage.removeItem("region");
  localStorage.removeItem("dealType");
  localStorage.removeItem("budget");
  localStorage.removeItem("noise");
  localStorage.removeItem("houseType");
  localStorage.removeItem("priorities");

  alert("회원탈퇴가 완료되었습니다.");

  location.reload();
}
function getTaoMapPreviewPlaces(dealType) {
  if (dealType === "월세") {
    return [
      {
        name: "용산역 원룸 오피스텔",
        area: "한강로2가",
        dealType: "월세",
        roomType: "원룸형",
        price: "보증금 1,000~3,000 / 월세 60~80",
        score: 89,
        tag: "월세형",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "신용산 투룸 오피스텔",
        area: "한강로3가",
        dealType: "월세",
        roomType: "투룸형",
        price: "보증금 5,000~1억 / 월세 80~100",
        score: 86,
        tag: "직주근접",
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "후암동 소형 주거지",
        area: "후암동",
        dealType: "월세",
        roomType: "원룸형",
        price: "보증금 500~1,000 / 월세 40~60",
        score: 82,
        tag: "가성비",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
      }
    ];
  }

  if (dealType === "전세") {
    return [
      {
        name: "시티파크 오피스텔",
        area: "한강로3가",
        dealType: "전세",
        roomType: "투룸형",
        price: "전세 3억~5억",
        score: 90,
        tag: "중간형",
        image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "용산시티하우스",
        area: "한강로3가",
        dealType: "전세",
        roomType: "원룸형",
        price: "전세 2억~3억",
        score: 86,
        tag: "1인 가구",
        image: "https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "효창동 소형 아파트",
        area: "효창동",
        dealType: "전세",
        roomType: "투룸형",
        price: "전세 3억~5억",
        score: 84,
        tag: "조용한 주거지",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
      }
    ];
  }

  return [
    {
      name: "용산 푸르지오 써밋 오피스텔",
      area: "한강로2가",
      dealType: "매매",
      roomType: "투룸형",
      price: "5억~7억",
      score: 92,
      tag: "고급형",
      image: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "시티파크 오피스텔",
      area: "한강로3가",
      dealType: "매매",
      roomType: "원룸~투룸형",
      price: "4억~6억",
      score: 88,
      tag: "중간형",
      image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "용산시티하우스",
      area: "한강로3가",
      dealType: "매매",
      roomType: "원룸형",
      price: "2.4억~2.9억",
      score: 84,
      tag: "가성비형",
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
    }
  ];
}

function changeTeoLayer(type) {
 const title=document.getElementById("layerTitle");
 const content=document.getElementById("layerContent");
 if(!title||!content)return;
 const data={
 traffic:["교통 분석",`<p>신용산역 320m</p><p>용산역 580m</p><p>강남역 24분</p><p>광화문 18분</p>`],
 commerce:["상권 분석",`<p>카페 42개</p><p>편의점 13개</p><p>병원 15개</p><p>헬스장 8개</p>`],
 park:["공원 분석",`<p>용산공원 450m</p><p>한강공원 1.2km</p><p>산책 적합도 91점</p>`],
 hospital:["의료 인프라",`<p>순천향병원 900m</p><p>약국 8개</p><p>응급실 접근 우수</p>`],
 invest:["투자 분석",`<p>최근 3년 상승률 +12%</p><p>GTX 수혜 예상</p><p>투자성 점수 88점</p>`]
 };
 title.innerText=data[type][0];
 content.innerHTML=data[type][1];
}

function enterInteriorMode(){
 const mapArea=document.querySelector(".teo-map-area");
 if(!mapArea)return;
 mapArea.innerHTML=`<div class="interior-view"><h2>용산 푸르지오 써밋</h2><div class="interior-buttons"><button>☀️ 일조</button><button>🔊 소음</button><button>🌫️ 공기질</button><button>👀 조망</button></div><div class="interior-info">실내 디지털 트윈 환경 분석 데모</div></div>`;
}
