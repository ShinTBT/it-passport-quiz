// ==========================================
// 1. Firebase 初期化設定
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCAbnmoilRTxVaAt1QyH62LMUPD9U_siJU",
  authDomain: "it-passport-quiz-7f8d3.firebaseapp.com",
  projectId: "it-passport-quiz-7f8d3",
  storageBucket: "it-passport-quiz-7f8d3.firebasestorage.app",
  messagingSenderId: "987503473765",
  appId: "1:987503473765:web:f5c4c27992547cce0bc28c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let questions = [];
let currentQIndex = 0;
let userAnswers = {}; // { q1: 0, q2: 2, ... }
let timeLeft = 3600; // 60分 (3600秒)
let timerInterval = null;
let userName = "";
let isExamActive = true; // 現在の回答受付状態
let logoutUnsubscribe = null; // 強制ログアウト監視用リスナー
const isAdmin = window.location.search.includes('mode=admin');

// ==========================================
// 2. ランダム抽出ロジック（比率維持）
// ==========================================
function selectRandomQuestions(allQuestions) {
  const strategy = allQuestions.filter(q => q.category === 'ストラテジ系');
  const management = allQuestions.filter(q => q.category === 'マネジメント系');
  const technology = allQuestions.filter(q => q.category === 'テクノロジ系');

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  const selectedStrategy = shuffle(strategy).slice(0, 35);
  const selectedManagement = shuffle(management).slice(0, 15);
  const selectedTechnology = shuffle(technology).slice(0, 50);

  const selectedAll = [...selectedStrategy, ...selectedManagement, ...selectedTechnology];
  return shuffle(selectedAll);
}

// 画面読み込み時の初期化
window.onload = async () => {
  try {
    const res = await fetch('questions.json');
    if (!res.ok) throw new Error('questions.json の読み込みに失敗しました');
    const allQuestions = await res.json();
    
    // ★修正ポイント1: JSON側に id が存在しない場合でも確実にマッチするように自動補完
    const formattedQuestions = allQuestions.map((q, idx) => ({
      id: q.id !== undefined ? String(q.id) : `q_${idx + 1}`,
      ...q
    }));

    questions = selectRandomQuestions(formattedQuestions);
  } catch (e) {
    console.error(e);
    alert('【エラー】問題データの読み込みに失敗しました。');
  }

  if (isAdmin) {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('admin-view').style.display = 'block';
    initAdminMonitor();
  } else {
    listenBroadcast();
    listenExamStatus(); // 回答受付状態のリアルタイム監視
  }
};

// --- 学生用処理 ---

// 講師からの「回答受付ステータス」をリアルタイム監視
function listenExamStatus() {
  db.collection('control').doc('status').onSnapshot(doc => {
    if (doc.exists) {
      const data = doc.data();
      isExamActive = data.isAccepting;

      const startBtn = document.getElementById('start-btn');
      const statusMsg = document.getElementById('status-message');

      if (!isExamActive) {
        if (startBtn) startBtn.disabled = true;
        if (statusMsg) statusMsg.innerText = "現在、教員により回答受付が停止されています。";

        // 試験中の場合は自動送信して終了
        if (document.getElementById('exam-view').style.display === 'block') {
          alert('教員により回答受付が打ち切られました。現在の状態のまま回答を自動送信します。');
          submitExam(true);
        }
      } else {
        if (startBtn) startBtn.disabled = false;
        if (statusMsg) statusMsg.innerText = "";
      }
    }
  });
}

function startExam() {
  if (!isExamActive) {
    return alert('現在、回答の受付は停止されています。');
  }

  const nameInput = document.getElementById('student-name').value.trim();
  if (!nameInput) return alert('お名前を入力してください');
  
  if (!questions || questions.length === 0) {
    return alert('問題データが正しく読み込まれていません。');
  }

  userName = nameInput;

  document.getElementById('login-view').style.display = 'none';
  document.getElementById('exam-view').style.display = 'block';

  // 教員からの強制ログアウト要求を監視開始
  listenForForceLogout(userName);

  showQuestion(0);
  startTimer();
}

