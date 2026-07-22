チャットを PDF に変換
チャットを PDF に変換
このチャットを Acrobat で開く
Gemini との会話
ITパスポートの勉強会をしたいと思います。



アプリケーションとして過去問を学生にそれぞれ提示して回答してもらいます。

時間が来たら集計して、誤答がおおかった問題について解説したいと考えています。



これをおこなえるシステムを構築したい

ITパスポートの勉強会、素晴らしい取り組みですね！正解率や回答傾向がリアルタイムに可視化できれば、解説にしっかり時間を割くことができて非常に効果的な学習スタイルになります。

学生側はスマホやPCで手軽に解答でき、主催者側はリアルタイムに集計・分析できる環境を作るには、「既存の無料ツールを使う方法」と「自作で本格的なシステムを作る方法」の2つのアプローチがあります。

まずはそれぞれの概要と特徴を整理しました。

2つの構築アプローチ比較
アプローチ	メリット	デメリット / 注意点	おすすめのシチュエーション
① 既存ツール活用


(Kahoot! / Mentimeter など)

・開発不要ですぐ使える


・画面がおしゃれで盛り上がる


・リアルタイム集計機能が標準搭載

・ITパスポートの過去問（文章・画像）を入力する手間がある


・無料版だと参加人数制限がある場合も

・まずは試しに開催してみたい


・クイズ大会風に楽しく進行したい

② Google フォーム 活用	
・完全無料、人数無制限


・導入ハードルが最も低い


・解答データのCSV出力も簡単

・制限時間を設けて「一斉に締め切る」操作を手動で行う必要がある	
・コストを一切かけず、すぐに始めたい


・確実かつシンプルな運用にしたい

③ Webアプリ自作


(HTML/JS + Firebaseなど)

・デザインやタイマー制限などを完全自由化


・ITパスポートの過去問データをAPIやDBから取り込める

・プログラミングの知識と開発コストが必要	
・定期的に開催する予定がある


・自分の理想通りのUI/UXにこだわりたい

推薦プラン：どれを選ぶべき？
1. 手軽さ・イベント性を重視するなら：Kahoot! や Mentimeter
学生が自分のスマホからピンコードを入力して参加するタイプのクイズツールです。

特徴: 画面に「正答率」や「各選択肢の選ばれた割合」がグラフで一瞬で表示されるため、「どの問題でみんなが躓いたか」がひと目で分かります。

解説時の運用: 正解率が30%〜50%以下のような低正答率問題だけピックアップして解説画面に切り替える、といった進行がスムーズです。

2. コスト0で今すぐ安全にやるなら：Google フォーム + Google スプレッドシート
特徴: 選択式問題（ラジオボタン）で作れば、送信完了と同時に自動採点・正答率のグラフ表示が可能です。

解説時の運用: 「回答」タブを開くと、各設問の正答率（円グラフ）が表示されます。正解率の低い設問を上から順に見て解説する運用が簡単に組めます。

3. 本格的にオリジナルのシステムを作りたい場合（Webアプリ開発）
もしプログラミング（Python, Node.js, Reactなど）を学習中、または独自のシステムを組み上げたい場合は、以下のような構成が定番です。

フロントエンド（学生・講師画面）: React, Vue.js, またはシンプルなHTML/JavaScript

バックエンド / リアルタイムDB: Firebase (Firestore / Realtime Database) または Supabase

Firebaseを利用すると、学生の回答状況をWebSocket等でリアルタイムに講師画面へ反映・集計するのが非常に簡単に作れます。

過去問データ: 「ITパスポート試験 過去問」のオープンデータやCSVを手元で管理し、ランダムまたは指定した問題セットを配信する仕組みを作ります。

どのような方向性（「まずは既存ツールでサクッと試したい」「自作アプリを作ってみたい」など）で検討を進めたいかによって、より具体的な構成や具体的な手順をご案内できます。

次のステップとして、どれを深掘りしますか？

既存ツール（Kahoot!やGoogleフォーム）を使った具体手順を知りたい

Webアプリを自作するためのシステム構成やコード例を知りたい

Webアプリケーションとして作成したい

Webアプリケーションとして自作する方針ですね！

リアルタイムで「問題配信 → 解答 → 自動集計 → 低正答率問題の特定」を実現する場合、Firebase をバックエンドに採用した構成が最もスピーディで構築しやすいです。WebSocket（リアルタイム通信）の仕組みをゼロから作らなくても、Firebaseが自動で画面を同期してくれます。

