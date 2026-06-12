// ─── 매물 데이터 ───────────────────────────────────────────────
// videoUrl: mp4 직링크 또는 YouTube embed URL 입력
// YouTube 예시: "https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=VIDEO_ID"
// mp4 예시: "https://yourcdn.com/yongsan_sim.mp4"
const TEO_PROPERTIES = [
  {
    id: 0,
    name: "용산 푸르지오 써밋",
    address: "한강로2가",
    type: "오피스텔 84㎡",
    price: "5억~7억",
    score: 92,
    tag: "고급형",
    mapLat: 37.5327,
    mapLng: 126.9648,
    videoUrl: "", // ← 여기에 영상 URL 입력
    indoor: {
      view:    { score: 94, desc: "남향 위주 일조 우수. 오후 2시 기준 직달 일사 약 4.2시간." },
      noise:   { score: 87, desc: "도로변 거리 80m. 실내 측정 예상 소음 38dB(야간 기준)." },
      air:     { score: 91, desc: "PM2.5 평균 12μg/m³. 한강 방향 환기 통로 확보." },
      outlook: { score: 95, desc: "한강 조망 부분 확보. 고층 세대 기준 시야각 110°." }
    }
  },
  {
    id: 1,
    name: "시티파크 오피스텔",
    address: "한강로3가",
    type: "오피스텔 59㎡",
    price: "4억~6억",
    score: 88,
    tag: "중간형",
    mapLat: 37.5340,
    mapLng: 126.9670,
    videoUrl: "", // ← 여기에 영상 URL 입력
    indoor: {
      view:    { score: 88, desc: "동향. 오전 일조 양호. 인접 건물로 오후 음영 발생." },
      noise:   { score: 82, desc: "대로변 인접. 이중창 설치 시 실내 42dB 예상." },
      air:     { score: 85, desc: "공원 인접으로 PM10 농도 상대적으로 낮음." },
      outlook: { score: 80, desc: "용산공원 방향 부분 조망. 저층 세대는 조망 제한." }
    }
  },
  {
    id: 2,
    name: "용산시티하우스",
    address: "한강로3가",
    type: "도시형 생활주택 33㎡",
    price: "2.4억~2.9억",
    score: 84,
    tag: "가성비형",
    mapLat: 37.5310,
    mapLng: 126.9655,
    videoUrl: "", // ← 여기에 영상 URL 입력
    indoor: {
      view:    { score: 78, desc: "북향 세대 포함. 일조 시간 2.1시간(겨울 기준)." },
      noise:   { score: 79, desc: "골목 이면도로 인접. 상대적으로 차분한 환경." },
      air:     { score: 83, desc: "주변 녹지 부족. 환기 빈도 권장." },
      outlook: { score: 72, desc: "인접 건물 밀도 높아 개방감 제한." }
    }
  }
];

let currentPropId = 0;
let currentTeoMode = "outdoor";
let currentIndoorLayer = "view";
let simVideoEl = null;
let simIframeEl = null;

// ─── 모드 전환 ──────────────────────────────────────────────────
function switchTeoMode(mode) {
  currentTeoMode = mode;
  document.getElementById("teoOutdoor").style.display = mode === "outdoor" ? "" : "none";
  document.getElementById("teoIndoor").style.display  = mode === "indoor"  ? "" : "none";

  document.getElementById("tabOutdoor").classList.toggle("active", mode === "outdoor");
  document.getElementById("tabIndoor").classList.toggle("active", mode === "indoor");

  if (mode === "indoor") {
    renderIndoorList();
    if (currentPropId !== null) loadSimVideo(currentPropId);
  }
}

// ─── 실외: 레이어 데이터 ────────────────────────────────────────
const LAYER_DATA = {
  traffic:  ["교통 분석",    `<p>신용산역 320m</p><p>용산역 580m</p><p>강남역 24분</p><p>광화문 18분</p>`],
  commerce: ["상권 분석",    `<p>카페 42개</p><p>편의점 13개</p><p>병원 15개</p><p>헬스장 8개</p>`],
  park:     ["공원 분석",    `<p>용산공원 450m</p><p>한강공원 1.2km</p><p>산책 적합도 91점</p>`],
  hospital: ["의료 인프라",  `<p>순천향병원 900m</p><p>약국 8개</p><p>응급실 접근 우수</p>`],
  invest:   ["투자 분석",    `<p>최근 3년 상승률 +12%</p><p>GTX 수혜 예상</p><p>투자성 점수 88점</p>`]
};

