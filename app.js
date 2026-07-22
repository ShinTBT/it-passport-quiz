// ==========================================
// 1. Firebase 初期化設定
// ※ Firebase Consoleで取得した設定情報に書き換えてください
// ==========================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebaseの初期化 (CDN compat版)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ==========================================
// 2. グローバル変数 & 状態管理
// ==========================================
let questionsData = [];
let currentUserRole = "student"; // 'student' or 'admin'
let studentName = "";
let selectedOptionIndex = null;
let roomState = {};
let resultChart = null;

// URLクエリパラメータでモード切り替え (?mode=admin で講師モード)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("mode") === "admin") {
  currentUserRole = "admin";
}

// ==========================================
// 3. 初期化処理 (DOM読み込み時)
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  setupUI();
  await loadQuestions();
  initFirestoreListeners();
  
  if (currentUserRole === "admin") {
    initChart();
  }
});

function setupUI() {
  const roleLabel = document.getElementById("user-role-label");
  if (currentUserRole === "admin") {
    roleLabel.textContent = "モード: 講師 (管理者画面)";
    document.getElementById("admin-view").classList.remove("hidden");
  } else {
    roleLabel.textContent = "モード: 学生 (解答画面)";
    document.getElementById("student-view").classList.remove("hidden");
  }
}

// ==========================================
// 4. 問題データ (questions.json) の読み込み
// ==========================================
async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    questionsData = await response.json();
    
    if (currentUserRole === "admin") {
      const selectEl = document.getElementById("admin-question-select");
      selectEl.innerHTML = "";
      questionsData.forEach((q, index) => {
        const opt = document.createElement("option");
        opt.value = q.id;
        opt.textContent = `[${q.category}] Q${index + 1}. ${q.question.substring(0, 30)}...`;
        selectEl.appendChild(opt);
      });
      selectEl.addEventListener("change", updateAdminPreview);
      updateAdminPreview();
    }
  } catch (error) {
    console.error("問題データの読み込みに失敗しました:", error);
  }
}

// 講師画面でプレビュー更新
function updateAdminPreview() {
  const qId = document.getElementById("admin-question-select").value;
  const q = questionsData.find(item => item.id === qId);
  if (!q) return;

  document.getElementById("admin-q-text").textContent = q.question;
  const optionsDiv = document.getElementById("admin-options-preview");
  optionsDiv.innerHTML = q.options.map((opt, i) => `<div>${['ア','イ','ウ','エ'][i]}: ${opt}</div>`).join("");
  document.getElementById("admin-correct-answer").textContent = `正解: ${['ア','イ','ウ','エ'][q.answer]} (インデックス ${q.answer})`;
  document.getElementById("admin-explanation-text").textContent = q.explanation;
}

// ==========================================
// 5. Firestore リアルタイムリスナー
// ==========================================
function initFirestoreListeners() {
  // 1. ルーム状態 (roomState/current) の監視
  db.collection("roomState").doc("current").onSnapshot(doc => {
    if (!doc.exists) return;
    roomState = doc.data();
    updateUIByRoomState(roomState);
  });

  // 2. 回答データ (answers) の監視 (リアルタイム集計)
  db.collection("answers").onSnapshot(snapshot => {
    const answers = [];
    snapshot.forEach(doc => answers.push(doc.data()));
    
    // 現在出題中の問題に対する回答のみフィルタリング
    const currentAnswers = answers.filter(a => a.questionId === roomState.currentQuestionId);
    
    if (currentUserRole === "admin") {
      updateAdminStats(currentAnswers);
    }
  });
}

// ルーム状態の変化に応じて学生画面/講師画面の表示を制御
function updateUIByRoomState(state) {
  const badge = document.getElementById("status-badge");
  
  if (state.status === "waiting") {
    badge.textContent = "待機中";
    badge.style.backgroundColor = "#e0e7ff";
    badge.style.color = "#2563eb";

    if (currentUserRole === "student") {
      if (studentName) {
        showCard("student-waiting-card");
      } else {
        showCard("student-login-card");
      }
    }
  } else if (state.status === "answering") {
    badge.textContent = "回答受付中";
    badge.style.backgroundColor = "#dcfce7";
    badge.style.color = "#16a34a";

    if (currentUserRole === "student" && studentName) {
      renderStudentQuiz(state.currentQuestionId);
      showCard("student-quiz-card");
    }
  } else if (state.status === "showing_result") {
    badge.textContent = "集計・解説中";
    badge.style.backgroundColor = "#fef3c7";
    badge.style.color = "#d97706";

    if (currentUserRole === "student" && studentName) {
      renderStudentResult(state.currentQuestionId);
      showCard("student-result-card");
    }
  }
}