構想するシステムの仕組み
作成するシステムは、大きく分けて2つの画面（モード）で構成します。

【主催者（講師）画面】                       【参加者（学生）画面】
┌─────────────────────────┐               ┌─────────────────────────┐
│ ・「試験開始」ボタン   │               │ ・問題文・選択肢の表示  │
│ ・タイマーカウントダウン│ ──(同期)───► │ ・解答を選択して送信    │
│ ・正答率のリアルタイムグラフ│               │ ・待ち時間画面          │
└─────────────────────────┘               └─────────────────────────┘
            │                                         │
            └───────────────► Firebase ◄──────────────┘
                       (Firestore Database)
おすすめの技術スタック
パート	推奨技術	選定理由
フロントエンド	
HTML / CSS / JavaScript


(または React / Vue.js)

複雑なフレームワークを使わなくても、まずはプレーンなJavaScriptだけで十分作成可能です。
バックエンド / DB	Firebase (Firestore Database)	完全無料枠内で運用可能。データベースの値が変わると、接続している全員の画面が瞬時に自動更新されます。
グラフ表示	Chart.js	学生の回答割合や正答率をリアルタイムに棒グラフ・円グラフで視覚化できます。
ホスティング	Firebase Hosting または Vercel	作成したWebアプリを無料でWeb上に公開できます。
データ構造の設計イメージ（Firestore）
データベース（Firestore）には、主に3つのコレクション（テーブルのようなもの）を用意します。

1. questions（過去問データ）
JSON
{
  "id": "q1",
  "text": "ストラテジ系：ITガバナンスの説明として最も適切なものはどれか。",
  "options": ["ア: ...", "イ: ...", "ウ: ...", "エ: ..."],
  "answer": 1  // 正解のインデックス（0:ア, 1:イ, 2:ウ, 3:エ）
}
2. roomState（勉強会の進行ステータス）
講師がボタンを押すとこのデータが書き換わり、学生の画面が自動で切り替わります。

JSON
{
  "status": "answering", // "waiting", "answering", "showing_result"
  "currentQuestionId": "q1",
  "timeLimit": 60 // 制限時間（秒）
}
3. answers（学生の回答データ）
JSON
{
  "studentName": "田中",
  "questionId": "q1",
  "selectedOption": 1, // 選んだ選択肢
  "isCorrect": true
}
実装の基本フロー
1
1. Firebaseのセットアップ
準備段階
Firebaseコンソールでプロジェクトを作成し、Firestoreデータベースを有効化します。提供される設定用コード（APIキーなど）をHTMLに貼り付けます。

2
2. 状態同期（Realtime Listener）の実装
フロントエンド
onSnapshot() 関数を使い、roomState を常時監視します。ステータスが answering に変化したら問題画面、showing_result に変化したら集計画面へと画面表示を切り替えます。

3
3. 回答送信と自動判定
学生側処理
学生が選択肢を選んで送信ボタンを押したら、正解判定を行い answers コレクションに書き込みます。

4
4. リアルタイム集計とグラフ表示
講師側処理
講師画面では answers の集計結果を Chart.js でレンダリングします。全員の提出状況や、ア・イ・ウ・エそれぞれの選択率、正解率がリアルタイムに伸びていくグラフを画面に表示します。


開発をスムーズに進めるためのアドバイス
過去問データの用意方法:
最初から何百問も登録するのは大変です。最初はCSVやJSON形式で10問程度手動で作ってDBにインポートし、動くプロトタイプ（試作品）を優先して作りましょう。

解説モードの作り方:
講師画面で「正解率の低い順に並び替える」ソート機能を1つ作っておくと、集計終了後に「上から順にボタンを押して解説画面へ進む」というスムーズな進行が可能です。

次にどの部分の実装イメージを確認しますか？

HTML/JSとFirebaseを使ったサンプルコードが見たい

過去問データの効率的な集め方や管理方法を知りたい

githubで作成したい

GitHubを使って開発・公開・管理を行うアプローチですね！

GitHubを活用すると、バージョン管理はもちろん、GitHub Pagesという無料機能を使って、サーバーを用意することなく作成したWebアプリをそのままインターネット上に公開できます。

以下に、GitHubを使った開発から公開、運用までの最短ステップと全体のイメージをまとめました。

全体構成イメージ
 [ローカル開発環境 / VS Code]
            │
            │ (git push)
            ▼