function changeTeoLayer(type) {
  const title   = document.getElementById("layerTitle");
  const content = document.getElementById("layerContent");
  if (!title || !content || !LAYER_DATA[type]) return;
  title.textContent = LAYER_DATA[type][0];
  content.innerHTML = LAYER_DATA[type][1];

  document.querySelectorAll(".teo-sidebar .teo-btn").forEach(b => b.classList.remove("active"));
  const btnMap = { traffic:"btnTraffic", commerce:"btnCommerce", park:"btnPark", hospital:"btnHospital", invest:"btnInvest" };
  if (btnMap[type]) document.getElementById(btnMap[type])?.classList.add("active");
}

// ─── 실외: 매물 카드 렌더링 ─────────────────────────────────────
function renderPropCards() {
  const row = document.getElementById("propCardRow");
  if (!row) return;
  row.innerHTML = TEO_PROPERTIES.map(p => `
    <div class="prop-card ${p.id === currentPropId ? "active" : ""}" onclick="selectProperty(${p.id})">
      <div class="prop-card-tag">${p.tag}</div>
      <div class="prop-card-name">${p.name}</div>
      <div class="prop-card-addr">${p.address} · ${p.type}</div>
      <div class="prop-card-price">${p.price}</div>
      <div class="prop-card-score">적합도 <strong>${p.score}</strong></div>
    </div>
  `).join("");
}

function selectProperty(id) {
  currentPropId = id;
  const prop = TEO_PROPERTIES[id];
  if (!prop) return;

  // 카드 하이라이트
  document.querySelectorAll(".prop-card").forEach((c, i) => c.classList.toggle("active", i === id));
  document.querySelectorAll(".map-prop-pin").forEach(p => p.classList.toggle("pin-active", +p.dataset.id === id));

  // 카카오 지도 이동
  const frame = document.getElementById("kakaoMapFrame");
  if (frame) {
    frame.src = `https://map.kakao.com/link/map/${encodeURIComponent(prop.name)},${prop.mapLat},${prop.mapLng}`;
  }

  // 우측 패널 매물 요약
  const info = document.getElementById("selectedPropInfo");
  if (info) {
    info.innerHTML = `
      <div class="sel-prop-name">${prop.name}</div>
      <div class="sel-prop-meta">${prop.address} · ${prop.type}</div>
      <div class="sel-prop-price">${prop.price}</div>
      <button class="sel-prop-btn" onclick="switchTeoMode('indoor')">실내 시뮬레이션 보기 →</button>
    `;
  }
}

// ─── 실내: 매물 목록 ────────────────────────────────────────────
function renderIndoorList() {
  const list = document.getElementById("indoorList");
  if (!list) return;
  list.innerHTML = `<div class="indoor-list-title">매물 목록</div>` +
    TEO_PROPERTIES.map(p => `
      <div class="indoor-prop-item ${p.id === currentPropId ? "active" : ""}" onclick="selectIndoorProp(${p.id})">
        <div class="indoor-prop-name">${p.name}</div>
        <div class="indoor-prop-meta">${p.tag} · ${p.price}</div>
        <div class="indoor-prop-score">적합도 ${p.score}</div>
        ${p.videoUrl ? '<div class="indoor-prop-video-badge">▶ 시뮬레이션</div>' : '<div class="indoor-prop-novideo">영상 미등록</div>'}
      </div>
    `).join("");
}

function selectIndoorProp(id) {
  currentPropId = id;
  document.querySelectorAll(".indoor-prop-item").forEach((el, i) => el.classList.toggle("active", i === id));
  loadSimVideo(id);
  renderIndoorLayerPanel(id, currentIndoorLayer);
}