// 講師からの強制ログアウト監視
function listenForForceLogout(name) {
  if (logoutUnsubscribe) logoutUnsubscribe();

  logoutUnsubscribe = db.collection('logout_requests').doc(name).onSnapshot(doc => {
    if (doc.exists) {
      alert('教員によってログアウト（データの削除）が行われました。初期画面に戻ります。');
      db.collection('logout_requests').doc(name).delete();
      studentLogout(false);
    }
  });
}

// 学生側ログアウト処理（手動・自動兼用）
function studentLogout(isManual = true) {
  if (isManual && !confirm('ログアウトして初期画面に戻りますか？（進行中の回答は破棄されます）')) {
    return;
  }

  if (timerInterval) clearInterval(timerInterval);

  if (logoutUnsubscribe) {
    logoutUnsubscribe();
    logoutUnsubscribe = null;
  }

  userName = "";
  userAnswers = {};
  currentQIndex = 0;
  timeLeft = 3600;

  document.getElementById('exam-view').style.display = 'none';
  document.getElementById('result-view').style.display = 'none';
  if (document.getElementById('student-explanation')) {
    document.getElementById('student-explanation').innerHTML = '';
  }
  document.getElementById('login-view').style.display = 'block';
  document.getElementById('student-name').value = '';
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('timer').innerText = `残り時間: ${m}:${s}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert('制限時間（60分）が終了しました。回答を自動送信します。');
      submitExam(true);
    }
  }, 1000);
}

function showQuestion(index) {
  currentQIndex = index;
  const q = questions[index];
  document.getElementById('q-number').innerText = `問題 ${index + 1} / ${questions.length} [${q.category || ''}]`;
  document.getElementById('q-text').innerText = q.question;

  const container = document.getElementById('options-container');
  container.innerHTML = '';

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = `option-btn ${userAnswers[q.id] === idx ? 'selected' : ''}`;
    btn.innerText = `${['ア', 'イ', 'ウ', 'エ'][idx]}. ${opt}`;
    btn.onclick = () => {
      userAnswers[q.id] = idx;
      showQuestion(index);
    };
    container.appendChild(btn);
  });

  document.getElementById('prev-btn').disabled = (index === 0);
  document.getElementById('next-btn').disabled = (index === questions.length - 1);
}

function changeQuestion(dir) {
  const newIndex = currentQIndex + dir;
  if (newIndex >= 0 && newIndex < questions.length) {
    showQuestion(newIndex);
  }
}

async function submitExam(isAuto) {
  if (!isAuto && !confirm('回答を送信して試験を終了しますか？')) return;
  clearInterval(timerInterval);

  await db.collection('submissions').doc(userName).set({
    studentName: userName,
    answers: userAnswers,
    submittedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('timer').style.display = 'none';
  document.getElementById('result-view').style.display = 'block';
}

// 講師からの解説一斉切替をリアルタイム受信
function listenBroadcast() {
  db.collection('control').doc('currentView').onSnapshot(doc => {
    if (doc.exists) {
      const data = doc.data();
      if (data && data.activeQId) {
        // 問題IDが一致するものを検索（文字列として比較）
        const q = questions.find(item => String(item.id) === String(data.activeQId));
        if (q) {
          const expBox = document.getElementById('student-explanation');
          if (expBox) {
            expBox.innerHTML = `
              <div class="explanation-box">
                <h3>【解説モード】問題 ${questions.indexOf(q) + 1} (${q.category || ''})</h3>
                <p><strong>問題:</strong> ${q.question}</p>
                <p><strong>正解:</strong> ${['ア', 'イ', 'ウ', 'エ'][q.answer]}. ${q.options[q.answer]}</p>
                <p><strong>解説:</strong> ${q.explanation || '解説はありません。'}</p>
              </div>
            `;
          }

          // ★修正ポイント2: 画面切り替えの確実な実行
          // 解答中・回答送信後どの状態でも解説表示枠が見える状態にする
          const examView = document.getElementById('exam-view');
          const resultView = document.getElementById('result-view');
          
          if (examView) examView.style.display = 'block';
          if (resultView) resultView.style.display = 'block';

          // 解説を画面上部にスムーズスクロール表示させる
          expBox.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  });
}

// --- 講師用処理 (モニタリング・受付切り替え・強制ログアウト) ---

function initAdminMonitor() {
  // 受付ステータスボタンの初期表示制御
  db.collection('control').doc('status').onSnapshot(doc => {
    const statusBtn = document.getElementById('toggle-accept-btn');
    if (statusBtn) {
      if (doc.exists && doc.data().isAccepting === false) {
        statusBtn.innerText = "回答受付を再開する";
        statusBtn.style.backgroundColor = "#28a745";
      } else {
        statusBtn.innerText = "回答受付を打ち切る（停止）";
        statusBtn.style.backgroundColor = "#dc3545";
      }
    }
  });

  // 提出一覧・集計・学生一覧のリアルタイム更新
  db.collection('submissions').onSnapshot(snapshot => {
    const docs = snapshot.docs.map(doc => doc.data());
    document.getElementById('submitted-count').innerText = docs.length;

    renderStudentList(docs);

    if (docs.length === 0) {
      document.getElementById('ranking-list').innerHTML = '';
      return;
    }

    const stats = questions.map(q => {
      let correctCount = 0;
      docs.forEach(doc => {
        if (doc.answers && doc.answers[q.id] === q.answer) {
          correctCount++;
        }
      });
      const rate = Math.round((correctCount / docs.length) * 100);
      return { ...q, rate, correctCount };
    });

    stats.sort((a, b) => a.rate - b.rate);

    const listContainer = document.getElementById('ranking-list');
    listContainer.innerHTML = '';

    stats.forEach(q => {
      const item = document.createElement('div');
      item.className = 'question-list-item';
      
      let badgeClass = 'badge-danger';
      if (q.rate >= 70) badgeClass = 'badge-success';
      else if (q.rate >= 40) badgeClass = 'badge-warning';

      item.innerHTML = `
        <div>
          <strong>[${q.category}] 問題 ${questions.indexOf(q) + 1}:</strong> ${q.question.substring(0, 30)}...
        </div>
        <div>
          <span class="badge ${badgeClass}">正答率: ${q.rate}% (${q.correctCount}/${docs.length}人)</span>
        </div>
      `;
      item.onclick = () => broadcastExplanation(q.id);
      listContainer.appendChild(item);
    });
  });
}

// 教員画面に提出中の学生一覧を描画
function renderStudentList(students) {
  const container = document.getElementById('student-manage-list');
  if (!container) return;

  container.innerHTML = '<h3>参加・提出済学生一覧（管理操作）</h3>';

  if (students.length === 0) {
    container.innerHTML += '<p style="color: #666;">現在データはありません。</p>';
    return;
  }

  const ul = document.createElement('ul');
  ul.style.listStyle = 'none';
  ul.style.padding = '0';

  students.forEach(s => {
    const li = document.createElement('li');
    li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #ddd;';
    li.innerHTML = `
      <span><strong>${s.studentName}</strong></span>
      <button style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
        データ削除＆ログアウト
      </button>
    `;

    li.querySelector('button').onclick = () => forceLogoutStudent(s.studentName);
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

// 教員から特定の学生を強制ログアウト＆データ削除
async function forceLogoutStudent(targetName) {
  if (!confirm(`学生「${targetName}」の提出データを削除し、ログアウトさせますか？`)) {
    return;
  }

  // 1. 該当学生の提出データを削除
  await db.collection('submissions').doc(targetName).delete();

  // 2. 強制ログアウト信号を送信
  await db.collection('logout_requests').doc(targetName).set({
    requestedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert(`「${targetName}」のデータを削除し、ログアウト処理を実行しました。`);
}

// 教員側での回答受付 / 停止切り替え処理
async function toggleAcceptance() {
  const statusRef = db.collection('control').doc('status');
  const doc = await statusRef.get();
  
  let currentStatus = true;
  if (doc.exists && doc.data().isAccepting !== undefined) {
    currentStatus = doc.data().isAccepting;
  }

  const newStatus = !currentStatus;
  const actionText = newStatus ? "再開" : "停止（打ち切り）";

  if (confirm(`回答の受付を【${actionText}】しますか？`)) {
    await statusRef.set({
      isAccepting: newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert(`回答受付を${actionText}しました。`);
  }
}

async function broadcastExplanation(qId) {
  await db.collection('control').doc('currentView').set({
    activeQId: qId,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  alert('全学生の画面を解説モードに切り替えました。');
}
