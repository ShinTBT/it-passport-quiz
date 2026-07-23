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
const isAdmin = window.location.search.includes('mode=admin');

// ==========================================
// 2. ランダム抽出ロジック（比率維持）
// ==========================================
function selectRandomQuestions(allQuestions) {
  // カテゴリごとに分類
  const strategy = allQuestions.filter(q => q.category === 'ストラテジ系');
  const management = allQuestions.filter(q => q.category === 'マネジメント系');
  const technology = allQuestions.filter(q => q.category === 'テクノロジ系');

  // 配列シャッフル用関数
  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  // 本番の比率（ストラテジ35問, マネジメント15問, テクノロジ50問）で抽出
  // ※プール内の問題数が足りない場合は、存在する全数を出力します
  const selectedStrategy = shuffle(strategy).slice(0, 35);
  const selectedManagement = shuffle(management).slice(0, 15);
  const selectedTechnology = shuffle(technology).slice(0, 50);

  // 抽出した100問を合体させ、さらに順序をシャッフル
  const selectedAll = [...selectedStrategy, ...selectedManagement, ...selectedTechnology];
  return shuffle(selectedAll);
}

// 画面読み込み時の初期化
window.onload = async () => {
  try {
    const res = await fetch('questions.json');
    if (!res.ok) throw new Error('questions.json の読み込みに失敗しました');
    const allQuestions = await res.json();

    // 100問以上のプールから比率通りに100問を自動抽出
    questions = selectRandomQuestions(allQuestions);
  } catch (e) {
    console.error(e);
    alert('【エラー】問題データの読み込みに失敗しました。');
  }

  if (isAdmin) {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('admin-view').style.display = 'block';
    initAdminMonitor();
  } else {
    listenBroadcast(); // 講師からの解説指示を待機
  }
};

// --- 学生用処理 ---

function startExam() {
  const nameInput = document.getElementById('student-name').value.trim();
  if (!nameInput) return alert('お名前を入力してください');
  
  if (!questions || questions.length === 0) {
    return alert('問題データが正しく読み込まれていません。');
  }

  userName = nameInput;

  document.getElementById('login-view').style.display = 'none';
  document.getElementById('exam-view').style.display = 'block';

  showQuestion(0);
  startTimer();
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
      showQuestion(index); // 再描画して選択状態を反映
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

  // Firestoreへ回答を保存
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
        const q = questions.find(item => item.id === data.activeQId);
        if (q) {
          const expBox = document.getElementById('student-explanation');
          expBox.innerHTML = `
            <div class="explanation-box">
              <h3>【解説モード】問題 ${questions.indexOf(q) + 1} (${q.category})</h3>
              <p><strong>問題:</strong> ${q.question}</p>
              <p><strong>正解:</strong> ${['ア', 'イ', 'ウ', 'エ'][q.answer]}. ${q.options[q.answer]}</p>
              <p><strong>解説:</strong> ${q.explanation}</p>
            </div>
          `;
        }
      }
    }
  });
}

// --- 講師用処理 (低正答率集計 & 指示) ---

function initAdminMonitor() {
  db.collection('submissions').onSnapshot(snapshot => {
    const docs = snapshot.docs.map(doc => doc.data());
    document.getElementById('submitted-count').innerText = docs.length;

    if (docs.length === 0) return;

    // 問題ごとの正解数を集計
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

    // 正答率の低順（昇順）に並び替え
    stats.sort((a, b) => a.rate - b.rate);

    // ランキング描画
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
      // クリックしたら全学生にその解説を表示させる命令を発行
      item.onclick = () => broadcastExplanation(q.id);
      listContainer.appendChild(item);
    });
  });
}

async function broadcastExplanation(qId) {
  await db.collection('control').doc('currentView').set({
    activeQId: qId,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  alert('全学生の画面を解説モードに切り替えました。');
}