┌──────────────────────────────────────────────┐
│ GitHub リポジトリ                            │
│  ├─ index.html   (メイン画面/講師・学生切替) │
│  ├─ style.css    (デザイン)                 │
│  ├─ app.js       (Firebase連携・集計ロジック)│
│  └─ questions.js (問題データ)               │
└──────────────────────────────────────────────┘
            │
            │ (自動デプロイ)
            ▼
┌──────────────────────────────────────────────┐
│ GitHub Pages (無料でWebアプリとして公開)      │
│  └─ https://<ユーザー名>.github.io/<リポジトリ名>/ │
└──────────────────────────────────────────────┘
開発と公開の4ステップ
1
1. GitHubでリポジトリを作成
準備
GitHub上で新しいリポジトリ（例: it-passport-quiz）を新規作成します。ライセンスや.gitignoreの設定をしておきます。

2
2. ローカルでコードを作成（HTML/JS + Firebase）
実装
PC上でHTML、CSS、JavaScriptを作成します。バックエンドには前述の Firebase（無料枠）のSDKをJavaScript経由で読み込みます。

index.html: 学生用画面・講師用画面（クエリパラメータやURLで切り替え可能にすると管理がラクです）

app.js: 解答送信、正解判定、リアルタイム集計、Chart.jsによるグラフ表示

questions.json: ITパスポートの過去問データ

3
3. コードをGitHubへPush
管理
作成したファイルを git commit し、GitHubへ git push して最新コードをコミットします。

4
4. GitHub PagesでWeb上に無料公開
公開
リポジトリの設定（Settings > Pages）を開き、Branch: main を選択して保存します。数十秒で固有のURLが発行され、学生がスマホやPCからアクセスできるようになります。


実装のポイント（GitHub × 勉強会アプリ）
画面の切り替え方法:
1つのWebアプリ（リポジトリ）で、「学生用」と「講師用」の2つの画面を作るのが簡単です。

学生用URL: https://<ユーザー名>.github.io/it-passport-quiz/

講師用URL: https://<ユーザー名>.github.io/it-passport-quiz/admin.html

セキュリティ注意点 (Firebase APIキー):
Firebaseの設定情報（APIキーなど）をGitHubに上げる際、Firestore側のセキュリティルール（Security Rules）で「書き込み制限」や「ドメイン制限」を設定しておくと、安全に運用できます。

まず手始めに動くプロトタイプ（1問題だけ送信して集計グラフが出るコード）を作ってGitHubで公開してみるのが一番スムーズです。

次にどの作業から進めますか？

GitHub Pagesでそのまま動くHTML/JS/Firebaseのテンプレートコードが欲しい

1つのリポジトリで「学生画面」と「講師画面」を分けるファイル構成の例を知りたい

ライセンスや.gitignoreの設定をしておきます。

GitHubでリポジトリを作成する際の「ライセンス（License）」と「.gitignore」の設定ですね！

勉強会用アプリを作る際、具体的に何を選び、どう設定すれば良いかを解説します。

1. ライセンス（License）の選び方
ライセンスは「他の人がこのコードをどう使っていいか」のルールを決めるものです。勉強会用アプリやオープンソースとして共有する場合、以下のどちらかを選んでおけば間違いありません。

ライセンス	特徴	こんな場合におすすめ
MIT License (一番人気・推奨)	非常に自由。「著作権表示を残せば、商用利用・改変・再配布なんでもOK」という超寛容ライセンス。	
・特にこだわりがなく、誰でも自由に使えるようにしたい場合


・ポートフォリオとしてコードを公開したい場合

GNU General Public License v3.0 (GPLv3)	「このコードを改変して公開する場合は、そのコードも同じオープンソース（GPL）にしなければならない」というルール。	・自分のコードや勉強会システムを二次利用（派生）したアプリもオープンソースであり続けてほしい場合
なし (No License)	著作権が完全に自分に残る（デフォルト）。他の人はコードを見ることはできるが、複製・改変・使用する権利がない。	・個人利用だけで、他人に使わせる予定がない場合
💡 迷ったら「MIT License」を選んでおけば間違いありません。

2. .gitignore の設定
.gitignore は、「GitHubにアップロード（コミット）したくないファイルやフォルダ」を事前に指定するための設定ファイルです。

Webアプリ開発（HTML/JS/Firebase）において、GitHubに上げたくない（上げるべきでない）ものは主に以下の通りです。

環境依存ファイルやログ（.DS_Store や *.log など）

ローカルテスト用の設定ファイルや機密情報

（Node.js等を使う場合）node_modules/ フォルダ

おすすめの .gitignore 設定例
リポジトリ直下に .gitignore という名前のファイルを作成し、中身を以下のように記述します。

