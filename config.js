const STORAGE_KEY = "ccw_versions";

const DEFAULT_DATA = [
  {
    id: 1,
    version: "v1.3.0",
    date: "2026-05-26",
    author: "천찬웅",
    category: "Feature",
    desc: "형상관리 대시보드 페이지 신규 추가",
    detail: "- 버전 이력 테이블 구현\n- 상태 필터 및 검색 기능 추가\n- localStorage 기반 데이터 저장\n- CSV 내보내기 기능",
    status: "배포됨"
  },
  {
    id: 2,
    version: "v1.2.1",
    date: "2026-05-20",
    author: "천찬웅",
    category: "Bugfix",
    desc: "모바일 네비게이션 레이아웃 깨짐 수정",
    detail: "- 480px 이하 해상도에서 nav-links 미표시 처리\n- 햄버거 메뉴 미구현으로 인한 레이아웃 오버플로우 수정",
    status: "배포됨"
  },
  {
    id: 3,
    version: "v1.2.0",
    date: "2026-05-15",
    author: "천찬웅",
    category: "Design",
    desc: "포트폴리오 히어로 섹션 애니메이션 개선",
    detail: "- gradient-text shimmer 애니메이션 추가\n- orb float 애니메이션 속도 조정\n- reveal 스크롤 효과 딜레이 최적화",
    status: "배포됨"
  },
  {
    id: 4,
    version: "v1.1.0",
    date: "2026-05-10",
    author: "천찬웅",
    category: "Feature",
    desc: "프로젝트 섹션 카드 hover 인터랙션 추가",
    detail: "- project-card translateX hover 효과\n- 태그 pill 스타일 추가\n- 프로젝트 3개 초기 데이터 작성",
    status: "완료"
  },
  {
    id: 5,
    version: "v1.0.0",
    date: "2026-05-01",
    author: "천찬웅",
    category: "Feature",
    desc: "포트폴리오 사이트 최초 릴리즈",
    detail: "- Hero / About / Skills / Projects / Contact 섹션 구현\n- 다크 테마 디자인 시스템 구축\n- 반응형 레이아웃 적용\n- IntersectionObserver 스크롤 애니메이션",
    status: "배포됨"
  }
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveData(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DATA;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getNextId(data) {
  return data.length ? Math.max(...data.map(d => d.id)) + 1 : 1;
}

function statusBadgeClass(status) {
  const map = { "개발중": "badge-dev", "완료": "badge-done", "배포됨": "badge-deploy", "롤백": "badge-rollback" };
  return map[status] || "badge-dev";
}

function getInitial(name) {
  return name ? name.charAt(0) : "?";
}

function updateStats(data) {
  document.getElementById("statTotal").textContent = data.length;
  document.getElementById("statDeployed").textContent = data.filter(d => d.status === "배포됨").length;
  document.getElementById("statDev").textContent = data.filter(d => d.status === "개발중").length;
  const authors = new Set(data.map(d => d.author));
  document.getElementById("statContrib").textContent = authors.size;
}

function renderTable(data) {
  const tbody = document.getElementById("versionBody");
  const empty = document.getElementById("emptyMsg");

  if (!data.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = data.map(item => `
    <tr>
      <td><span class="version-num">${escHtml(item.version)}</span></td>
      <td>${escHtml(item.date)}</td>
      <td>
        <span class="author-chip">
          <span class="author-avatar">${escHtml(getInitial(item.author))}</span>
          ${escHtml(item.author)}
        </span>
      </td>
      <td><span class="cat-badge cat-${escHtml(item.category)}">${escHtml(item.category)}</span></td>
      <td><span class="cm-desc-text" title="${escHtml(item.desc)}">${escHtml(item.desc)}</span></td>
      <td><span class="badge ${statusBadgeClass(item.status)}">${escHtml(item.status)}</span></td>
      <td style="text-align:right">
        <button class="btn-detail" data-id="${item.id}">상세</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".btn-detail").forEach(btn => {
    btn.addEventListener("click", () => openDetail(parseInt(btn.dataset.id)));
  });
}

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getFilteredData() {
  let data = loadData();
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const statusFilter = document.querySelector(".cm-filter-btn.active")?.dataset.filter || "all";
  const categoryFilter = document.getElementById("categoryFilter").value;

  if (search) {
    data = data.filter(d =>
      d.version.toLowerCase().includes(search) ||
      d.desc.toLowerCase().includes(search) ||
      d.author.toLowerCase().includes(search)
    );
  }
  if (statusFilter !== "all") {
    data = data.filter(d => d.status === statusFilter);
  }
  if (categoryFilter !== "all") {
    data = data.filter(d => d.category === categoryFilter);
  }
  return data;
}

function refreshView() {
  const data = loadData();
  updateStats(data);
  renderTable(getFilteredData());
}

/* ---- 필터 이벤트 ---- */
document.querySelectorAll(".cm-filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cm-filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTable(getFilteredData());
  });
});

document.getElementById("searchInput").addEventListener("input", () => renderTable(getFilteredData()));
document.getElementById("categoryFilter").addEventListener("change", () => renderTable(getFilteredData()));

/* ---- 버전 추가 모달 ---- */
function openAddModal() {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById("fDate").value = today;
  document.getElementById("fVersion").value = "";
  document.getElementById("fAuthor").value = "";
  document.getElementById("fDesc").value = "";
  document.getElementById("fDetail").value = "";
  document.querySelector('input[name="fStatus"][value="개발중"]').checked = true;
  document.getElementById("addModal").classList.add("open");
}

function closeAddModal() {
  document.getElementById("addModal").classList.remove("open");
}

document.getElementById("btnOpenAdd").addEventListener("click", openAddModal);
document.getElementById("btnOpenAddMain").addEventListener("click", openAddModal);
document.getElementById("btnCloseAdd").addEventListener("click", closeAddModal);
document.getElementById("btnCancelAdd").addEventListener("click", closeAddModal);

document.getElementById("addModal").addEventListener("click", e => {
  if (e.target === document.getElementById("addModal")) closeAddModal();
});

document.getElementById("addForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = loadData();
  const newEntry = {
    id: getNextId(data),
    version: document.getElementById("fVersion").value.trim(),
    date: document.getElementById("fDate").value,
    author: document.getElementById("fAuthor").value.trim(),
    category: document.getElementById("fCategory").value,
    desc: document.getElementById("fDesc").value.trim(),
    detail: document.getElementById("fDetail").value.trim(),
    status: document.querySelector('input[name="fStatus"]:checked').value
  };
  data.unshift(newEntry);
  saveData(data);
  closeAddModal();
  refreshView();
});

/* ---- 상세 모달 ---- */
let currentDetailId = null;

function openDetail(id) {
  const data = loadData();
  const item = data.find(d => d.id === id);
  if (!item) return;
  currentDetailId = id;

  document.getElementById("detailTitle").textContent = `${item.version} 상세 정보`;
  document.getElementById("detailBody").innerHTML = `
    <div class="detail-row"><span class="detail-key">버전</span><span class="detail-val"><span class="version-num">${escHtml(item.version)}</span></span></div>
    <div class="detail-row"><span class="detail-key">날짜</span><span class="detail-val">${escHtml(item.date)}</span></div>
    <div class="detail-row"><span class="detail-key">작성자</span><span class="detail-val">${escHtml(item.author)}</span></div>
    <div class="detail-row"><span class="detail-key">카테고리</span><span class="detail-val"><span class="cat-badge cat-${escHtml(item.category)}">${escHtml(item.category)}</span></span></div>
    <div class="detail-row"><span class="detail-key">상태</span><span class="detail-val"><span class="badge ${statusBadgeClass(item.status)}">${escHtml(item.status)}</span></span></div>
    <div class="detail-row"><span class="detail-key">요약</span><span class="detail-val">${escHtml(item.desc)}</span></div>
    ${item.detail ? `<div class="detail-row"><span class="detail-key">변경사항</span><span class="detail-val">${escHtml(item.detail)}</span></div>` : ""}
  `;
  document.getElementById("detailModal").classList.add("open");
}

document.getElementById("btnCloseDetail").addEventListener("click", () => {
  document.getElementById("detailModal").classList.remove("open");
});
document.getElementById("btnCloseDetailOk").addEventListener("click", () => {
  document.getElementById("detailModal").classList.remove("open");
});
document.getElementById("detailModal").addEventListener("click", e => {
  if (e.target === document.getElementById("detailModal")) {
    document.getElementById("detailModal").classList.remove("open");
  }
});

document.getElementById("btnDelete").addEventListener("click", () => {
  if (currentDetailId === null) return;
  if (!confirm("이 버전을 삭제하시겠습니까?")) return;
  let data = loadData();
  data = data.filter(d => d.id !== currentDetailId);
  saveData(data);
  document.getElementById("detailModal").classList.remove("open");
  refreshView();
});

/* ---- CSV 내보내기 ---- */
document.getElementById("btnExport").addEventListener("click", () => {
  const data = loadData();
  const headers = ["버전", "날짜", "작성자", "카테고리", "변경내용요약", "상태"];
  const rows = data.map(d => [
    d.version, d.date, d.author, d.category,
    `"${(d.desc || "").replace(/"/g, '""')}"`,
    d.status
  ].join(","));
  const csv = "﻿" + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ccw_versions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

/* ---- 스크롤 reveal ---- */
const revealEls = document.querySelectorAll(".reveal");
revealEls.forEach(el => el.classList.add("reveal"));
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add("in"), i * 80);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObs.observe(el));

/* ---- 초기 렌더 ---- */
refreshView();
