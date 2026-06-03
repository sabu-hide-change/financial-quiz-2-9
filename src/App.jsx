// npm install lucide-react recharts firebase
import React, { useState, useEffect, useCallback } from "react";
import {
  Check,
  X,
  Home,
  ChevronRight,
  RefreshCw,
  BarChart2,
  BookOpen,
  User,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// ===================================================================
// Firebase設定（APIキー等は環境変数から読み込み。直書き厳禁）
// ===================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// データ分離用のアプリ識別子（他問題集と混ざらないように）
const APP_ID = "QuizApp_Capital_And_Cost_2_9";

// Firebase初期化（多重初期化やエラーでクラッシュしないよう防衛的に）
let app = null;
let auth = null;
let db = null;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("[Firebase] 初期化に失敗しました:", e);
}

const SOURCE = "スマート問題集 2-9";
const CHOICE_LABELS = ["ア", "イ", "ウ", "エ", "オ"];

// カテゴリ（問題集の2大カテゴリ）
const CAT_VALUE = "企業価値評価";
const CAT_DERIV = "デリバティブ";

// ===================================================================
// 図表（インラインSVG / テーブルで100%内製化）
// ===================================================================

// 問題5：M社の資産・負債（簿価/時価）
const FigureM = () => (
  <div className="my-4 flex justify-center">
    <table className="border-collapse text-sm md:text-base">
      <thead>
        <tr>
          <th className="w-28 border border-gray-400 bg-orange-50 px-4 py-2"></th>
          <th className="border border-gray-400 bg-orange-100 px-4 py-2 tracking-widest">
            資　産
          </th>
          <th className="border border-gray-400 bg-orange-100 px-4 py-2 tracking-widest">
            負　債
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-gray-400 bg-orange-50 px-4 py-2 text-center">
            帳簿価額
          </td>
          <td className="border border-gray-400 px-4 py-2 text-right">
            5,000万円
          </td>
          <td className="border border-gray-400 px-4 py-2 text-right">
            2,000万円
          </td>
        </tr>
        <tr>
          <td className="border border-gray-400 bg-orange-50 px-4 py-2 text-center tracking-widest">
            時　価
          </td>
          <td className="border border-gray-400 px-4 py-2 text-right">
            6,000万円
          </td>
          <td className="border border-gray-400 px-4 py-2 text-right">
            2,000万円
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

// 問題10：P社の資料
const FigureP = () => {
  const rows = [
    ["売　上　高", "2億円"],
    ["税引後当期利益", "1,000万円"],
    ["当期支払配当総額", "100万円"],
    ["純　資　産　額", "1億円"],
    ["発行済株式数", "10万株"],
    ["株　　　価", "1,500円"],
  ];
  return (
    <div className="my-4 flex justify-center">
      <table className="border-collapse text-sm md:text-base">
        <tbody>
          {rows?.map((r, i) => (
            <tr key={i}>
              <td className="border border-gray-400 bg-orange-100 px-4 py-2 tracking-wide">
                {r?.[0]}
              </td>
              <td className="border border-gray-400 px-6 py-2 text-right">
                {r?.[1]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 問題11：Q社の資料
const FigureQ = () => (
  <div className="my-4 flex justify-center">
    <table className="border-collapse text-sm md:text-base">
      <thead>
        <tr>
          <th className="border border-gray-400 bg-orange-100 px-4 py-2">
            株価純資産倍率
            <br />
            （PBR）
          </th>
          <th className="border border-gray-400 bg-orange-100 px-4 py-2">
            配当性向
          </th>
          <th className="border border-gray-400 bg-orange-100 px-4 py-2">
            自己資本利益率
            <br />
            （ROE）
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-gray-400 px-4 py-2 text-center">
            2.5倍
          </td>
          <td className="border border-gray-400 px-4 py-2 text-center">50％</td>
          <td className="border border-gray-400 px-4 py-2 text-center">10％</td>
        </tr>
      </tbody>
    </table>
  </div>
);

// 問題12：為替予約の損益図（インラインSVG）
const FigureForward = () => (
  <div className="my-4 flex justify-center">
    <svg viewBox="0 0 480 360" className="w-full max-w-md" role="img">
      <text x="60" y="24" fontSize="14" fill="#111">
        1ユーロあたりの損益
      </text>
      {/* 縦軸 */}
      <line x1="200" y1="40" x2="200" y2="320" stroke="#000" strokeWidth="2" />
      <polygon points="200,36 195,48 205,48" fill="#000" />
      {/* 横軸 */}
      <line x1="60" y1="200" x2="440" y2="200" stroke="#000" strokeWidth="2" />
      <polygon points="444,200 432,195 432,205" fill="#000" />
      <polygon points="60,200 72,195 72,205" fill="#000" />
      {/* ラベル */}
      <text x="120" y="120" fontSize="13" fill="#111">
        （利益）
      </text>
      <text x="120" y="300" fontSize="13" fill="#111">
        （損失）
      </text>
      <text x="8" y="196" fontSize="13" fill="#111">
        為替相場
      </text>
      <text x="120" y="196" fontSize="13" fill="#111">
        円高
      </text>
      <text x="400" y="196" fontSize="13" fill="#111">
        円安
      </text>
      <text x="250" y="70" fontSize="12" fill="#111">
        為替予約価格
      </text>
      <text x="250" y="86" fontSize="12" fill="#111">
        100円／ユーロ
      </text>
      <line x1="270" y1="92" x2="270" y2="195" stroke="#000" strokeWidth="1" />
      <polygon points="270,200 265,188 275,188" fill="#000" />
      {/* ①青実線：R社（右上がり） */}
      <line
        x1="120"
        y1="300"
        x2="420"
        y2="100"
        stroke="#1d4ed8"
        strokeWidth="4"
      />
      <text x="425" y="100" fontSize="16" fill="#1d4ed8">
        ①
      </text>
      {/* ②赤点線：X銀行（右下がり） */}
      <line
        x1="120"
        y1="100"
        x2="420"
        y2="300"
        stroke="#dc2626"
        strokeWidth="4"
        strokeDasharray="8 6"
      />
      <text x="425" y="306" fontSize="16" fill="#dc2626">
        ②
      </text>
    </svg>
  </div>
);

// 問題15：プット・オプションの損益図（インラインSVG）
const FigurePut = () => (
  <div className="my-4 flex justify-center">
    <svg viewBox="0 0 500 370" className="w-full max-w-md" role="img">
      <text x="70" y="24" fontSize="14" fill="#111">
        1ユーロあたりの損益
      </text>
      {/* 縦軸 */}
      <line x1="190" y1="40" x2="190" y2="330" stroke="#000" strokeWidth="2" />
      <polygon points="190,36 185,48 195,48" fill="#000" />
      {/* 横軸 */}
      <line x1="40" y1="190" x2="470" y2="190" stroke="#000" strokeWidth="2" />
      <polygon points="474,190 462,185 462,195" fill="#000" />
      <polygon points="40,190 52,185 52,195" fill="#000" />
      <text x="105" y="120" fontSize="13" fill="#111">
        （利益）
      </text>
      <text x="105" y="300" fontSize="13" fill="#111">
        （損失）
      </text>
      <text x="20" y="186" fontSize="13" fill="#111">
        為替相場
      </text>
      <text x="150" y="186" fontSize="13" fill="#111">
        円高
      </text>
      <text x="430" y="186" fontSize="13" fill="#111">
        円安
      </text>
      {/* 権利行使価格の注記 */}
      <text x="225" y="350" fontSize="12" fill="#111">
        権利行使価格
      </text>
      <text x="225" y="366" fontSize="12" fill="#111">
        100円／ユーロ
      </text>
      <line x1="300" y1="190" x2="285" y2="335" stroke="#000" strokeWidth="1" />
      {/* ①青実線：Y銀行（右上がり→頭打ちフラット） */}
      <polyline
        points="120,300 300,150 460,150"
        fill="none"
        stroke="#1d4ed8"
        strokeWidth="4"
      />
      <text x="465" y="152" fontSize="16" fill="#1d4ed8">
        ①
      </text>
      {/* ②赤点線：S社（左で利益上限→右下がり→下限フラット） */}
      <polyline
        points="120,130 300,230 460,230"
        fill="none"
        stroke="#dc2626"
        strokeWidth="4"
        strokeDasharray="8 6"
      />
      <text x="465" y="234" fontSize="16" fill="#dc2626">
        ②
      </text>
    </svg>
  </div>
);

// 問題15解説：オプション取引まとめ表
const FigureOptionTable = () => (
  <div className="my-4 flex justify-center">
    <table className="border-collapse text-sm md:text-base">
      <thead>
        <tr>
          <th className="w-24 border border-gray-400 bg-orange-50 px-4 py-2"></th>
          <th className="border border-gray-400 bg-orange-100 px-6 py-2 tracking-widest">
            買　い
          </th>
          <th className="border border-gray-400 bg-orange-100 px-6 py-2 tracking-widest">
            売　り
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-gray-400 bg-orange-50 px-4 py-2 text-center tracking-widest">
            利　益
          </td>
          <td className="border border-gray-400 px-4 py-2 text-center tracking-widest">
            無　限
          </td>
          <td className="border border-gray-400 px-4 py-2 text-center">
            オプション料を限度
          </td>
        </tr>
        <tr>
          <td className="border border-gray-400 bg-orange-50 px-4 py-2 text-center tracking-widest">
            損　失
          </td>
          <td className="border border-gray-400 px-4 py-2 text-center">
            オプション料を限度
          </td>
          <td className="border border-gray-400 px-4 py-2 text-center tracking-widest">
            無　限
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

// 問題16（問題文）：コールオプションの価値の図（インラインSVG）
const FigureCall = () => (
  <div className="my-4 flex justify-center">
    <svg viewBox="0 0 500 320" className="w-full max-w-md" role="img">
      {/* 縦軸 */}
      <line x1="80" y1="20" x2="80" y2="280" stroke="#000" strokeWidth="2" />
      <polygon points="80,16 75,28 85,28" fill="#000" />
      {/* 横軸 */}
      <line x1="80" y1="280" x2="480" y2="280" stroke="#000" strokeWidth="2" />
      <polygon points="484,280 472,275 472,285" fill="#000" />
      <text x="14" y="120" fontSize="14" fill="#111">
        プレ
      </text>
      <text x="14" y="138" fontSize="14" fill="#111">
        ミア
      </text>
      <text x="14" y="156" fontSize="14" fill="#111">
        ム
      </text>
      {/* プレミアム曲線（本質的価値＋時間的価値） */}
      <path
        d="M90,272 Q230,265 270,235 Q330,180 470,40"
        fill="none"
        stroke="#1e3a8a"
        strokeWidth="4"
      />
      {/* 本質的価値（権利行使価格から右上がりの直線） */}
      <line
        x1="270"
        y1="280"
        x2="470"
        y2="55"
        stroke="#93c5fd"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      {/* 権利行使価格の縦補助線 */}
      <line
        x1="270"
        y1="235"
        x2="270"
        y2="280"
        stroke="#93c5fd"
        strokeWidth="1"
      />
      <text x="225" y="305" fontSize="13" fill="#111">
        権利行使価格
      </text>
      <text x="395" y="305" fontSize="13" fill="#111">
        原資産価格
      </text>
    </svg>
  </div>
);

// 問題16（解説）：コールの本質的価値と時間的価値
const FigureCallValue = () => (
  <div className="my-4 flex justify-center">
    <svg viewBox="0 0 520 340" className="w-full max-w-md" role="img">
      <text x="120" y="22" fontSize="14" fill="#111" fontWeight="bold">
        コールの本質的価値と時間的価値
      </text>
      <line x1="80" y1="40" x2="80" y2="300" stroke="#000" strokeWidth="2" />
      <polygon points="80,36 75,48 85,48" fill="#000" />
      <line x1="80" y1="300" x2="500" y2="300" stroke="#000" strokeWidth="2" />
      <polygon points="504,300 492,295 492,305" fill="#000" />
      <text x="14" y="120" fontSize="13" fill="#111">
        プレ
      </text>
      <text x="14" y="138" fontSize="13" fill="#111">
        ミア
      </text>
      <text x="14" y="156" fontSize="13" fill="#111">
        ム
      </text>
      {/* プレミアム（コール）曲線 */}
      <path
        d="M90,292 Q240,285 280,255 Q340,195 490,55"
        fill="none"
        stroke="#1e3a8a"
        strokeWidth="4"
      />
      {/* 本質的価値の直線 */}
      <line
        x1="280"
        y1="300"
        x2="490"
        y2="70"
        stroke="#93c5fd"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <line
        x1="280"
        y1="255"
        x2="280"
        y2="300"
        stroke="#93c5fd"
        strokeWidth="1"
      />
      <text x="150" y="120" fontSize="12" fill="#111">
        プレミアム（コール）
      </text>
      <line x1="215" y1="128" x2="270" y2="235" stroke="#000" strokeWidth="1" />
      <text x="395" y="175" fontSize="12" fill="#111">
        本質的価値
      </text>
      <line x1="430" y1="180" x2="440" y2="150" stroke="#000" strokeWidth="1" />
      <text x="370" y="250" fontSize="12" fill="#111">
        時間的価値
      </text>
      <line x1="368" y1="245" x2="320" y2="255" stroke="#000" strokeWidth="1" />
      <text x="235" y="325" fontSize="13" fill="#111">
        権利行使価格
      </text>
      <text x="410" y="325" fontSize="13" fill="#111">
        原資産価格
      </text>
    </svg>
  </div>
);

const FIGURES = {
  M: FigureM,
  P: FigureP,
  Q: FigureQ,
  forward: FigureForward,
  put: FigurePut,
  optionTable: FigureOptionTable,
  call: FigureCall,
  callValue: FigureCallValue,
};

// ===================================================================
// 問題データ（ノンカット収録：問題文・選択肢・正解・解説をフルテキストで格納）
// answerは0始まりのインデックス（0=ア,1=イ,2=ウ,3=エ,4=オ）
// ===================================================================
const QUESTIONS = [
  {
    id: 1,
    category: CAT_VALUE,
    title: "ゼロ成長モデル",
    question:
      "次の資料は、I社に関するものである。この資料に基づいた場合、I社の企業価値として、最も適切なものを下記の解答群から選べ。",
    shiryo: [
      "１．I社が毎年得られるフリー・キャッシュ・フローは、1,000万円と予測されている。",
      "２．資本コストは、10％である。",
      "３．企業価値は、DCF法により計算する。",
    ],
    choices: ["1,100万円", "1億円", "1億1,000万円", "2億円", "3億円"],
    answer: 1,
    juyou: `本問では、ゼロ成長モデルについて問われています。
企業価値は、企業全体の価値を金額で表したものです。
企業価値の評価方法の一つに、DCF法があります。

●DCF法（Discount Cash Flow Method）
　企業が将来生み出すキャッシュ・フローを、現在価値に割引いて、企業価値を計算する

●ゼロ成長モデル（将来のフリー・キャッシュ・フローが毎年同じ場合のモデル）
〈数　式〉
　企業価値 ＝ FCF ÷ r
　FCF：将来のフリー・キャッシュ・フロー
　r：資本コスト

フリー・キャッシュ・フローを求める計算式、加重平均資本コストを求める計算式についても復習しておきましょう。`,
    seikai: `正解：イ　1億円
I社の企業価値は、DCF法（ゼロ成長モデル）により、次のように計算されます。
　企業価値 ＝ FCF ÷ r
　　　　　 ＝ 1,000 ÷ 0.1
　　　　　 ＝ 10,000万円
　　　　　 ＝ 1億円

よって、イが適切です。`,
  },
  {
    id: 2,
    category: CAT_VALUE,
    title: "定率成長モデル",
    question:
      "次の資料は、J社に関するものである。この資料に基づいた場合、J社の企業価値として、最も適切なものを下記の解答群から選べ。",
    shiryo: [
      "１．J社が1年後に得られるフリー・キャッシュ・フローは、1,000万円と予測されている。",
      "２．J社がその後1年ごとに得られるフリー・キャッシュ・フローの成長率は5％と予測されている。",
      "３．資本コストは、10％である。",
      "４．企業価値は、DCF法により計算する。",
    ],
    choices: ["1,100万円", "1億円", "1億1,000万円", "2億円", "3億円"],
    answer: 3,
    juyou: `本問では、定率成長モデルについて問われています。

●定率成長モデル（将来のフリー・キャッシュ・フローが一定率で成長する場合のモデル）
〈数　式〉
　企業価値 ＝ FCF ÷（r － g）　（r＞g）
　FCF：第1期のフリー・キャッシュ・フロー
　r：資本コスト
　g：フリー・キャッシュ・フローの成長率

定率成長モデルは、ゴードンの成長モデルと呼ばれることもあります。この計算式において、資本コストがフリー・キャッシュ・フローの成長率を上回っていることが必要となります。`,
    seikai: `正解：エ　2億円
J社の企業価値は、DCF法（定率成長モデル）により、次のように計算されます。
　企業価値 ＝ FCF ÷（r － g）
　　　　　 ＝ 1,000 ÷（0.1 － 0.05）
　　　　　 ＝ 1,000 ÷ 0.05
　　　　　 ＝ 20,000万円
　　　　　 ＝ 2億円

よって、エが適切です。`,
  },
  {
    id: 3,
    category: CAT_VALUE,
    title: "収益還元法",
    question:
      "次の資料は、K社に関するものである。この資料に基づいた場合、K社の企業価値として、最も適切なものを下記の解答群から選べ。",
    shiryo: [
      "１．K社は、永続的に毎年一定の税引後利益を得るものと予測されている。",
      "２．K社が永続的に毎年得る予想税引後利益は、1,000万円である。",
      "３．資本還元率は、10％である。",
      "４．企業価値は、収益還元法により計算する。",
    ],
    choices: ["1億円", "1億1,000万円", "1億5,000万円", "2億円", "3億円"],
    answer: 0,
    juyou: `本問では、収益還元法について問われています。

●収益還元法
　会計上の利益から企業価値を求める
〈数　式〉
　企業価値 ＝ 予想税引後利益 ÷ 資本還元率

DCF法のゼロ成長モデル（毎年のキャッシュ・フローが一定の場合）の式とよく似ていますが、収益還元法では、フリー・キャッシュ・フローの代わりに税引後利益を用いている点に注意しましょう。`,
    seikai: `正解：ア　1億円
K社の企業価値は、収益還元法により、次のように計算されます。
　企業価値 ＝ 予想税引後利益 ÷ 資本還元率
　　　　　 ＝ 1,000 ÷ 0.1
　　　　　 ＝ 10,000万円
　　　　　 ＝ 1億円

よって、アが適切です。`,
  },
  {
    id: 4,
    category: CAT_VALUE,
    title: "配当還元法",
    question:
      "次の資料は、L社に関するものである。この資料に基づいた場合、L社の企業価値として、最も適切なものを下記の解答群から選べ。",
    shiryo: [
      "１．L社は、永続的に毎年一定の配当を行うものと予測されている。",
      "２．L社が永続的に毎年行う配当額は、1,000万円である。",
      "３．資本還元率は、10％である。",
      "４．株主価値は、配当還元法により計算する。",
      "５．企業価値は、株主価値と負債価値を合計したものである。",
      "６．L社の負債価値は、1億円である。",
    ],
    choices: ["1億円", "1億1,000万円", "1億5,000万円", "2億円", "3億円"],
    answer: 3,
    juyou: `本問では、配当還元法について問われています。

●配当還元法
　毎期の配当から企業価値を求める
〈数　式〉
　株主価値 ＝ 配当額 ÷ 資本還元率
　企業価値 ＝ 株主価値 ＋ 負債価値

DCF法、収益還元法、配当還元法は、いずれも将来獲得されるリターンを現在価値に割引いて評価するものです。将来獲得されるリターンが、それぞれ、キャッシュインフロー、利益、配当といった違いはありますが、DCF法、収益還元法、配当還元法は、いずれもインカム・アプローチによる評価方法です。`,
    seikai: `正解：エ　2億円
L社の株主価値は、配当還元法により、次のように計算されます。
　株主価値 ＝ 配当額 ÷ 資本還元率
　　　　　 ＝ 1,000 ÷ 0.1
　　　　　 ＝ 10,000万円
　　　　　 ＝ 1億円

L社の企業価値は、次のように計算されます。
　企業価値 ＝ 株主価値 ＋ 負債価値
　　　　　 ＝ 1 ＋ 1
　　　　　 ＝ 2億円

よって、エが適切です。`,
  },
  {
    id: 5,
    category: CAT_VALUE,
    title: "簿価純資産法・時価純資産法",
    question:
      "次の資料は、M社に関するものである。この資料に基づいた場合、M社の株主価値に関する説明として、最も適切なものを下記の解答群から選べ。",
    shiryo: ["１．M社の資産と負債は、次のとおりである。"],
    figure: "M",
    shiryoAfter: [
      "２．株主価値は、簿価純資産法または時価純資産法により計算する。",
    ],
    choices: [
      "簿価純資産法による株主価値は3,000万円であり、時価純資産法による株主価値は3,000万円である。",
      "簿価純資産法による株主価値は3,000万円であり、時価純資産法による株主価値は4,000万円である。",
      "簿価純資産法による株主価値は4,000万円であり、時価純資産法による株主価値は3,000万円である。",
      "簿価純資産法による株主価値は5,000万円であり、時価純資産法による株主価値は6,000万円である。",
    ],
    answer: 1,
    juyou: `本問では、簿価純資産法・時価純資産法について問われています。

●簿価純資産法
　資産（簿価）から負債（簿価）を控除したものを株主価値とする
〈数　式〉株主価値 ＝ 資産（簿価） － 負債（簿価）

●時価純資産法
　資産（時価）から負債（時価）を控除したものを株主価値とする
〈数　式〉株主価値 ＝ 資産（時価） － 負債（時価）

簿価純資産法、時価純資産法は、いずれも企業の所有する資産および負債の価値を個別評価し、その合計をもって企業の価値を評価します。このような評価をするものを、コスト・アプローチといいます。企業価値を算定する方法には、インカム・アプローチ、コスト・アプローチの他に、マーケット・アプローチがあります。マーケット・アプローチとは、企業自身もしくは同業他社の株式市場での評価を利用して、企業の価値を評価する方法です。`,
    seikai: `正解：イ
M社の株主価値は、簿価純資産法により、次のように計算されます。
　株主価値 ＝ 資産（簿価） － 負債（簿価）
　　　　　 ＝ 5,000 － 2,000
　　　　　 ＝ 3,000万円

M社の株主価値は、時価純資産法により、次のように計算されます。
　株主価値 ＝ 資産（時価） － 負債（時価）
　　　　　 ＝ 6,000 － 2,000
　　　　　 ＝ 4,000万円

よって、イが適切です。`,
  },
  {
    id: 6,
    category: CAT_VALUE,
    title: "M&Aの手法",
    question:
      "買収される企業の資産や将来性を担保に、資金を金融機関から借り入れて、その資金で買収するM&Aの手法を表す用語として、最も適切なものはどれか。",
    choices: ["TOB", "MBO", "EBO", "LBO"],
    answer: 3,
    juyou: `本問では、M&Aの手法について問われています。
M&Aの手法には、次のようなものがあります。

●LBO（Leveraged Buy Out）
　LBO（レバレッジドバイアウト）は、買収される企業の資産や将来性を担保に、資金を金融機関から借り入れて、その資金で買収するものです。

●MBO（Management Buy Out）
　MBO（マネジメントバイアウト）は、現在の経営陣が、自社や事業を買収することです。

●EBO（Employee Buy Out）
　従業員が資金を出し合って、経営権の取得等を行うのものが、EBO（エンプロイーバイアウト）です。

●TOB（Take Over Bid）
　TOB（テイクオーバービット）は、株式公開買い付けのことです。TOBでは、ある企業を買収したい場合には、株価と期間を表明して、不特定多数の株主から証券取引所を通さずに直接株式を買い付けます。これにより、短期間で大量の株式を取得することができます。

M&Aの手法については、「企業経営理論」でも出題されますので、どちらの科目で出題されても正解できるよう、基本的な用語について整理しておきましょう。`,
    seikai: `買収される企業の資産や将来性を担保に、資金を金融機関から借り入れて、その資金で買収するM&Aの手法は、LBO（Leveraged Buy Out、レバレッジドバイアウト）です。企業買収では、大量の買収資金が必要ですが、LBOはこの資金を全て用意しなくても買収できる手法です。LBOにより、限られた資金でも大型の買収ができます。このように、少ない資金で、大きな資本の企業を買収できることから、梃（てこ）の原理になぞらえてレバレッジドバイアウトと呼ばれます。

よって、エが適切で、これが正解です。`,
  },
  {
    id: 7,
    category: CAT_VALUE,
    title: "MM理論",
    question: "MM理論に関する説明として、最も不適切なものはどれか。",
    choices: [
      "法人税が存在しない完全資本市場では、企業価値はその資本構成に依存しない。",
      "法人税が存在しない完全資本市場では、最適資本構成が存在しない。",
      "法人税が存在しない完全資本市場では、加重平均資本コストの最小値が存在する。",
      "法人税が存在する現実では、企業価値はその資本構成に依存する。",
    ],
    answer: 2,
    juyou: `本問では、MM理論について問われています。
負債を利用することによる資本構成の変化が、加重平均資本コストや企業価値にどのような影響を与えるかについて、法人税がない完全資本市場を仮定して最適資本構成を研究したモデルのことを、「MM理論」といいます。

〈結　論〉
　・法人税が存在しない完全資本市場では、企業価値はその資本構成に依存しない
　・最適資本構成は存在しない
　・加重平均資本コスト（WACC）は一定である

完全資本市場においては、企業の価値は、借入（負債）で資金調達するか株式（自己資本）で資金調達するかといった資本の調達方法によらず、企業が将来生み出すキャッシュ（資産）によって決まります。
法人税が存在する現実においては、企業価値は資本構成に依存することになり、最適資本構成が存在し、加重平均コストの最小値が存在することに注意しましょう。`,
    seikai: `ア　○：法人税が存在しない完全資本市場では、企業価値はその資本構成に依存しません。これが、MM理論の重要な結論です。

イ　○：法人税が存在しない完全資本市場では、最適資本構成が存在しません。完全資本市場においては、企業の価値は、負債により資金調達するか自己資本により資金調達するかといった資本の調達方法によらず、企業が将来生み出すキャッシュによって決まります。

ウ　×：法人税が存在しない完全資本市場では、加重平均資本コストは一定です。最小値は存在しません。負債コストは不確実性がないため、資本コストよりも低くなります。すると、負債が増えるに従って加重平均コストは引き下げられることになります。しかし一方で、財務レバレッジ効果が働き、負債が増えるに従って株主資本コストも上昇します。財務レバレッジ効果とは、負債の増加により株主のリスクとリターンが高まる効果のことです。すると、負債の増加に従って加重平均コストが引き下げられる効果と、株主資本コストが上昇する効果が打ち消し合って、法人税が存在しない完全資本市場では、加重平均資本コストは一定になります。よって、記述は不適切です。

エ　○：法人税が存在する現実では、企業価値はその資本構成に依存します。すなわち、企業価値が最大になる最適資本構成が存在します。法人税を考慮すると、借入（負債）で調達した場合には、支払利息が発生します。支払利息の損金算入によって法人税が軽減されるため節税効果が働きます。そのため、実質的な負債コストは低下することになり、加重平均コストは低下します。負債を利用すればするほど、加重平均資本コストは低下することになります。しかし、実際には負債比率が高まれば倒産などの財務リスクが高くなります。財務リスクが高くなると、負債の調達金利が高くなるため、加重平均資本コストが増加します。つまり、負債比率が0から次第に高くなるにつれ、節税効果により、加重平均資本コストは低下し、企業価値は増加していきますが、さらに負債比率が高くなると倒産などの財務リスクによる効果が働き、加重平均資本コストは上昇し、企業価値が下がっていくと考えられます。この負債比率のときが最適資本構成となります。`,
  },
  {
    id: 8,
    category: CAT_VALUE,
    title: "理論株価",
    question:
      "次の資料は、N社とO社に関するものである。この資料に基づいた場合、N社とO社の理論株価に関する説明として、最も適切なものを下記の解答群から選べ。",
    shiryo: [
      "１．N社、O社ともに1年後の配当総額は、100万円である。",
      "２．N社の毎期の配当総額は、一定である。",
      "３．O社の配当総額は、毎期5％だけ成長する。",
      "４．株主価値は、配当還元法により計算する。",
      "５．資本還元率は、10％である。",
      "６．N社、O社ともに発行済株式数は、1,000株である。",
    ],
    choices: [
      "N社の理論株価は1万円であり、O社の理論株価は1万円である。",
      "N社の理論株価は2万円であり、O社の理論株価は1万円である。",
      "N社の理論株価は1万円であり、O社の理論株価は2万円である。",
      "N社の理論株価は2万円であり、O社の理論株価は2万円である。",
    ],
    answer: 2,
    juyou: `本問では、理論株価について問われています。
理論株価は、次の式で計算されます。
　理論株価 ＝ 株主価値 ÷ 発行済株式数

本問により、成長する企業の方が、成長しない企業よりも理論株価が高くなることを確認してください。`,
    seikai: `正解：ウ

(1) N社
　N社の株主価値は、配当還元法により、次のように計算されます。
　株主価値 ＝ 配当額 ÷ 資本還元率
　　　　　 ＝ 100 ÷ 0.1
　　　　　 ＝ 1,000万円

　N社の理論株価は、次のように計算されます。
　理論株価 ＝ 株主価値 ÷ 発行済株式数
　　　　　 ＝ 1,000万円 ÷ 1,000株
　　　　　 ＝ 1万円/株

(2) O社
　O社の株主価値は、配当還元法により、次のように計算されます。
　株主価値 ＝ 配当額 ÷（資本還元率 － 成長率）
　　　　　 ＝ 100 ÷（0.1 － 0.05）
　　　　　 ＝ 100 ÷ 0.05
　　　　　 ＝ 2,000万円

　O社の理論株価は、次のように計算されます。
　理論株価 ＝ 株主価値 ÷ 発行済株式数
　　　　　 ＝ 2,000万円 ÷ 1,000株
　　　　　 ＝ 2万円/株

よって、ウが適切です。`,
  },
  {
    id: 9,
    category: CAT_VALUE,
    title: "株価収益率",
    question: "株価収益率に関する説明として、最も適切なものはどれか。",
    choices: [
      "株価収益率は、株価を1株当たり当期純利益で割って計算される。",
      "株価収益率は、当期純利益を発行済株式数で割って計算される。",
      "株価収益率は、株価を1株当たり純資産額で割って計算される。",
      "株価収益率は、純資産額を発行済株式数で割って計算される。",
    ],
    answer: 0,
    juyou: `本問では、株価収益率について問われています。

●株価収益率（PER：Price Earning Ratio）
　株価が1株あたり当期純利益の何倍になっているかを表す
〈数　式〉PER ＝ 株価 ÷ 1株あたり当期純利益

●1株あたり当期純利益（EPS：Earning Per Share）
〈数　式〉EPS ＝ 当期純利益 ÷ 発行済株式数

純利益に比べて株価が安い株は、割安と考えられます。逆に、純利益に比べて株価が高い株は、割高と考えられます。このように、株主から見た場合は、PERが低い株が買得ということになります。`,
    seikai: `ア　○：
　株価収益率（PER）は、株価を1株当たり当期純利益で割って計算されます。よって、記述は適切です。

イ × ：
　当期純利益を発行済株式数で割って計算されるのは、1株当たり当期純利益（EPS）です。株価収益率ではありません。

ウ × ：
　株価を1株当たり純資産額で割って計算されるのは、株価純資産倍率（PBR）です。株価収益率ではありません。

エ × ：
　純資産額を発行済株式数で割って計算されるのは、1株当たり純資産（BPS）です。株価収益率ではありません。`,
  },
  {
    id: 10,
    category: CAT_VALUE,
    title: "株価純資産倍率",
    question:
      "次の資料は、P社に関するものである。この資料に基づいた場合、P社の株価純資産倍率として、最も適切なものを下記の解答群から選べ。",
    shiryo: [],
    figure: "P",
    choices: ["0.75倍", "1倍", "1.5倍", "15倍", "150倍"],
    answer: 2,
    juyou: `本問では、株価純資産倍率について問われています。

●株価純資産倍率（PBR：Price Book － value Ratio）
　1株あたり純資産額の何倍で株式が売買されているかを表す
〈数　式〉PBR ＝ 株価 ÷ 1株あたり純資産額

●1株あたり純資産額（BPS：Book － value Per Share）
〈数　式〉BPS ＝ 純資産額 ÷ 発行済株式数

PBRは1を基準として、1よりも高いほど割高と判断できる点に注意しましょう。`,
    seikai: `正解：ウ　1.5倍

(1) 1株あたり純資産額（BPS：Book-value Per Share）
　まず、1株あたり純資産額BPSを求めると、次のようになります。
　BPS ＝ 純資産額 ÷ 発行済株式数
　　　 ＝ 1億円 ÷ 10万株
　　　 ＝ 1,000円／株

(2) 株価純資産倍率（PBR：Price Book value Ratio）
　株価純資産倍率とは、1株あたり純資産額の何倍で株式が売買されているかを表す指標です。この株価純資産倍率PBRを求めると、次のようになります。
　PBR ＝ 株価 ÷ 1株あたり純資産額
　　　 ＝ 1,500円／株 ÷ 1,000円／株
　　　 ＝ 1.5倍

よって、ウが適切です。
本問に答えるのに不必要なダミーデータに惑わされないようにしてください。`,
  },
  {
    id: 11,
    category: CAT_VALUE,
    title: "配当利回り",
    question:
      "次の資料は、Q社に関するものである。この資料に基づいた場合、Q社の配当利回りの値として、最も適切なものを下記の解答群から選べ。",
    shiryo: [],
    figure: "Q",
    choices: ["1％", "2％", "3％", "4％", "5％"],
    answer: 1,
    juyou: `本問では、配当利回りについて問われています。
配当関連の指標には、次のものがあります。

●配当利回り
〈数　式〉配当利回り ＝ 1株あたり配当 ÷ 株価

●1株あたり配当
〈数　式〉1株あたり配当 ＝ 配当総額 ÷ 発行済株式数

●配当性向
　利益のうち配当する割合
〈数　式〉配当性向 ＝ 配当総額 ÷ 当期純利益

本問により、配当利回り、1株あたり配当、配当性向、株価純資産倍率（PBR）、自己資本利益率（ROE）の関係をしっかり把握してください。`,
    seikai: `正解：イ　2％

(1) 各指標の計算式
　各指標の計算式は、次のようになります。
　株価純資産倍率（PBR）＝ 株価 ÷ 1株あたり純資産額
　　　　　　　　　　　 ＝（株価 × 発行済株式数）÷（1株あたり純資産額 × 発行済株式数）
　　　　　　　　　　　 ＝ 時価総額 ÷ 純資産額（自己資本）
　配当性向 ＝ 配当総額 ÷ 当期純利益
　配当利回り ＝ 1株あたり配当 ÷ 株価
　　　　　　 ＝（配当総額 ÷ 発行済株式数）÷ 株価
　　　　　　 ＝ 配当総額 ÷（株価 × 発行済株式数）
　　　　　　 ＝ 配当総額 ÷ 時価総額
　自己資本利益率（ROE）＝ 当期純利益 ÷ 自己資本

(2) 各指標との関係
　自己資本利益率（ROE）は、次のように表されます。
　自己資本利益率（ROE）＝ 当期純利益 ÷ 自己資本
　　　　　　　　　　　 ＝（時価総額 ÷ 自己資本）×（配当総額 ÷ 時価総額）×（当期純利益 ÷ 配当総額）
　　　　　　　　　　　 ＝（時価総額 ÷ 自己資本）×（配当総額 ÷ 時価総額）÷（配当総額 ÷ 当期純利益）
　　　　　　　　　　　 ＝ 株価純資産倍率（PBR）× 配当利回り ÷ 配当性向

　したがって、次のようになります。
　自己資本利益率(ROE) ＝ 株価純資産倍率(PBR) × 配当利回り ÷ 配当性向
　10％ ＝ 2.5倍 × 配当利回り ÷ 50％
　0.1 ＝ 2.5 × 配当利回り ÷ 0.5
　∴ 配当利回り ＝ 0.1 × 0.5 ÷ 2.5
　　　　　　　 ＝ 0.02
　　　　　　　 ＝ 2％

よって、イが適切です。`,
  },
  {
    id: 12,
    category: CAT_DERIV,
    title: "為替予約",
    question:
      "次の資料は、R社に関するものである。この資料に基づいた場合、為替予約に関する説明として、最も適切なものを下記の解答群から選べ。",
    shiryo: [
      "１．R社は3ヵ月後に、X銀行から1ユーロ100円の為替相場で1ユーロを買うという先物為替予約をした。",
      "２．この為替予約の損益図は、次のように表される。",
    ],
    figure: "forward",
    choices: [
      "この損益図で描かれる青色の実線①は、X銀行の損益を表している。",
      "この損益図で描かれる赤色の点線②は、R社の損益を表している。",
      "3ヵ月後において、為替予約価格1ユーロ100円より円高・ユーロ安になると、R社はプラスの利益を得ることができる。",
      "3ヵ月後において、為替予約価格1ユーロ100円より円安・ユーロ高になると、R社はプラスの利益を得ることができる。",
    ],
    answer: 3,
    juyou: `本問では、為替予約について問われています。

●為替予約
　為替予約は、為替相場の変動リスクを回避するためのものです。為替予約では、将来の為替相場をあらかじめ決定しておくことでリスクを回避します。為替予約をすると早く損益を確定でき、為替変動リスクを回避できます。

為替予約の損益図において、当事者同士のグラフは対称形になっていることに注目しましょう。`,
    seikai: `ア × ：
　外貨を商品と考えて、将来の一定の期日に一定の価格で外貨を売買する契約を行うことを、先物為替予約といいます。本設問では、ユーロの買い手がR社で、ユーロの売り手がX銀行になります。3ヵ月後において、為替予約価格1ユーロ100円より円安・ユーロ高になると、ユーロの買い手であるR社は為替予約したことによって、利益を得ることができます。例えば、3ヵ月後において1ユーロ110円の円安・ユーロ高の為替相場になると、R社は為替予約した1ユーロを100円で買い、その1ユーロを3ヵ月後における1ユーロ110円の為替相場で売ると受取額は110円となり、10円の利益額となります。3ヵ月後において、円安・ユーロ高がさらに進むと、R社はさらに多くの利益を得ることができます。逆に、3ヵ月後において、為替予約価格1ユーロ100円より円高・ユーロ安になると、R社は為替予約したことによって、損失を被ることになります。よって、損益図で描かれる青色の実線①はR社の損益を表します。X銀行の損益ではありません。

イ × ：
　ユーロの売り手であるX銀行は、3ヵ月後において為替予約価格1ユーロ100円より円安・ユーロ高になると、為替予約を受けたことによって、損失を被ることになります。例えば、3ヵ月後において1ユーロ110円の為替相場になると、X銀行は、1ユーロを3ヵ月後における1ユーロ110円の為替相場で為替市場から買い、R社に1ユーロ100円で売ることになり、10円の損失を被ることなります。3ヵ月後において、円安・ユーロ高がさらに進むと、X銀行はさらに多くの損失を被ることになります。逆に、3ヵ月後において、為替予約価格1ユーロ100円より円高・ユーロ安になると、X銀行は為替予約を受けたことによって、利益を得ることになります。よって、損益図で描かれる赤色の点線②はX銀行の損益を表します。R社の損益ではありません。

ウ × ：
　アの解説のように、3ヵ月後において、為替予約価格1ユーロ100円より円高・ユーロ安になると、R社は為替予約したことによって、損失を被ることになります。R社はプラスの利益を得ることができるのではありません。

エ　○：
　アの解説のように、3ヵ月後において、為替予約価格1ユーロ100円より円安・ユーロ高になると、R社は為替予約したことによって、R社はプラスの利益を得ることができます。よって、記述は適切です。`,
  },
  {
    id: 13,
    category: CAT_DERIV,
    title: "先渡取引（フォワード）と先物取引（フューチャー）",
    question:
      "先渡取引（フォワード）と先物取引（フューチャー）に関する説明として、最も適切なものはどれか。",
    choices: [
      "先渡取引（フォワード）と先物取引（フューチャー）は、いずれも所定の原資産を将来の一定時点に所定の価格で売買する契約である。",
      "先渡取引（フォワード）と先物取引（フューチャー）は、いずれも店頭取引として行われる。",
      "先物取引（フューチャー）では、原資産、取引条件などは取引の当事者間で任意に取り決める。",
      "先渡取引（フォワード）では、契約の履行を取引所が保証しているため、信用リスクは少ない。",
    ],
    answer: 0,
    juyou: `本問では、先渡取引（フォワード）と先物取引（フューチャー）について問われています。

●先渡取引（フォワード）
　先渡取引とは、将来のある特定の日に、特定の原資産を、当事者間で合意した価格で売買することを現時点で約定する取引で、取引単位、受渡日について当事者間で自由に決定することができるオーダー・メイドの取引です。

●先物取引（フューチャー）
　先物取引は、取引の当事者が、将来のある特定の日に、特定の原資産を現時点で約定した価格で売買する取引で、価格・数量・受渡し決済日が決まっているレディー・メイドの取引です。

先渡取引（フォワード）と先物取引（フューチャー）についてまとめると、次のようになります。

　　　　　　 ／ 先渡取引(フォワード) ／ 先物取引(フューチャー)
　取引方法： 店頭取引(相対取引) ／ 取引所取引
　取引単位： 自由 ／ 標準化
　反対売買： 期日に契約の決済 ／ 期日前に反対売買をして取引を解消する場合が多い
　信用リスク： ある ／ 基本的にはない
　証拠金： 不要 ／ 必要

先渡取引（フォワード）と先物取引（フューチャー）について、上記の表でしっかり整理したうえで、理解しておきましょう。`,
    seikai: `ア 　○ ：　記述のように、先渡取引（フォワード）と先物取引（フューチャー）は、所定の原資産を将来の一定時点に所定の価格で売買する契約という意味では同じです。よって、記述は適切です。

イ 　× ：　先物取引（フューチャー）は標準化された取引所取引です。これに対し、先渡取引（フォワード）は売手と買手の1対1の相対取引になります。

ウ 　× ：　原資産、取引条件などを取引の当事者間で任意に取り決めるのは、先渡取引（フォワード）です。先物取引（フューチャー）ではありません。

エ　×：　契約の履行を取引所が保証しているため、信用リスクが少ないのは、先物取引（フューチャー）です。先渡取引（フォワード）ではありません。`,
  },
  {
    id: 14,
    category: CAT_DERIV,
    title: "オプション取引",
    question: "オプション取引に関する説明として、最も適切なものはどれか。",
    choices: [
      "オプション取引とは、決められた期間内にあらかじめ決められた価格で取引する権利を取引するものである。",
      "オプション取引では、売る権利のことをコール･オプション、買う権利のことをプット･オプションと呼ぶ。",
      "満期日のみ権利を行使できるタイプのオプションを、アメリカンタイプという。",
      "満期日以前であればいつでも権利を行使できるタイプのオプションを、ヨーロピアンタイプという。",
    ],
    answer: 0,
    juyou: `本問では、オプション取引について問われています。
オプションとは、決められた期間内にあらかじめ決められた価格で取引する権利のことです。

●プット･オプション：売る権利のこと
●コール･オプション：買う権利のこと

オプション取引とは、そのオプションを取引する（売り買いする）ものです。

〈オプションの取引の4種類〉
●プット･オプションを買う
●プット･オプションを売る
●コール･オプションを買う
●コール･オプションを売る

〈権利の行使期間〉
●ヨーロピアンタイプ：満期日のみ権利を行使できる
●アメリカンタイプ：満期日以前であればいつでも権利を行使できる

為替予約では必ず取引を行う必要がありましたが、オプション取引は権利なので、権利を行使するか行使しないかを自由に選択することができます。この相違点をしっかりと注目してください。`,
    seikai: `ア　○：
　オプション取引とは、決められた期間内にあらかじめ決められた価格で取引する権利を取引するものです。よって、記述は適切です。

イ × ：
　記述内容が逆です。オプション取引では、売る権利のことを「プット･オプション」、買う権利のことを「コール･オプション」と呼びます。

ウ × ：
　オプション取引では権利の行使期間が決められています。満期日のみ権利を行使できるタイプのオプションを、ヨーロピアンタイプといいます。アメリカンタイプではありません。

エ × ：
　満期日以前であればいつでも権利を行使できるタイプのオプションを、アメリカンタイプといいます。ヨーロピアンタイプではありません。`,
  },
  {
    id: 15,
    category: CAT_DERIV,
    title: "プット・オプション",
    question:
      "次の資料は、S社に関するものである。この資料に基づいた場合、プット・オプションに関する説明として、最も適切なものを下記の解答群から選べ。",
    shiryo: [
      "１．S社は将来時点において、Y銀行に1ユーロ100円の為替相場で1ユーロを売るという権利を、1ユーロあたりオプション料2円で購入した。",
      "２．このオプション取引の損益図は、次のように表される。",
    ],
    figure: "put",
    choices: [
      "この損益図で描かれる青色の実線①は、S社の損益を表している。",
      "この損益図で描かれる赤色の点線②は、S社の損益を表している。",
      "将来時点において、1ユーロ98円より円高・ユーロ安になると、S社は損失を被ることになる。",
      "将来時点において、1ユーロ98円より円高・ユーロ安になると、Y銀行は利益を得ることになる。",
    ],
    answer: 1,
    juyou: `本問では、プット・オプションについて問われています。
プット・オプションとは、売る権利のこといいます。

●プット・オプションの売り
　利益はオプション料が限度となる
　損失は無限となる

●プット・オプションの買い
　利益は無限となる
　損失はオプション料が限度となる

オプション取引についてまとめた次の表を、確認しておきましょう。`,
    figureInJuyou: "optionTable",
    seikai: `ア × ：
　本問は、売るという権利ということですから、プット・オプションのことです。本問では、プット・オプションの買い手がS社で、プット・オプションの売り手がY銀行になります。将来時点において、権利行使価格1ユーロ100円より円安・ユーロ高になると、プット・オプションの買い手であるS社はオプションを放棄することによって、円安・ユーロ高による損失をオプション料2円だけに確定させることになります。すると、プット・オプションの売り手であるY銀行はオプション料2円の利益を得ることができます。逆に、将来時点において、権利行使価格1ユーロ100円より円高・ユーロ安になると、プット・オプションの買い手であるS社はオプションを行使することによって、利益を増やすことができるので、プット・オプションの売り手であるY銀行はそれを拒むことはできず、損失を被ることになります。よって、損益図で描かれる青色の実線①はY銀行の損益を表します。S社の損益ではありません。

イ　○：
　将来時点において、権利行使価格1ユーロ100円より円安・ユーロ高になると、プット・オプションの買い手であるS社はオプションを放棄することによって、円安・ユーロ高による損失を1ユーロあたりオプション料2円だけに確定させることができます。将来時点において、円安・ユーロ高がさらに進んだとしても、S社はオプションを放棄するので損失はオプション料の2円だけに確定させることができます。逆に、将来時点において、権利行使価格1ユーロ100円より円高・ユーロ安になると、S社はオプションを行使することによって、利益を増やすことができます。例えば、将来時点において1ユーロ90円の為替相場になると、S社は1ユーロを90円で買い、その1ユーロについてオプションを行使することによって権利行使価格1ユーロ100円で売ると受取額は100円となり、オプション料2円を差し引いて、8円の手取額となります。将来時点において、円高・ユーロ安がさらに進むと、S社はさらに多くの利益を得ることができます。よって、損益図で表される赤色の点線②はS社の損益を表します。よって、記述は適切です。オプション料は1ユーロ当たり2円ですので、1ユーロ98円より円高・ユーロ安になると、S社はプラスの利益を得ることができます。

ウ × ：
　イの解説のように、将来時点において、1ユーロ98円より円高・ユーロ安になると、オプション取引をしたことによってS社はプラスの利益を得ることができます。損失を被ることになるのではありません。

エ × ：
　イの解説のように、将来時点において、1ユーロ98円より円高・ユーロ安になると、オプション取引を受けたことによってY銀行は損失を被ることになります。利益を得るのではありません。`,
  },
  {
    id: 16,
    category: CAT_DERIV,
    title: "オプション価格",
    question:
      "次の文章は、効率的市場仮説について述べたものである。空欄Ａ～Ｄに入る語句の組み合わせとして、最も適切なものはどれか。\n\n　オプション価格は、（　Ａ　）価値と（　Ｂ　）価値により構成される。以下の図は（　Ｃ　）オプションの価値を示している。（　Ｃ　）オプションでは、原資産価格が権利行使価格と比較して、（　Ｄ　）とき、（　Ａ　）価値が存在する。",
    figure: "call",
    choices: [
      "Ａ　時間的　Ｂ　根本的　Ｃ　コール　Ｄ　高い",
      "Ａ　時間的　Ｂ　根本的　Ｃ　プット　Ｄ　低い",
      "Ａ　本質的　Ｂ　時間的　Ｃ　プット　Ｄ　低い",
      "Ａ　本質的　Ｂ　時間的　Ｃ　コール　Ｄ　高い",
    ],
    answer: 3,
    juyou: `オプションの価格構成は本質的価値と時間的価値から成ります。
　オプション料 ＝ 本質的価値 ＋ 時間的価値

・本質的価値
　本質的価値とは、その時点でオプションを権利行使した場合に生じる価値（原資産価格と権利行使価格との差額）のことで、内在的価値とも呼ばれます。本質的価値は、ゼロになることはあっても、マイナスになることはありません。

・時間的価値
　時間的価値とは、原資産の現時点から満期日までの間の価格変動により、オプションの本質的価値が上昇することへの期待値のことです。ですので、時間的価値についても、ゼロになることはあっても、マイナスになることはありません。プレミアム（オプション価格）に、時間の経過や価格変動の大きさなどといった時間的価値が影響してくるのが、オプションの最大の特徴であるといえます。`,
    seikai: `オプション価値のうち、原資産価格と権利行使価格の差にあたる部分を本質的価値といいます。本問の図は、コールオプションの図になります。従って、（　Ｃ　）はコールとなります。コールオプションでは、原資産価値が増加すると、オプション価値であるプレミアムが上昇します。これは、オプションを権利行使すると、「原資産価格－権利行使価格」がオプションの買い手の利益になることを意味しています。従って、（　Ｄ　）は高いが入ります。一方、「原資産価格－権利行使価格」＜0のときは、オプションの買い手は権利を放棄します。よって、（　Ａ　）価値は本質的価値となります。（　Ｂ　）は時間的価値が入ります。`,
    figureInSeikai: "callValue",
  },
];

const TOTAL = QUESTIONS.length;

// ===================================================================
// ローディングスピナー
// ===================================================================
const Spinner = ({ label }) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
    <RefreshCw className="h-10 w-10 animate-spin text-indigo-600" />
    <p className="mt-4 text-slate-600">{label || "Loading..."}</p>
  </div>
);

// 解説テキストを段落表示する小コンポーネント
const TextBlock = ({ text }) => (
  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
    {text}
  </div>
);

// ===================================================================
// メインアプリ
// ===================================================================
export default function App() {
  const [authReady, setAuthReady] = useState(false); // 匿名認証の通信完了
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 合言葉ログイン完了
  const [passphrase, setPassphrase] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [userId, setUserId] = useState("");

  // 学習データ
  const [history, setHistory] = useState({}); // { [qid]: {result, reviewed, lastAnsweredAt} }
  const [progressIndex, setProgressIndex] = useState(0);
  const [progressMode, setProgressMode] = useState("all");

  // 画面制御
  const [screen, setScreen] = useState("dashboard"); // dashboard | quiz
  const [mode, setMode] = useState("all"); // all | wrong | review
  const [quizList, setQuizList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExp, setShowExp] = useState(false);

  // -----------------------------------------------------------------
  // 起動時：Firebase匿名認証（通信できる状態にするだけ。ログイン完了にはしない）
  // -----------------------------------------------------------------
  useEffect(() => {
    let mounted = true;
    const doAuth = async () => {
      if (!auth) {
        console.error("[Auth] Firebaseが初期化されていません");
        if (mounted) setAuthReady(true); // 画面は合言葉入力へ進める
        return;
      }
      try {
        await signInAnonymously(auth);
        console.log("[Auth] 匿名認証に成功（通信可能状態）");
      } catch (e) {
        console.error("[Auth] 匿名認証に失敗:", e);
      } finally {
        if (mounted) setAuthReady(true);
      }
    };
    doAuth();
    return () => {
      mounted = false;
    };
  }, []);

  // -----------------------------------------------------------------
  // Firestoreへの保存（防衛的）
  // -----------------------------------------------------------------
  const persist = useCallback(async (uid, data) => {
    if (!db || !uid) return;
    try {
      const ref = doc(db, APP_ID, uid);
      await setDoc(ref, data, { merge: true });
      console.log("[Save] Firestoreへ保存しました", data);
    } catch (e) {
      console.error("[Save] 保存に失敗:", e);
    }
  }, []);

  // -----------------------------------------------------------------
  // 合言葉ログイン：Firestoreフェッチ完了で初めてログイン完了
  // -----------------------------------------------------------------
  const handleLogin = async (e) => {
    e?.preventDefault?.();
    const key = passphrase.trim();
    if (!key) {
      setLoginError("合言葉を入力してください。");
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    console.log("[Login] 合言葉で接続を開始:", key);

    let loadedHistory = {};
    let loadedIndex = 0;
    let loadedMode = "all";

    try {
      if (db) {
        const ref = doc(db, APP_ID, key);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data() || {};
          loadedHistory = d?.history || {};
          loadedIndex =
            typeof d?.progressIndex === "number" ? d.progressIndex : 0;
          loadedMode = d?.progressMode || "all";
          console.log("[Login] 履歴を復元しました", d);
        } else {
          // 該当ドキュメントが存在しない場合は初期オブジェクトを作成
          console.log("[Login] 新規ユーザー。初期データを作成します");
          await setDoc(ref, {
            history: {},
            progressIndex: 0,
            progressMode: "all",
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        console.warn("[Login] DB未初期化のためローカル状態で続行します");
      }

      // フェッチ完了 → ここで初めてログイン完了
      setUserId(key);
      setHistory(loadedHistory || {});
      setProgressIndex(loadedIndex || 0);
      setProgressMode(loadedMode || "all");
      setScreen("dashboard");
      setIsAuthenticated(true);
      console.log("[Login] 初期読み込み完了。ログイン状態に切り替え");
    } catch (e) {
      console.error("[Login] 読み込みに失敗。空データでフォールバック:", e);
      // クラッシュ回避：空データでログインを許可
      setUserId(key);
      setHistory({});
      setProgressIndex(0);
      setProgressMode("all");
      setScreen("dashboard");
      setIsAuthenticated(true);
    } finally {
      setLoginLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // モードに応じた問題リストを構築
  // -----------------------------------------------------------------
  const buildList = useCallback(
    (m) => {
      if (m === "wrong") {
        return QUESTIONS.filter((q) => history?.[q?.id]?.result === "wrong");
      }
      if (m === "review") {
        return QUESTIONS.filter((q) => history?.[q?.id]?.reviewed === true);
      }
      return [...QUESTIONS];
    },
    [history]
  );

  // -----------------------------------------------------------------
  // 出題開始
  // -----------------------------------------------------------------
  const startQuiz = (m, startIndex = 0) => {
    const list = buildList(m);
    if (!list || list.length === 0) {
      console.log("[Quiz] 対象問題が0件のため開始しません", m);
      alert("対象となる問題がありません。");
      return;
    }
    const safeIndex = Math.min(Math.max(startIndex, 0), list.length - 1);
    console.log("[Quiz] 出題モード切り替え:", m, "／ 開始インデックス:", safeIndex);
    setMode(m);
    setQuizList(list);
    setCurrentIndex(safeIndex);
    setSelected(null);
    setShowExp(false);
    setScreen("quiz");
    // モードを即時保存
    persist(userId, { progressMode: m, progressIndex: safeIndex });
    setProgressMode(m);
    setProgressIndex(safeIndex);
  };

  // 続きから再開
  const resumeQuiz = () => {
    console.log(
      "[Resume] 続きから再開:",
      progressMode,
      "問題インデックス:",
      progressIndex
    );
    startQuiz(progressMode || "all", progressIndex || 0);
  };

  // 最初から
  const restartFromBeginning = () => {
    console.log("[Resume] 最初から開始。progressIndexをリセット");
    persist(userId, { progressIndex: 0 });
    setProgressIndex(0);
    startQuiz("all", 0);
  };

  // -----------------------------------------------------------------
  // 解答
  // -----------------------------------------------------------------
  const handleAnswer = (choiceIndex) => {
    if (showExp) return; // 二重解答防止
    const q = quizList?.[currentIndex];
    if (!q) return;
    const correct = choiceIndex === q?.answer;
    setSelected(choiceIndex);
    setShowExp(true);

    const newHistory = {
      ...history,
      [q.id]: {
        ...(history?.[q.id] || {}),
        result: correct ? "correct" : "wrong",
        reviewed: history?.[q.id]?.reviewed || false,
        lastAnsweredAt: new Date().toISOString(),
      },
    };
    setHistory(newHistory);

    // 進捗インデックス（何問目まで進んだか）を保存
    const nextIndex = currentIndex + 1;
    setProgressIndex(nextIndex);
    console.log(
      "[Answer] Q" + q.id,
      correct ? "正解" : "不正解",
      "／ progressIndex:",
      nextIndex
    );
    persist(userId, {
      history: newHistory,
      progressIndex: nextIndex,
      progressMode: mode,
    });
  };

  // 要復習トグル
  const toggleReview = () => {
    const q = quizList?.[currentIndex];
    if (!q) return;
    const cur = history?.[q.id]?.reviewed || false;
    const newHistory = {
      ...history,
      [q.id]: {
        ...(history?.[q.id] || {}),
        reviewed: !cur,
      },
    };
    setHistory(newHistory);
    console.log("[Review] Q" + q.id, "要復習:", !cur);
    persist(userId, { history: newHistory });
  };

  // 次の問題 / 完走
  const handleNext = () => {
    const isLast = currentIndex >= quizList.length - 1;
    if (isLast) {
      // 全問完走 → progressIndexをリセット
      console.log("[Quiz] 全問完走。progressIndexを0にリセット");
      persist(userId, { progressIndex: 0 });
      setProgressIndex(0);
      setScreen("dashboard");
      return;
    }
    const next = currentIndex + 1;
    setCurrentIndex(next);
    setSelected(null);
    setShowExp(false);
  };

  // ホームへ戻る（現在地を保存）
  const goHome = () => {
    console.log("[Nav] ホームへ戻る。現在のprogressIndexを保存:", currentIndex);
    persist(userId, { progressIndex: currentIndex, progressMode: mode });
    setProgressIndex(currentIndex);
    setScreen("dashboard");
  };

  // -----------------------------------------------------------------
  // 集計（レーダーチャート / バッジ）
  // -----------------------------------------------------------------
  const answeredCount = QUESTIONS.filter((q) => history?.[q?.id]?.result).length;
  const correctCount = QUESTIONS.filter(
    (q) => history?.[q?.id]?.result === "correct"
  ).length;
  const wrongCount = QUESTIONS.filter(
    (q) => history?.[q?.id]?.result === "wrong"
  ).length;
  const reviewCount = QUESTIONS.filter((q) => history?.[q?.id]?.reviewed).length;

  const catStats = (cat) => {
    const list = QUESTIONS.filter((q) => q?.category === cat);
    const total = list.length;
    const corr = list.filter(
      (q) => history?.[q?.id]?.result === "correct"
    ).length;
    return total > 0 ? Math.round((corr / total) * 100) : 0;
  };

  const radarData = [
    {
      metric: "総合進捗率",
      value: TOTAL > 0 ? Math.round((answeredCount / TOTAL) * 100) : 0,
    },
    {
      metric: "全問正解率",
      value: TOTAL > 0 ? Math.round((correctCount / TOTAL) * 100) : 0,
    },
    {
      metric: "回答正確性",
      value:
        answeredCount > 0
          ? Math.round((correctCount / answeredCount) * 100)
          : 0,
    },
    { metric: CAT_VALUE, value: catStats(CAT_VALUE) },
    { metric: CAT_DERIV, value: catStats(CAT_DERIV) },
  ];

  // ===================================================================
  // レンダリング
  // ===================================================================

  // 1. 初期認証通信中はスピナー
  if (!authReady) {
    return <Spinner label="接続を準備しています..." />;
  }

  // 2. 合言葉ログイン未完了 → 必ずログイン画面のみ表示（フライング表示厳禁）
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 rounded-full bg-indigo-100 p-3">
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              スマート問題集 2-9
            </h1>
            <p className="text-sm text-slate-500">現代のファイナンス</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-slate-600">
                <User className="h-4 w-4" /> 合言葉（ユーザーID）
              </label>
              <input
                type="text"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="例：myStudy2026"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                disabled={loginLoading}
              />
              <p className="mt-1 text-xs text-slate-400">
                同じ合言葉を入力すれば、PC・スマホ間で学習履歴が同期されます。
              </p>
            </div>

            {loginError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> 読み込み中...
                </>
              ) : (
                <>
                  この合言葉で開始 <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. ログイン後：出題画面
  if (screen === "quiz") {
    const q = quizList?.[currentIndex];
    if (!q) {
      return <Spinner label="問題を読み込み中..." />;
    }
    const Fig = q?.figure ? FIGURES[q.figure] : null;
    const FigJuyou = q?.figureInJuyou ? FIGURES[q.figureInJuyou] : null;
    const FigSeikai = q?.figureInSeikai ? FIGURES[q.figureInSeikai] : null;
    const reviewed = history?.[q.id]?.reviewed || false;

    return (
      <div className="min-h-screen bg-slate-50 pb-16">
        {/* ヘッダー */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
          <button
            onClick={goHome}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            <Home className="h-4 w-4" /> ホーム
          </button>
          <span className="text-sm font-medium text-slate-500">
            {currentIndex + 1} / {quizList?.length} 問
          </span>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6">
          {/* 問題カード */}
          <div className="rounded-2xl bg-white p-5 shadow-sm md:p-7">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-600 px-3 py-1 text-sm font-bold text-white">
                問題 {q.id}
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                出典：{SOURCE}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {q.category}
              </span>
            </div>
            <h2 className="mb-3 text-lg font-bold text-slate-800">{q.title}</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
              {q.question}
            </p>

            {/* 資料 */}
            {q?.shiryo && q.shiryo.length > 0 && (
              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <p className="mb-1 font-semibold text-slate-600">【資　料】</p>
                {q.shiryo?.map((s, i) => (
                  <p key={i} className="text-sm leading-relaxed text-slate-700">
                    {s}
                  </p>
                ))}
              </div>
            )}

            {/* 図表 */}
            {Fig && <Fig />}

            {/* 図の後の資料 */}
            {q?.shiryoAfter &&
              q.shiryoAfter.map((s, i) => (
                <p
                  key={i}
                  className="mt-2 text-sm leading-relaxed text-slate-700"
                >
                  {s}
                </p>
              ))}

            {/* 選択肢 */}
            <div className="mt-5 space-y-3">
              {q.choices?.map((c, i) => {
                let cls =
                  "border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50";
                if (showExp) {
                  if (i === q.answer) {
                    cls = "border-green-500 bg-green-50";
                  } else if (i === selected) {
                    cls = "border-red-500 bg-red-50";
                  } else {
                    cls = "border-slate-200 bg-white opacity-70";
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={showExp}
                    className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${cls}`}
                  >
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {CHOICE_LABELS[i]}
                    </span>
                    <span className="flex-1 text-sm leading-relaxed text-slate-700">
                      {c}
                    </span>
                    {showExp && i === q.answer && (
                      <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    )}
                    {showExp && i === selected && i !== q.answer && (
                      <X className="h-5 w-5 flex-shrink-0 text-red-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 解説 */}
          {showExp && (
            <div className="mt-5 space-y-4">
              {/* 正誤バナー */}
              <div
                className={`flex items-center gap-2 rounded-xl px-5 py-4 font-bold ${
                  selected === q.answer
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {selected === q.answer ? (
                  <>
                    <Check className="h-6 w-6" /> 正解！（解答：
                    {CHOICE_LABELS[q.answer]}）
                  </>
                ) : (
                  <>
                    <X className="h-6 w-6" /> 不正解（正解は
                    {CHOICE_LABELS[q.answer]}）
                  </>
                )}
              </div>

              {/* 要復習チェック */}
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 shadow-sm">
                <input
                  type="checkbox"
                  checked={reviewed}
                  onChange={toggleReview}
                  className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
                <span className="text-sm font-medium text-slate-700">
                  この問題を要復習リストに登録する
                </span>
                {reviewed && (
                  <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                    登録済み
                  </span>
                )}
              </label>

              {/* ここが重要 */}
              <div className="rounded-xl border-l-4 border-indigo-400 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2 font-bold text-indigo-700">
                  <HelpCircle className="h-5 w-5" /> ここが重要
                </div>
                <TextBlock text={q.juyou} />
                {FigJuyou && <FigJuyou />}
              </div>

              {/* 解説（正解の根拠） */}
              <div className="rounded-xl border-l-4 border-green-400 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2 font-bold text-green-700">
                  <BookOpen className="h-5 w-5" /> 解説
                </div>
                <TextBlock text={q.seikai} />
                {FigSeikai && <FigSeikai />}
              </div>

              {/* 次へ */}
              <button
                onClick={handleNext}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white transition hover:bg-indigo-700"
              >
                {currentIndex >= quizList.length - 1 ? (
                  <>
                    完了してホームへ <Home className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    次の問題へ <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // 4. ログイン後：ダッシュボード
  const showResume = (progressIndex || 0) > 0;
  const modeLabel =
    progressMode === "wrong"
      ? "前回不正解のみ"
      : progressMode === "review"
      ? "要復習のみ"
      : "すべての問題";

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              スマート問題集 2-9 ダッシュボード
            </h1>
            <p className="text-xs text-slate-500">現代のファイナンス</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
            <User className="h-4 w-4" /> {userId}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        {/* 途中再開の案内 */}
        {showResume && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
            <p className="mb-3 font-semibold text-amber-800">
              前回は【問題 {progressIndex}】まで進んでいます。中断したモード（
              {modeLabel}モード）の続きから再開しますか？
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={resumeQuiz}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
              >
                続きから再開する <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={restartFromBeginning}
                className="flex items-center gap-2 rounded-lg border border-amber-400 bg-white px-4 py-2 font-semibold text-amber-700 hover:bg-amber-100"
              >
                <RefreshCw className="h-4 w-4" /> 最初から始める
              </button>
            </div>
          </div>
        )}

        {/* 集計バッジ */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "総問題数", value: TOTAL, color: "text-slate-700" },
            { label: "正解", value: correctCount, color: "text-green-600" },
            { label: "不正解", value: wrongCount, color: "text-red-600" },
            { label: "要復習", value: reviewCount, color: "text-amber-600" },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-4 text-center shadow-sm"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* レーダーチャート */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 font-bold text-slate-700">
            <BarChart2 className="h-5 w-5 text-indigo-600" /> 学習状況レーダー
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: "#475569" }}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="達成度"
                  dataKey="value"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* モード選択 */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="mb-3 font-bold text-slate-700">出題モードを選択</p>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              onClick={() => startQuiz("all", 0)}
              className="flex items-center justify-between rounded-xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3 font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              すべての問題
              <span className="rounded-full bg-white px-2 py-0.5 text-xs">
                {TOTAL}
              </span>
            </button>
            <button
              onClick={() => startQuiz("wrong", 0)}
              disabled={wrongCount === 0}
              className="flex items-center justify-between rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              前回不正解の問題のみ
              <span className="rounded-full bg-white px-2 py-0.5 text-xs">
                {wrongCount}
              </span>
            </button>
            <button
              onClick={() => startQuiz("review", 0)}
              disabled={reviewCount === 0}
              className="flex items-center justify-between rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
            >
              要復習の問題のみ
              <span className="rounded-full bg-white px-2 py-0.5 text-xs">
                {reviewCount}
              </span>
            </button>
          </div>
        </div>

        {/* 履歴一覧 */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="mb-3 font-bold text-slate-700">全問題の正誤状況</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {QUESTIONS.map((q) => {
              const h = history?.[q?.id] || {};
              const status = h?.result || "untouched";
              const badge =
                status === "correct"
                  ? { t: "正解", c: "bg-green-100 text-green-700" }
                  : status === "wrong"
                  ? { t: "不正解", c: "bg-red-100 text-red-700" }
                  : { t: "未着手", c: "bg-slate-100 text-slate-500" };
              return (
                <div
                  key={q.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {q.id}
                  </span>
                  <span className="flex-1 truncate text-sm text-slate-700">
                    {q.title}
                  </span>
                  {h?.reviewed && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                      復習
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge.c}`}
                  >
                    {badge.t}
                  </span>
                </div>
              );
            })}
          </div>
          {/* 最終解答日時 */}
          <div className="mt-4 border-t pt-3">
            <p className="mb-1 text-xs font-semibold text-slate-400">
              最終解答日時
            </p>
            <div className="space-y-1">
              {QUESTIONS.filter((q) => history?.[q?.id]?.lastAnsweredAt).map(
                (q) => (
                  <p key={q.id} className="text-xs text-slate-500">
                    問題{q.id}：
                    {new Date(history[q.id].lastAnsweredAt).toLocaleString(
                      "ja-JP"
                    )}
                  </p>
                )
              )}
              {answeredCount === 0 && (
                <p className="text-xs text-slate-400">
                  まだ解答履歴はありません。
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}