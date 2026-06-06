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

  if (!email || !password) {
    loginError.textContent = "이메일과 비밀번호를 모두 입력해주세요.";
    return;
  }

  loginError.textContent = "";

  setLoggedInUser(email, "1인 가구", "직장인");

  moveTo("preference");
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

  if (userArea) {
    userArea.innerHTML = `
      <button class="top-auth-btn" onclick="moveTo('login')">로그인</button>
      <button class="top-auth-btn signup" onclick="moveTo('signup')">회원가입</button>
    `;
  }

  moveTo("lrod");
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
    scanBox.innerHTML = `
      <strong>${region} 추천 후보 분석 완료</strong>
      <p class="sub">우선순위: ${priorities}</p>
    `;
  }

  if (statusItems.length >= 4) {
    statusItems[0].textContent = "강남 접근 24분";
    statusItems[1].textContent = "한강 접근 8분";
    statusItems[2].textContent = "생활 인프라 93%";
    statusItems[3].textContent = `소음 ${noise}`;
  }

  if (propertyBox) {
    propertyBox.innerHTML = `
      <img src="https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=800&q=80" />

      <div>
        <h2>용산 푸르지오 써밋 오피스텔</h2>
        <p class="sub">한강로2가 · 고급형 오피스텔 · ${houseType} 선호 반영</p>
        <div class="price">5억 ~ 7억</div>
        <p class="sub">
          신용산역 도보권 · 직주근접 우수 · 생활 인프라 풍부
        </p>
        <button class="btn" onclick="moveTo('teo')">환경 데이터 보기</button>
      </div>
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

  if (lockedMap) {
    lockedMap.innerHTML = `
      <strong>추천 후보 3곳</strong><br /><br />
      1위 용산 푸르지오 써밋 오피스텔 · 적합도 92<br />
      2위 시티파크 오피스텔 · 적합도 88<br />
      3위 용산시티하우스 · 적합도 84
    `;
  }
}