// ─── 실내: 영상 로드 ─────────────────────────────────────────────
function loadSimVideo(id) {
  const prop = TEO_PROPERTIES[id];
  if (!prop) return;

  const wrap = document.getElementById("simVideoWrap");
  const placeholder = document.getElementById("simPlaceholder");
  const controls = document.getElementById("simControls");
  const badge = document.getElementById("simPropBadge");

  if (badge) {
    badge.textContent = prop.name + " · " + prop.type;
  }

  // 기존 iframe 제거
  const existingIframe = document.getElementById("simIframe");
  if (existingIframe) existingIframe.remove();

  const videoEl = document.getElementById("simVideo");

  if (!prop.videoUrl) {
    if (placeholder) placeholder.style.display = "";
    if (videoEl) videoEl.style.display = "none";
    if (controls) controls.style.display = "none";
    return;
  }

  const isYoutube = prop.videoUrl.includes("youtube.com") || prop.videoUrl.includes("youtu.be");

  if (isYoutube) {
    if (videoEl) videoEl.style.display = "none";
    if (controls) controls.style.display = "none";
    if (placeholder) placeholder.style.display = "none";

    const iframe = document.createElement("iframe");
    iframe.id = "simIframe";
    iframe.src = prop.videoUrl;
    iframe.className = "sim-video sim-iframe";
    iframe.allow = "autoplay; fullscreen";
    iframe.allowFullscreen = true;
    iframe.frameBorder = "0";
    wrap.appendChild(iframe);

  } else {
    // mp4 직링크
    if (videoEl) {
      videoEl.src = prop.videoUrl;
      videoEl.style.display = "";
      videoEl.play().catch(() => {});
      if (placeholder) placeholder.style.display = "none";
      if (controls) controls.style.display = "";

      videoEl.ontimeupdate = updateSimProgress;
    }
  }
}

// ─── 실내: 영상 컨트롤 ──────────────────────────────────────────
function toggleSimVideo() {
  const v = document.getElementById("simVideo");
  const btn = document.getElementById("simPlayBtn");
  if (!v) return;
  if (v.paused) { v.play(); btn.textContent = "⏸"; }
  else          { v.pause(); btn.textContent = "▶"; }
}

function toggleSimMute() {
  const v = document.getElementById("simVideo");
  if (!v) return;
  v.muted = !v.muted;
}

function updateSimProgress() {
  const v = document.getElementById("simVideo");
  const bar = document.getElementById("simProgressBar");
  const time = document.getElementById("simTime");
  if (!v || !bar) return;
  const pct = (v.currentTime / v.duration) * 100 || 0;
  bar.style.width = pct + "%";
  if (time) {
    const m = Math.floor(v.currentTime / 60);
    const s = Math.floor(v.currentTime % 60).toString().padStart(2, "0");
    time.textContent = `${m}:${s}`;
  }
}

function seekSimVideo(e) {
  const v = document.getElementById("simVideo");
  const wrap = e.currentTarget;
  if (!v || !wrap) return;
  const rect = wrap.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  v.currentTime = ratio * v.duration;
}

// ─── 실내: 레이어 패널 ──────────────────────────────────────────
function setIndoorLayer(layer, btn) {
  currentIndoorLayer = layer;
  document.querySelectorAll(".indoor-layer-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderIndoorLayerPanel(currentPropId, layer);
}

function renderIndoorLayerPanel(id, layer) {
  const prop = TEO_PROPERTIES[id];
  const panel = document.getElementById("indoorLayerContent");
  if (!prop || !panel) return;
  const d = prop.indoor[layer];
  if (!d) return;

  const labels = { view:"일조 분석", noise:"소음 분석", air:"공기질 분석", outlook:"조망 분석" };
  panel.innerHTML = `
    <div class="indoor-layer-title">${labels[layer] || layer}</div>
    <div class="indoor-score-ring" style="--iscore:${d.score}">
      <div class="indoor-score-num">${d.score}</div>
      <div class="indoor-score-lbl">점</div>
    </div>
    <p class="indoor-layer-desc">${d.desc}</p>
    <div class="indoor-all-scores">
      ${Object.entries(prop.indoor).map(([k, v]) => `
        <div class="indoor-score-row">
          <span>${{view:"일조",noise:"소음",air:"공기질",outlook:"조망"}[k]}</span>
          <div class="indoor-score-bar"><div style="width:${v.score}%"></div></div>
          <strong>${v.score}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

// ─── 초기화 ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  renderPropCards();
  selectProperty(0);
});

// teo 탭 진입 시 재초기화 (navigation.js moveTo 호환)
const _origMoveTo = typeof moveTo === "function" ? moveTo : null;
// moveTo override는 navigation.js 로드 후 처리
document.addEventListener("DOMContentLoaded", function () {
  const steps = document.querySelectorAll(".step");
  steps.forEach(step => {
    if (step.textContent.trim() === "Teo") {
      step.addEventListener("click", function () {
        setTimeout(() => {
          renderPropCards();
          selectProperty(currentPropId);
        }, 50);
      });
    }
  });
});