コード スニペット
# 依存ライブラリ（Node.js等を使う場合）
node_modules/
dist/
build/

# OSが自動生成する隠しファイル（Mac / Windows）
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# エディタ・IDEの設定
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea/

# ログファイル
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 環境変数・ローカル設定（機密情報を含む可能性があるファイル）
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
リポジトリ作成時のGitHub画面での操作手順
GitHubで New repository ボタンを押した際、画面下部で次のようにチェックを入れて選択するだけで完了します。

Add a .gitignore file: トグルをONにして、テンプレートから Node（または Web）を選択

Choose a license: トグルをONにして、MIT License を選択

これで準備万端です！リポジトリが作成されたら、ローカルに git clone して開発を始められます。

準備が整ったら、次はどの作業に進みますか？

クローンの手順からHTML/JSの初期ファイル作成手順が知りたい

Firebaseの登録と初期設定のやり方を知りたい

MIT License

MIT License の選択、素晴らしいですね！最もシンプルで広く使われているライセンスなので、今後の保守やコード共有においても非常に扱いやすくなります。

GitHubでリポジトリを作成すると、直下に LICENSE というファイルが自動生成され、中身は以下のような文章になります。

Plaintext
MIT License

Copyright (c) 2026 [Your Name / 著作権者名]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
ポイント:
年号（2026）や [Your Name] の部分は、GitHub上で自動入力されるか、手動で自分の名前/ハンドルネームに変更すればOKです。

これでGitHub側の初期準備（リポジトリ作成、.gitignore、MIT License）のイメージが固まりましたね。

次に進むステップを選んでください：

1. ローカルへのgit cloneと初期フォルダ作成

2. Firebaseの登録・初期設定手順

3. 学生用・講師用画面のコード例を作成

index.html: 学生用画面・講師用画面（クエリパラメータやURLで切り替え可能にすると管理がラクです）

app.js: 解答送信、正解判定、リアルタイム集計、Chart.jsによるグラフ表示

questions.json: ITパスポートの過去問データ

ITパスポート勉強会用のWebアプリケーション（index.html・app.js・questions.json）を作成しました。

ご提示いただいたアイデア通り、1つのファイル群でクエリパラメータ（?mode=admin）によって学生用画面と講師用画面が自動で切り替わる設計になっています。

生成ファイル
index.html: 
HTML のアイコン
index
 HTML 
開く

学生モード: 参加登録、リアルタイム問題表示、選択肢ボタン、送信完了状態、解説確認エリア

講師モード: 回答数/正答率リアルタイム集計パネル、問題切り替えドロップダウン、回答受付/締め切り/待機コントロールボタン、Chart.js連携グラフエリア

app.js: 
JS のアイコン
app
 JS 
開く

Firebase Firestore連携: roomState のリアルタイム監視（onSnapshot）により、講師が画面操作をすると学生の画面も一斉に同期切り替え

自動集計 & グラフ化: 学生から送信された回答データをリアルタイム集計し、選択肢ごとの回答割合を Chart.js の棒グラフに自動描画

questions.json: 
JSON のアイコン
questions
 JSON 
開く

ITパスポートの過去問（ストラテジ系、マネジメント系、テクノロジ系）のサンプルデータと正解・解説データ

ディレクトリ構造と運用イメージ
リポジトリ直下に以下の構造でファイルを配置します。

Plaintext
it-passport-quiz/
├── LICENSE          (MIT License)
├── .gitignore
├── index.html       (メイン画面)
├── app.js           (システムロジック & Firebase連携)
└── questions.json   (過去問データ)
URLアクセス例（GitHub Pages公開後）
学生用URL: https://<ユーザー名>.github.io/<リポジトリ名>/

講師用URL: https://<ユーザー名>.github.io/<リポジトリ名>/?mode=admin

セットアップ・動作テストの3ステップ
Firebaseの設定情報を登録
app.js の先頭にある firebaseConfig オブジェクトを、ご自身の Firebase コンソールで取得した API キー等に書き換えます。

JavaScript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ...
};
GitHubへコミット＆Push
作成したファイルをリポジトリへ push します。

GitHub Pagesの有効化
GitHubリポジトリの Settings > Pages で Source を Deploy from a branch にし、main ブランチを指定して保存します。発行されたURLから勉強会を開始できます。




北陸大学 のチャットはモデルのトレーニングには使用されません。Gemini は AI であり、間違えることがあります。プライバシーと Gemini新しいウィンドウで開く

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
app.js
「app.js」を表示しています。