function showCard(cardId) {
  ["student-login-card", "student-waiting-card", "student-quiz-card", "student-result-card"].forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(cardId).classList.remove("hidden");
}

// ==========================================
// 6. 学生側のロジック (参加・解答送信)
// ==========================================
document.getElementById("join-btn").addEventListener("click", () => {
  const input = document.getElementById("student-name-input").value.trim();
  if (!input) {
    alert("お名前を入力してください。");
    return;
  }
  studentName = input;
  updateUIByRoomState(roomState);
});

function renderStudentQuiz(questionId) {
  const q = questionsData.find(item => item.id === questionId);
  if (!q) return;

  document.getElementById("student-q-category").textContent = q.category;
  document.getElementById("student-q-text").textContent = q.question;
  
  const container = document.getElementById("student-options-container");
  container.innerHTML = "";
  selectedOptionIndex = null;
  document.getElementById("submit-answer-btn").disabled = true;

  const labels = ["ア", "イ", "ウ", "エ"];
  q.options.forEach((optText, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<strong>${labels[index]}.</strong> ${optText}`;
    btn.onclick = () => {
      document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedOptionIndex = index;
      document.getElementById("submit-answer-btn").disabled = false;
    };
    container.appendChild(btn);
  });
}

// 解答送信
document.getElementById("submit-answer-btn").addEventListener("click", async () => {
  if (selectedOptionIndex === null || !studentName) return;

  const q = questionsData.find(item => item.id === roomState.currentQuestionId);
  const isCorrect = (selectedOptionIndex === q.answer);

  const answerDocId = `${studentName}_${q.id}`;
  
  try {
    await db.collection("answers").doc(answerDocId).set({
      studentName: studentName,
      questionId: q.id,
      selectedOption: selectedOptionIndex,
      isCorrect: isCorrect,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("submit-answer-btn").disabled = true;
    document.getElementById("submit-answer-btn").textContent = "解答送信済み（解説を待っています）";
  } catch (error) {
    console.error("解答の送信に失敗しました:", error);
    alert("送信に失敗しました。もう一度お試しください。");
  }
});

// 解説画面の表示 (学生側)
function renderStudentResult(questionId) {
  const q = questionsData.find(item => item.id === questionId);
  if (!q) return;

  const labels = ["ア", "イ", "ウ", "エ"];
  const expBox = document.getElementById("student-explanation-box");
  expBox.classList.remove("hidden");
  
  document.getElementById("student-correct-option").textContent = `正解: ${labels[q.answer]} (${q.options[q.answer]})`;
  document.getElementById("student-explanation-text").textContent = q.explanation;
}

// ==========================================
// 7. 講師側のロジック (操作 & 集計グラフ)
// ==========================================
document.getElementById("btn-start-quiz").addEventListener("click", async () => {
  const selectedQId = document.getElementById("admin-question-select").value;
  await db.collection("roomState").doc("current").set({
    status: "answering",
    currentQuestionId: selectedQId,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
});

document.getElementById("btn-show-result").addEventListener("click", async () => {
  await db.collection("roomState").doc("current").update({
    status: "showing_result",
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
});

document.getElementById("btn-reset-quiz").addEventListener("click", async () => {
  await db.collection("roomState").doc("current").update({
    status: "waiting",
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
});

// Chart.js の初期化
function initChart() {
  const ctx = document.getElementById("resultChart").getContext("2d");
  resultChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["ア", "イ", "ウ", "エ"],
      datasets: [{
        label: "回答者数",
        data: [0, 0, 0, 0],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)"
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)"
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// リアルタイム集計データの更新
function updateAdminStats(answers) {
  const total = answers.length;
  document.getElementById("admin-answer-count").textContent = total;

  if (total === 0) {
    document.getElementById("admin-correct-rate").textContent = "0%";
    if (resultChart) {
      resultChart.data.datasets[0].data = [0, 0, 0, 0];
      resultChart.update();
    }
    return;
  }

  const correctCount = answers.filter(a => a.isCorrect).length;
  const rate = Math.round((correctCount / total) * 100);
  document.getElementById("admin-correct-rate").textContent = `${rate}%`;

  // 選択肢ごとの集計 [ア, イ, ウ, エ]
  const counts = [0, 0, 0, 0];
  answers.forEach(a => {
    if (a.selectedOption >= 0 && a.selectedOption <= 3) {
      counts[a.selectedOption]++;
    }
  });

  if (resultChart) {
    resultChart.data.datasets[0].data = counts;
    resultChart.update();
  }
}
