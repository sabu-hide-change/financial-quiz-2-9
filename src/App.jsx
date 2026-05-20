// npm install lucide-react recharts firebase
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  Check, X, Home, ChevronRight, RotateCcw, 
  BookOpen, Star, AlertTriangle, Play, RefreshCw, User, Award, ArrowLeft
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- CONFIGURATION ---
const APP_ID = "QuizApp_001_Finance";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- QUIZ DATA ---
const quizData = [
  {
    id: 1,
    title: "問題 1 ゼロ成長モデル",
    category: "現代のファイナンス",
    question: "次の資料は、I社に関するものである。この資料に基づいた場合、I社の企業価値として、最も適切なものを下記の解答群から選べ。",
    info: [
      "１．I社が毎年得られるフリー・キャッシュ・フローは、1,000万円と予測されている。",
      "２．資本コストは、10％である。",
      "３．企業価値は、DCF法により計算する。"
    ],
    options: [
      { key: "ア", text: "1,100万円" },
      { key: "イ", text: "1億円" },
      { key: "ウ", text: "1億1,000万円" },
      { key: "エ", text: "2億円" },
      { key: "オ", text: "3億円" }
    ],
    answer: "イ",
    explanation: {
      keyPoint: "本問では、ゼロ成長モデルについて問われています。企業価値は、企業全体の価値を金額で表したものです。企業価値の評価方法の一つに、DCF法があります。\n● DCF法 （Discount Cash Flow Method）\n企業が将来生み出すキャッシュ・フローを、現在価値に割引いて、企業価値を計算する\n● ゼロ成長モデル （将来のフリー・キャッシュ・フローが毎年同じ場合のモデル）\n〈数 式〉 企業価値 ＝ FCF / r\nFCF：将来のフリー・キャッシュ・フロー、 r：資本コスト\nフリー・キャッシュ・フローを求める計算式、加重平均資本コストを求める計算式についても復習しておきましょう。",
      detail: "正解：イ 1億円\nI社の企業価値は、 DCF法 （ ゼロ成長モデル ）により、次のように計算されます。\n\n企業価値 ＝ FCF / r\n＝ 1,000 / 0.1\n＝ 10,000万円\n＝ 1億円\nよって、イが適切です。"
    }
  },
  {
    id: 2,
    title: "問題 2 定率成長モデル",
    category: "現代のファイナンス",
    question: "次の資料は、J社に関するものである。この資料に基づいた場合、J社の企業価値として、最も適切なものを下記の解答群から選べ。",
    info: [
      "１．J社が1年後に得られるフリー・キャッシュ・フローは、1,000万円と予測されている。",
      "２．J社がその後1年ごとに得られるフリー・キャッシュ・フローの成長率は5％と予測されている。",
      "３．資本コストは、10％である。",
      "４．企業価値は、DCF法により計算する。"
    ],
    options: [
      { key: "ア", text: "1,100万円" },
      { key: "イ", text: "1億円" },
      { key: "ウ", text: "1億1,000万円" },
      { key: "エ", text: "2億円" },
      { key: "オ", text: "3億円" }
    ],
    answer: "エ",
    explanation: {
      keyPoint: "本問では、定率成長モデルについて問われています。\n● 定率成長モデル （将来のフリー・キャッシュ・フローが一定率で成長する場合のモデル）\n〈数 式〉 企業価値 ＝ FCF / (r － g) （r ＞ g）\nFCF：第1期のフリー・キャッシュ・フロー、 r：資本コスト、 g：フリー・キャッシュ・フローの成長率\n定率成長モデルは、ゴードンの成長モデルと呼ばれることもあります。この計算式において、資本コストがフリー・キャッシュ・フローの成長率を上回っていることが必要となります。",
      detail: "正解：エ 2億円\nJ社の企業価値は、 DCF法 （ 定率成長モデル ）により、次のように計算されます。\n\n企業価値 ＝ FCF / (r － g)\n＝ 1,000 / (0.1 － 0.05)\n＝ 1,000 / 0.05\n＝ 20,000万円\n＝ 2億円\nよって、エが適切です。"
    }
  },
  {
    id: 3,
    title: "問題 3 収益還元法",
    category: "現代のファイナンス",
    question: "次の資料は、K社に関するものである。この資料に基づいた場合、K社の企業価値として、最も適切なものを下記の解答群から選べ。",
    info: [
      "１．K社は、永続的に毎年一定の税引後利益を得るものと予測されている。",
      "２．K社が永続的に毎年得る予想税引後利益は、1,000万円である。",
      "３．資本還元率は、10％である。",
      "４．企業価値は、収益還元法により計算する。"
    ],
    options: [
      { key: "ア", text: "1億円" },
      { key: "イ", text: "1億1,000万円" },
      { key: "ウ", text: "1億5,000万円" },
      { key: "エ", text: "2億円" },
      { key: "オ", text: "3億円" }
    ],
    answer: "ア",
    explanation: {
      keyPoint: "本問では、収益還元法について問われています。\n● 収益還元法\n会計上の利益から企業価値を求める\n〈数 式〉 企業価値 ＝ 予想税引後利益 / 資本還元率\nDCF法のゼロ成長モデル（毎年のキャッシュ・フローが一定の場合）の式とよく似ていますが、収益還元法では、フリー・キャッシュ・フローの代わりに税引後利益を用いている点に注意しましょう。",
      detail: "正解：ア 1億円\nK社の企業価値は、 収益還元法 により、次のように計算されます。\n\n企業価値 ＝ 予想税引後利益 / 資本還元率\n＝ 1,000 / 0.1\n＝ 10,000万円\n＝ 1億円\nよって、アが適切です。"
    }
  },
  {
    id: 4,
    title: "問題 4 配当還元法",
    category: "現代のファイナンス",
    question: "次の資料は、L社に関するものである。この資料に基づいた場合、L社の企業価値として、最も適切なものを下記の解答群から選べ。",
    info: [
      "１．L社は、永続的に毎年一定の配当を行うものと予測されている。",
      "２．L社が永続的に毎年行う配当額は、1,000万円である。",
      "３．資本還元率は、10％である。",
      "４．株主価値は、配当還元法により計算する。",
      "５．企業価値は、株主価値と負債価値を合計したものである。",
      "６．L社の負債価値は、1億円である。"
    ],
    options: [
      { key: "ア", text: "1億円" },
      { key: "イ", text: "1億1,000万円" },
      { key: "ウ", text: "1億5,000万円" },
      { key: "エ", text: "2億円" },
      { key: "オ", text: "3億円" }
    ],
    answer: "エ",
    explanation: {
      keyPoint: "本問では、配当還元法について問われています。\n● 配当還元法\n毎期の配当から企業価値を求める\n〈数 式〉 株主価値 ＝ 配当額 / 資本還元率\n企業価値 ＝ 株主価値 ＋ 負債価値\nDCF法、収益還元法、配当還元法は、いずれも将来獲得されるリターンを現在価値に割引いて評価するものです。リターンの定義（キャッシュインフロー、利益、配当）は異なりますが、いずれも インカム・アプローチ による評価方法です。",
      detail: "正解：エ 2億円\nL社の株主価値は、 配当還元法 により、次のように計算されます。\n\n株主価値 ＝ 配当額 / 資本還元率\n＝ 1,000 / 0.1\n＝ 10,000万円 ＝ 1億円\n\nL社の企業価値は、次のように計算されます。\n企業価値 ＝ 株主価値 ＋ 負債価値\n＝ 1億円 ＋ 1億円\n＝ 2億円\nよって、エが適切です。"
    }
  },
  {
    id: 5,
    title: "問題 5 簿価純資産法・時価純資産法",
    category: "現代のファイナンス",
    question: "次の資料は、M社に関するものである。この資料に基づいた場合、M社の株主価値に関する説明として、最も適切なものを下記の解答群から選べ。",
    info: [
      "１．M社の資産と負債は、次のとおりである。",
      "【M社 資産・負債データ】",
      "・帳簿価額: 資産 5,000万円 / 負債 2,000万円",
      "・時価: 資産 6,000万円 / 負債 2,000万円",
      "２．株主価値は、簿価純資産法または時価純資産法により計算する。"
    ],
    tableData: [
      { label: "帳簿価額", asset: "5,000 万円", debt: "2,000 万円" },
      { label: "時価", asset: "6,000 万円", debt: "2,000 万円" }
    ],
    options: [
      { key: "ア", text: "簿価純資産法による株主価値は3,000万円であり、時価純資産法による株主価値は3,000万円である。" },
      { key: "イ", text: "簿価純資産法による株主価値は3,000万円であり、時価純資産法による株主価値は4,000万円である。" },
      { key: "ウ", text: "簿価純資産法による株主価値は4,000万円であり、時価純資産法による株主価値は3,000万円である。" },
      { key: "エ", text: "簿価純資産法による株主価値は5,000万円であり、時価純資産法による株主価値は6,000万円である。" }
    ],
    answer: "イ",
    explanation: {
      keyPoint: "本問では、簿価純資産法・時価純資産法について問われています。\n● 簿価純資産法\n〈数 式〉 株主価値 ＝ 資産（簿価） － 負債（簿価）\n● 時価純資産法\n〈数 式〉 株主価値 ＝ 資産（時価） － 負債（時価）\nこれらは企業の所有する資産・負債を個別評価する『コスト・アプローチ』に分類されます。他には『インカム・アプローチ』や、市場株価等を利用する『マーケット・アプローチ』があります。",
      detail: "正解：イ\n■ 簿価純資産法\n株主価値 ＝ 5,000 － 2,000 ＝ 3,000万円\n■ 時価純資産法\n株主価値 ＝ 6,000 － 2,000 ＝ 4,000万円\nよって、イが適切です。"
    }
  },
  {
    id: 6,
    title: "問題 6 M&Aの手法",
    category: "現代のファイナンス",
    question: "買収される企業の資産や将来性を担保に、資金を金融機関から借り入れて、その資金で買収するM&Aの手法を表す用語として、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "TOB" },
      { key: "イ", text: "MBO" },
      { key: "ウ", text: "EBO" },
      { key: "エ", text: "LBO" }
    ],
    answer: "エ",
    explanation: {
      keyPoint: "本問では、M&Aの手法について問われています。\n● LBO (Leveraged Buy Out): 買収される企業の資産や将来性を担保に借入を起こして買収する手法。レバレッジ（てこ）を効かせるため少ない自己資金で大型買収が可能。\n● MBO (Management Buy Out): 現在の経営陣が自社や事業を買収すること。\n● EBO (Employee Buy Out): 従業員が資金を出し合って経営権を取得すること。\n● TOB (Take Over Bid): 株式公開買い付け。不特定多数から市場外で直接買い付ける手法。",
      detail: "正解：エ LBO\n買収対象の資産を担保にするため、レバレッジド・バイアウトと呼ばれます。この基本用語は「企業経営理論」でも出題される重要な内容です。"
    }
  },
  {
    id: 7,
    title: "問題 7 MM理論",
    category: "現代のファイナンス",
    question: "MM理論に関する説明として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "法人税が存在しない完全資本市場では、企業価値はその資本構成に依存しない。" },
      { key: "イ", text: "法人税が存在しない完全資本市場では、最適資本構成が存在しない。" },
      { key: "ウ", text: "法人税が存在しない完全資本市場では、加重平均資本コストの最小値が存在する。" },
      { key: "エ", text: "法人税が存在する現実では、企業価値はその資本構成に依存する。" }
    ],
    answer: "ウ",
    explanation: {
      keyPoint: "本問では、MM理論について問われています。完全資本市場（法人税なし）における資本構成の議論です。\n【法人税がない完全資本市場の結論】\n1. 企業価値は資本構成に依存しない\n2. 最適資本構成は存在しない\n3. 加重平均資本コスト(WACC)は一定である\n※現実世界（法人税あり）では、支払利息の損金算入（節税効果）がある一方、負債が増えすぎると財務リスク（倒産リスク）が高まるため、最適資本構成（WACCの最小値）が存在します。",
      detail: "正解：ウ（不適切）\n法人税が存在しない完全資本市場では、負債増加によるWACC低下効果と、財務レバレッジによる株主資本コスト上昇効果が完全に相殺し合うため、加重平均資本コストは常に一定となり、最小値は存在しません。したがってウの記述が誤り（不適切）です。"
    }
  },
  {
    id: 8,
    title: "問題 8 理論株価",
    category: "現代のファイナンス",
    question: "次の資料は、N社とO社に関するものである。この資料に基づいた場合、N社とO社の理論株価に関する説明として、最も適切なものを下記の解答群から選べ。",
    info: [
      "１．N社、O社ともに1年後の配当総額は、100万円である。",
      "２．N社の毎期の配当総額は、一定である。",
      "３．O社の配当総額は、毎期5％だけ成長する。",
      "４．株主価値は、配当還元法により計算する。",
      "５．資本還元率は、10％である。",
      "６．N社、O社ともに発行済株式数は、1,000株である。"
    ],
    options: [
      { key: "ア", text: "N社の理論株価は1万円であり、O社の理論株価は1万円である。" },
      { key: "イ", text: "N社の理論株価は2万円であり、O社の理論株価は1万円である。" },
      { key: "ウ", text: "N社の理論株価は1万円であり、O社の理論株価は2万円である。" },
      { key: "エ", text: "N社の理論株価は2万円であり、O社の理論株価は2万円である。" }
    ],
    answer: "ウ",
    explanation: {
      keyPoint: "本問では、理論株価の計算を問われています。\n〈数 式〉 理論株価 ＝ 株主価値 ÷ 発行済株式数\n成長する企業(O社)は定率成長モデルを、一定の企業(N社)はゼロ成長モデルの考え方を配当に適用します。",
      detail: "正解：ウ\n(1) N社 (成長なし)\n株主価値 ＝ 配当額 / 資本還元率 ＝ 100万円 / 0.1 ＝ 1,000万円\n理論株価 ＝ 1,000万円 ÷ 1,000株 ＝ 1万円/株\n\n(2) O社 (5%定率成長)\n株主価値 ＝ 配当額 / (資本還元率 － 成長率) ＝ 100万円 / (0.1 － 0.05) ＝ 2,000万円\n理論株価 ＝ 2,000万円 ÷ 1,000株 ＝ 2万円/株\nよって、ウが適切です。"
    }
  },
  {
    id: 9,
    title: "問題 9 株価収益率",
    category: "現代のファイナンス",
    question: "株価収益率に関する説明として、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "株価収益率は、株価を1株当たり当期純利益で割って計算される。" },
      { key: "イ", text: "株価収益率は、当期純利益を発行済株式数で割って計算される。" },
      { key: "ウ", text: "株価収益率は、株価を1株当たり純資産額で割って計算される。" },
      { key: "エ", text: "株価収益率は、純資産額を発行済株式数で割って計算される。" }
    ],
    answer: "ア",
    explanation: {
      keyPoint: "本問では、株価収益率(PER)および関連指標の定義が問われています。\n● 株価収益率 （ PER ：Price Earning Ratio）\n〈数 式〉 PER ＝ 株価 ÷ 1株あたり当期純利益(EPS)\n● 1株あたり当期純利益 （ EPS ）\n〈数 式〉 EPS ＝ 当期純利益 ÷ 発行済株式数\nPERが低いほど、純利益に比べて株価が安く割安と判断されます。",
      detail: "正解：ア\nア：〇 記述通り適切です。\nイ：× これは1株当たり当期純利益(EPS)の説明です。\nウ：× これは株価純資産倍率(PBR)の説明です。\nエ：× これは1株当たり純資産(BPS)の説明です。"
    }
  },
  {
    id: 10,
    title: "問題 10 株価純資産倍率",
    category: "現代のファイナンス",
    question: "次の資料は、P社に関するものである。この資料に基づいた場合、P社の株価純資産倍率として、最も適切なものを下記の解答群から選べ。",
    info: [
      "【P社 財務資料】",
      "・売上高: 2億円",
      "・税引後当期利益: 1,000万円",
      "・当期支払配当総額: 100万円",
      "・純資産額: 1億円",
      "・発行済株式数: 10万株",
      "・株価: 1,500円"
    ],
    tableData: [
      { k: "売上高", v: "2 億円" },
      { k: "税引後当期利益", v: "1,000 万円" },
      { k: "当期支払配当総額", v: "100 万円" },
      { k: "純資産額", v: "1 億円" },
      { k: "発行済株式数", v: "10 万株" },
      { k: "株価", v: "1,500 円" }
    ],
    options: [
      { key: "ア", text: "0.75倍" },
      { key: "イ", text: "1倍" },
      { key: "ウ", text: "1.5倍" },
      { key: "エ", text: "15倍" },
      { key: "オ", text: "150倍" }
    ],
    answer: "ウ",
    explanation: {
      keyPoint: "本問では、株価純資産倍率(PBR)について問われています。\n● 株価純資産倍率 （ PBR ：Price Book-value Ratio）\n〈数 式〉 PBR ＝ 株価 ÷ 1株あたり純資産額(BPS)\n● 1株あたり純資産額 （ BPS ）\n〈数 式〉 BPS ＝ 純資産額 ÷ 発行済株式数",
      detail: "正解：ウ 1.5倍\n(1) BPSを求める\nBPS ＝ 1億円 ÷ 10万株 ＝ 1,000円/株\n(2) PBRを求める\nPBR ＝ 1,500円 ÷ 1,000円 ＝ 1.5倍\nよってウが適切です。売上高や配当などのダミーデータに惑わされないようにしましょう。"
    }
  },
  {
    id: 11,
    title: "問題 11 配当利回り",
    category: "現代のファイナンス",
    question: "次の資料は、Q社に関するものである。この資料に基づいた場合、Q社の配当利回りの値として、最も適切なものを下記の解答群から選べ。",
    info: [
      "【Q社 指標資料】",
      "・株価純資産倍率 (PBR): 2.5倍",
      "・配当性向: 50%",
      "・自己資本利益率 (ROE): 10%"
    ],
    tableData: [
      { pbr: "2.5 倍", payout: "50%", roe: "10%" }
    ],
    options: [
      { key: "ア", text: "1％" },
      { key: "イ", text: "2％" },
      { key: "ウ", text: "3％" },
      { key: "エ", text: "4％" },
      { key: "オ", text: "5％" }
    ],
    answer: "イ",
    explanation: {
      keyPoint: "各配当関連指標の相互関係を把握する応用問題です。\n● 配当利回り ＝ 1株あたり配当 ÷ 株価 ＝ 配当総額 ÷ 時価総額\n● 配当性向 ＝ 配当総額 ÷ 当期純利益\n● PBR ＝ 時価総額 ÷ 純資産(自己資本)\n● ROE ＝ 当期純利益 ÷ 自己資本\nこれらの関係を展開すると、次の分解式が成り立ちます：\nROE ＝ PBR × 配当利回り ÷ 配当性向",
      detail: "正解：イ 2％\n関係式： ROE ＝ PBR × 配当利回り ÷ 配当性向 に数値を代入します。\n10% ＝ 2.5 × 配当利回り ÷ 50%\n0.1 ＝ 2.5 × 配当利回り ÷ 0.5\n配当利回り ＝ 0.1 × 0.5 ÷ 2.5 ＝ 0.02 ＝ 2%\nよって、イが適切です。"
    }
  },
  {
    id: 12,
    title: "問題 12 為替予約",
    category: "現代のファイナンス",
    question: "次の資料は、R社に関するものである。この資料に基づいた場合、為替予約に関する説明として、最も適切なものを下記の解答群から選べ。",
    info: [
      "１．R社は3ヵ月後に、X銀行から1ユーロ100円の為替相場で1ユーロを買うという先物為替予約をした。",
      "２．損益の構造（グラフのイメージ）:",
      "   ・為替予約価格100円を交点として、右上がり(円安方向で利益)の実線①",
      "   ・右下がり(円安方向で損失)の点線②"
    ],
    options: [
      { key: "ア", text: "この損益図で描かれる青色の実線①は、X銀行の損益を表している。" },
      { key: "イ", text: "この損益図で描かれる赤色の点線②は、R社の損益を表している。" },
      { key: "ウ", text: "3ヵ月後において、為替予約価格1ユーロ100円より円高・ユーロ安になると、R社はプラスの利益を得ることができる。" },
      { key: "エ", text: "3ヵ月後において、為替予約価格1ユーロ100円より円安・ユーロ高になると、R社はプラスの利益を得ることができる。" }
    ],
    answer: "エ",
    explanation: {
      keyPoint: "為替予約価格（100円/ユーロ）で「買う権利」ではなく「買う契約（義務）」をした場合の損益です。\n● ユーロの買い手 (R社): 将来円安（例えば110円）になれば、100円で安く買えるため利益が出ます。グラフは右上がり（実線①）になります。\n● ユーロの売り手 (X銀行): 逆に対称の損益となり、円安時は損失を被るため、グラフは右下がり（点線②）になります。",
      detail: "正解：エ\nア: × 実線①はR社（買い手）の損益です。\nイ: × 点線②はX銀行（売り手）の損益です。\nウ: × 円高になるとR社は市場より高い100円で買わねばならず損失になります。\nエ: 〇 記述通り。円安になると、R社は市場より安い100円で調達できるため利益を得ます。"
    }
  },
  {
    id: 13,
    title: "問題 13 先渡取引（フォワード）と先物取引（フューチャー）",
    category: "現代のファイナンス",
    question: "先渡取引（フォワード）と先物取引（フューチャー）に関する説明として、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "先渡取引（フォワード）と先物取引（フューチャー）は、いずれも所定の原資産を将来の一定時点に所定の価格で売買する契約である。" },
      { key: "イ", text: "先渡取引（フォワード）と先物取引（フューチャー）は、いずれも店頭取引として行われる。" },
      { key: "ウ", text: "先物取引（フューチャー）では、原資産、取引条件などは取引の当事者間で任意に取り決める。" },
      { key: "エ", text: "先渡取引（フォワード）では、契約の履行を取引所が保証しているため、信用リスクは少ない。" }
    ],
    answer: "ア",
    explanation: {
      keyPoint: "フォワード（先渡）とフューチャー（先物）の違いの整理です。\n\n| 項目 | 先渡取引(フォワード) | 先物取引(フューチャー) |\n| --- | --- | --- |\n| 取引方法 | 店頭取引 (相対) | 取引所取引 |\n| 取引単位 | 自由 (オーダーメイド) | 標準化 (レディメイド) |\n| 反対売買 | 原則期日決済 | 期日前反対売買が多い |\n| 信用リスク | あり | 基本的にない (取引所保証) |\n| 証拠金 | 不要 | 必要 |",
      detail: "正解：ア\nア: 〇 ともに将来の一定時点に特定価格で売買する契約という本質は同一です。\nイ: × 先物は取引所取引です。\nウ: × 任意に取り決めるのは先渡（フォワード）です。\nエ: × 取引所が保証し信用リスクが少ないのは先物（フューチャー）です。"
    }
  },
  {
    id: 14,
    title: "問題 14 オプション取引",
    category: "現代のファイナンス",
    question: "オプション取引に関する説明として、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "オプション取引とは、決められた期間内にあらかじめ決められた価格で取引する権利を取引するものである。" },
      { key: "イ", text: "オプション取引では、売る権利のことをコール･オプション、買う権利のことをプット･オプションと呼ぶ。" },
      { key: "ウ", text: "満期日のみ権利を行使できるタイプのオプションを、アメリカンタイプという。" },
      { key: "エ", text: "満期日以前であればいつでも権利を行使できるタイプのオプションを、ヨーロピアンタイプという。" }
    ],
    answer: "ア",
    explanation: {
      keyPoint: "オプション取引の基本定義と用語の整理です。\n● オプション: 権利のこと（為替予約のような義務ではないため放棄可能）。\n● コール・オプション: 買う権利\n● プット・オプション: 売る権利\n● ヨーロピアンタイプ: 満期日のみ権利行使可能\n● アメリカンタイプ: 満期日前ならいつでも権利行使可能",
      detail: "正解：ア\nア: 〇 正しい記述です。\nイ: × 逆です。売る権利＝プット、買う権利＝コールです。\nウ: × 満期日のみはヨーロピアンタイプです。\nエ: × いつでも行使できるのはアメリカンタイプです。"
    }
  },
  {
    id: 15,
    title: "問題 15 プット・オプション",
    category: "現代のファイナンス",
    question: "次の資料は、S社に関するものである。この資料に基づいた場合、プット・オプションに関する説明として、最も適切なものを下記の解答群から選べ。",
    info: [
      "１．S社は将来時点において、Y銀行に1ユーロ100円の為替相場で1ユーロを売るという権利（プット・オプション）を、オプション料2円で購入した。",
      "２．損益の特徴:",
      "   ・買い手(S社)は、円安時は権利放棄により損失がオプション料(2円)に限定。円高時は権利行使で無限の利益余地。"
    ],
    options: [
      { key: "ア", text: "この損益図で描かれる青色の実線①（円安で利益が一定、円高で損失拡大）は、S社の損益を表している。" },
      { key: "イ", text: "この損益図で描かれる赤色の点線②（円安で損失一定、円高で利益拡大）は、S社の損益を表している。" },
      { key: "ウ", text: "将来時点において、1ユーロ98円より円高・ユーロ安になると、S社は損失を被ることになる。" },
      { key: "エ", text: "将来時点において、1ユーロ98円より円高・ユーロ安になると、Y銀行は利益を得ることになる。" }
    ],
    answer: "イ",
    explanation: {
      keyPoint: "プット・オプション（売る権利）の買い手（S社）と売り手（Y銀行）の損益構造です。\n● プットの買い手 (S社): 円安（110円）時は、市場で売った方が得なので権利放棄し、損失はオプション料（2円）に限定。円高（90円）時は、100円で売れる権利を行使して利益（100-90-2 = 8円）を獲得。よって赤点線②がS社です。\n● プットの売り手 (Y銀行): 買い手の逆となり、円安時はオプション料が丸儲け、円高時は損失が拡大（青実線①）。",
      detail: "正解：イ\nア: × 青実線①は売り手であるY銀行の損益です。\nイ: 〇 点線②が買い手であるS社の損益です。\nウ: × 98円より円高になればなるほど、S社は権利行使によりプラスの利益になります。\nエ: × 98円より円高になると、Y銀行は損失を被ります。"
    }
  },
  {
    id: 16,
    title: "問題 16 オプション価格",
    category: "現代のファイナンス",
    question: "次の文章の空欄Ａ～Ｄに入る語句の組み合わせとして、最も適切なものはどれか。\n「オプション価格は、（ Ａ ）価値と（ Ｂ ）価値により構成される。以下の図は（ Ｃ ）オプションの価値を示している。（ Ｃ ）オプションでは、原資産価格が権利行使価格と比較して、（ Ｄ ）とき、（ Ａ ）価値が存在する。」",
    options: [
      { key: "ア", text: "Ａ 時間的 Ｂ 根本的 Ｃ コール Ｄ 高い" },
      { key: "イ", text: "Ａ 時間的 Ｂ 根本的 Ｃ プット Ｄ 低い" },
      { key: "ウ", text: "Ａ 本質的 Ｂ 時間的 Ｃ プット Ｄ 低い" },
      { key: "エ", text: "Ａ 本質的 Ｂ 時間的 Ｃ コール Ｄ 高い" }
    ],
    answer: "エ",
    explanation: {
      keyPoint: "オプション価格（プレミアム）の構成要素に関する問題です。\n● オプション料 ＝ 本質的価値 ＋ 時間的価値\n・本質的価値：その時点で権利行使した際に得られる現生価値（マイナスにはならない）。\n・時間的価値：将来の価格変動によって価値がさらに高まることへの期待値。\n※設問の図（原資産価格が高くなるとプレミアムが急上昇する右上がりの形状）は「コール・オプション（買う権利）」の特徴を示しています。コールは原資産が権利行使価格より【高い】ときに本質的価値を持ちます。",
      detail: "正解：エ\nAには「本質的」、Bには「時間的」、Cには「コール」、Dには「高い」が入るため、エが正解です。"
    }
  }
];

export default function App() {
  // --- STATES ---
  const [userId, setUserId] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // User study data synchronized with Firestore
  const [userProgress, setUserProgress] = useState({
    wrongQuestions: {}, // id: boolean
    reviewQuestions: {}, // id: boolean
    history: {}, // id: { answeredAt: string, isCorrect: boolean }
    progressIndex: 0,
    progressMode: "all"
  });

  // App Navigation & Flow States
  const [view, setView] = useState("login"); // login, menu, quiz, history
  const [quizMode, setQuizMode] = useState("all"); // all, wrong, review
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(null); // { index, mode } if resume exists

  // --- ACTIONS & FIREBASE SYNCHRONIZATION ---
  
  // Initialize and check anonymous auth
  useEffect(() => {
    console.log("App initialized. Connecting to authentication...");
    signInAnonymously(auth)
      .then(() => console.log("Firebase Anonymous Auth Success"))
      .catch((err) => console.error("Auth Error:", err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    
    setLoading(true);
    console.log(`Attempting data fetch for User ID: ${userId}`);
    try {
      const docRef = doc(db, APP_ID, userId.trim());
      const docSnap = await getDoc(docRef);
      
      let data = {
        wrongQuestions: {},
        reviewQuestions: {},
        history: {},
        progressIndex: 0,
        progressMode: "all"
      };

      if (docSnap.exists()) {
        console.log("User record found on cloud:", docSnap.data());
        const cloudData = docSnap.data();
        data = {
          wrongQuestions: cloudData.wrongQuestions || {},
          reviewQuestions: cloudData.reviewQuestions || {},
          history: cloudData.history || {},
          progressIndex: cloudData.progressIndex || 0,
          progressMode: cloudData.progressMode || "all"
        };
      } else {
        console.log("No previous data. Allocating new cloud profile.");
        await setDoc(docRef, data);
      }

      setUserProgress(data);
      setIsAuth(true);

      // Check if unfinished progress exists
      if (data.progressIndex > 0) {
        console.log(`Unfinished progress identified: Index ${data.progressIndex} in mode ${data.progressMode}`);
        setResumePrompt({ index: data.progressIndex, mode: data.progressMode });
      }
      
      setView("menu");
    } catch (error) {
      console.error("Firestore loading error:", error);
      alert("データの読み込みに失敗しました。ネットワーク状況を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  const saveProgressToCloud = async (updatedProgress) => {
    if (!userId) return;
    try {
      const docRef = doc(db, APP_ID, userId.trim());
      await updateDoc(docRef, updatedProgress);
      console.log("Cloud sync update success:", updatedProgress);
    } catch (error) {
      console.error("Cloud sync failed:", error);
    }
  };

  const startQuiz = (mode, resumeIndex = null) => {
    console.log(`Configuring quiz playlist for mode: ${mode}`);
    let list = [];
    if (mode === "all") {
      list = [...quizData];
    } else if (mode === "wrong") {
      list = quizData.filter(q => userProgress.wrongQuestions?.[q.id]);
    } else if (mode === "review") {
      list = quizData.filter(q => userProgress.reviewQuestions?.[q.id]);
    }

    if (list.length === 0) {
      alert("該当する問題がありません。");
      return;
    }

    setFilteredQuestions(list);
    setQuizMode(mode);
    
    const targetIndex = resumeIndex !== null ? resumeIndex : 0;
    // Bounds check safety guardrail
    if (targetIndex >= list.length) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(targetIndex);
    }

    setSelectedOption(null);
    setHasAnswered(false);
    setResumePrompt(null);
    setView("quiz");
  };

  const handleAnswerSelect = (optionKey) => {
    if (hasAnswered) return;
    setSelectedOption(optionKey);
    setHasAnswered(true);

    const currentQuestion = filteredQuestions[currentIndex];
    const isCorrect = optionKey === currentQuestion.answer;
    
    console.log(`Answer submission for Q-${currentQuestion.id}: Chosen ${optionKey}, Result: ${isCorrect}`);

    // Update historical structures
    const updatedWrong = { ...userProgress.wrongQuestions };
    if (isCorrect) {
      delete updatedWrong[currentQuestion.id];
    } else {
      updatedWrong[currentQuestion.id] = true;
    }

    const updatedHistory = {
      ...userProgress.history,
      [currentQuestion.id]: {
        answeredAt: new Date().toLocaleString('ja-JP'),
        isCorrect: isCorrect
      }
    };

    // Prepare next index state pointers
    const nextLocalIndex = currentIndex + 1;
    const hasMore = nextLocalIndex < filteredQuestions.length;
    const savedProgressIndex = hasMore ? nextLocalIndex : 0;

    const newProgressState = {
      ...userProgress,
      wrongQuestions: updatedWrong,
      history: updatedHistory,
      progressIndex: savedProgressIndex,
      progressMode: quizMode
    };

    setUserProgress(newProgressState);
    saveProgressToCloud({
      wrongQuestions: updatedWrong,
      history: updatedHistory,
      progressIndex: savedProgressIndex,
      progressMode: quizMode
    });
  };

  const handleReviewToggle = (questionId, currentValue) => {
    const updatedReview = {
      ...userProgress.reviewQuestions,
      [questionId]: !currentValue
    };
    if (!updatedReview[questionId]) {
      delete updatedReview[questionId];
    }

    setUserProgress(prev => ({ ...prev, reviewQuestions: updatedReview }));
    saveProgressToCloud({ reviewQuestions: updatedReview });
    console.log(`Review flag modification triggered for question ${questionId}`);
  };

  const advanceNextQuestion = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      console.log("End of current quiz playlist track achieved.");
      // Completed, wipe index tracking record on cloud
      const resetState = {
        ...userProgress,
        progressIndex: 0
      };
      setUserProgress(resetState);
      saveProgressToCloud({ progressIndex: 0 });
      alert("選択されたモードのすべての問題を解き終えました！");
      setView("menu");
    }
  };

  const quitToMenu = () => {
    console.log(`Interrupted return to terminal dashboard. Maintaining index marker: ${currentIndex}`);
    // Save current location fallback
    saveProgressToCloud({
      progressIndex: currentIndex,
      progressMode: quizMode
    });
    setView("menu");
  };

  // Score stats parsing calculations
  const calculateAccuracyStats = () => {
    const totalTracked = Object.keys(userProgress.history || {}).length;
    const correctCount = Object.values(userProgress.history || {}).filter(h => h.isCorrect).length;
    return {
      totalTracked,
      correctCount,
      rate: totalTracked > 0 ? Math.round((correctCount / totalTracked) * 100) : 0
    };
  };

  // --- VIEW RENDERS ---

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 font-sans p-6">
        <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-lg font-medium">クラウドデータを同期しています...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* HEADER SECTION */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-lg tracking-tight">スマート問題集 2-9 現代のファイナンス</span>
          </div>
          {isAuth && (
            <div className="flex items-center space-x-3 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold truncate max-w-[120px]">{userId}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* VIEW 1: GATEWAY LOGIN SCREEN */}
        {view === "login" && (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mt-8">
            <div className="p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center">
              <Award className="w-16 h-16 text-indigo-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold">クラウド同期学習システム</h2>
              <p className="text-slate-300 text-sm mt-1">合言葉を入力して、スマホやPCで履歴を完全共有</p>
            </div>
            <form onSubmit={handleLogin} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ユーザーID または 合言葉</label>
                <input 
                  type="text" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="例: my-finance-study2026"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400 font-medium tracking-wide transition"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>学習室に入る / 同期開始</span>
              </button>
            </form>
          </div>
        )}

        {/* VIEW 2: CONTROL TERMINAL DASHBOARD MENU */}
        {view === "menu" && (
          <div className="space-y-8">
            {/* Resume Session Banner Notification */}
            {resumePrompt && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 shadow-sm animate-fade-in">
                <div className="flex items-start space-x-3.5">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900">前回の未完学習セッションがあります</h4>
                    <p className="text-sm text-amber-800 mt-0.5">
                      モード: <span className="font-semibold text-amber-950">
                        {resumePrompt.mode === "all" ? "すべての問題" : resumePrompt.mode === "wrong" ? "前回不正解の問題のみ" : "要復習の問題のみ"}
                      </span> 
                      （進行度: 第 {resumePrompt.index + 1} 問目から）
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 w-full md:w-auto">
                  <button 
                    onClick={() => startQuiz(resumePrompt.mode, resumePrompt.index)}
                    className="flex-1 md:flex-initial bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition"
                  >
                    続きから再開
                  </button>
                  <button 
                    onClick={() => {
                      setResumePrompt(null);
                      saveProgressToCloud({ progressIndex: 0 });
                    }}
                    className="flex-1 md:flex-initial bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold py-2.5 px-4 rounded-xl transition"
                  >
                    最初から
                  </button>
                </div>
              </div>
            )}

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">総収録問数</div>
                  <div className="text-2xl font-black text-slate-900">{quizData.length} 問</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">要復習登録問数</div>
                  <div className="text-2xl font-black text-rose-600">{Object.keys(userProgress.reviewQuestions || {}).length} 問</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">現在の正答率</div>
                  <div className="text-2xl font-black text-emerald-600">{calculateAccuracyStats().rate} %</div>
                </div>
              </div>
            </div>

            {/* Launch Mode Action Row Selection */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">学習プログラムを開始する</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <button 
                  onClick={() => startQuiz("all")}
                  className="group relative bg-slate-50 hover:bg-indigo-600 border border-slate-200 hover:border-indigo-600 rounded-2xl p-6 text-left transition duration-300 hover:shadow-xl hover:shadow-indigo-600/10"
                >
                  <h4 className="font-bold text-lg text-slate-900 group-hover:text-white transition">すべての問題</h4>
                  <p className="text-slate-500 group-hover:text-indigo-100 text-sm mt-2 transition">
                    全16問を網羅的に学習します。
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-bold text-indigo-600 group-hover:text-white transition">
                    スタート <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                  </div>
                </button>

                <button 
                  onClick={() => startQuiz("wrong")}
                  className="group relative bg-slate-50 hover:bg-rose-600 border border-slate-200 hover:border-rose-600 rounded-2xl p-6 text-left transition duration-300 hover:shadow-xl hover:shadow-rose-600/10"
                >
                  <h4 className="font-bold text-lg text-slate-900 group-hover:text-white transition">前回不正解の問題</h4>
                  <p className="text-slate-500 group-hover:text-rose-100 text-sm mt-2 transition">
                    ミスした問題のみに絞って効率的に克服します。
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-bold text-rose-600 group-hover:text-white transition">
                    登録数: {Object.keys(userProgress.wrongQuestions || {}).length}問 <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                  </div>
                </button>

                <button 
                  onClick={() => startQuiz("review")}
                  className="group relative bg-slate-50 hover:bg-amber-500 border border-slate-200 hover:border-amber-500 rounded-2xl p-6 text-left transition duration-300 hover:shadow-xl hover:shadow-amber-500/10"
                >
                  <h4 className="font-bold text-lg text-slate-900 group-hover:text-white transition">要復習の問題</h4>
                  <p className="text-slate-500 group-hover:text-amber-100 text-sm mt-2 transition">
                    自分でブックマークした重要項目を再チェックします。
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-bold text-amber-600 group-hover:text-white transition">
                    登録数: {Object.keys(userProgress.reviewQuestions || {}).length}問 <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                  </div>
                </button>

              </div>
            </div>

            {/* History Performance Chart and List Table Logs */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">学習履歴・同期ステータス</h3>
                <button 
                  onClick={() => setView("history")}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center space-x-1"
                >
                  <span>全履歴を詳細表示</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {Object.keys(userProgress.history || {}).length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  解答履歴データがまだありません。
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600 text-sm">全問題中における正誤分布状況の概略：</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: '正解', count: calculateAccuracyStats().correctCount },
                            { name: '未解答/不正解', count: quizData.length - calculateAccuracyStats().correctCount }
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-100 p-3 rounded-xl bg-slate-50 text-xs">
                      {quizData.map(q => {
                        const hist = userProgress.history?.[q.id];
                        return (
                          <div key={q.id} className="flex items-center justify-between py-1 border-b border-slate-200 last:border-none">
                            <span className="font-medium text-slate-700 truncate max-w-[240px]">{q.title}</span>
                            <span>
                              {hist ? (
                                hist.isCorrect ? 
                                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">正解 ({hist.answeredAt.split(" ")[0]})</span> : 
                                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">不正解 ({hist.answeredAt.split(" ")[0]})</span>
                              ) : (
                                <span className="text-slate-400">未挑戦</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: LIVE ACTIVE QUIZ PLAYBACK SCREEN */}
        {view === "quiz" && (
          (() => {
            const currentQuestion = filteredQuestions[currentIndex];
            if (!currentQuestion) return <div className="text-center py-12">問題データの読み込みエラー</div>;
            const isReviewRegistered = !!userProgress.reviewQuestions?.[currentQuestion.id];

            return (
              <div className="space-y-6">
                {/* Status Bar */}
                <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
                  <button 
                    onClick={quitToMenu}
                    className="text-slate-500 hover:text-slate-700 font-bold flex items-center space-x-1 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>ダッシュボードへ戻る</span>
                  </button>
                  <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    進行度: {currentIndex + 1} / {filteredQuestions.length} 問
                  </div>
                </div>

                {/* Question Frame Block Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-widest font-black text-indigo-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 mr-2">
                        {currentQuestion.category}
                      </span>
                      <h2 className="text-xl font-bold inline-block align-middle mt-1 md:mt-0">{currentQuestion.title}</h2>
                    </div>
                    <button
                      onClick={() => handleReviewToggle(currentQuestion.id, isReviewRegistered)}
                      className={`p-2 rounded-xl border transition ${
                        isReviewRegistered 
                          ? 'bg-amber-500 border-amber-500 text-white' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title="要復習フラグ切り替え"
                    >
                      <Star className={`w-5 h-5 ${isReviewRegistered ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    <p className="text-base font-medium leading-relaxed text-slate-800 whitespace-pre-line">
                      {currentQuestion.question}
                    </p>

                    {/* Conditional rendering for contextual structural information arrays */}
                    {currentQuestion.info && currentQuestion.info.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm text-slate-700 font-medium">
                        {currentQuestion.info.map((line, i) => (
                          <div key={i} className="whitespace-pre-line">{line}</div>
                        ))}
                      </div>
                    )}

                    {/* Question Specific Replicated Render Tables */}
                    {currentQuestion.tableData && currentQuestion.id === 5 && (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3">分類</th>
                              <th className="px-4 py-3">資産</th>
                              <th className="px-4 py-3">負債</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                            {currentQuestion.tableData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 bg-slate-50 font-bold text-slate-600">{row.label}</td>
                                <td className="px-4 py-3">{row.asset}</td>
                                <td className="px-4 py-3">{row.debt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {currentQuestion.tableData && currentQuestion.id === 10 && (
                      <div className="max-w-xs overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-sm text-left divide-y divide-slate-200">
                          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                            {currentQuestion.tableData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 bg-slate-50 font-bold text-slate-600 w-1/2">{row.k}</td>
                                <td className="px-4 py-3">{row.v}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {currentQuestion.tableData && currentQuestion.id === 11 && (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3">株価純資産倍率 (PBR)</th>
                              <th className="px-4 py-3">配当性向</th>
                              <th className="px-4 py-3">自己資本利益率 (ROE)</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-800 font-medium">
                            {currentQuestion.tableData.map((row, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-3">{row.pbr}</td>
                                <td className="px-4 py-3">{row.payout}</td>
                                <td className="px-4 py-3">{row.roe}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Form Choice Options List selection items */}
                    <div className="space-y-3 pt-4">
                      {currentQuestion.options.map((opt) => {
                        let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
                        
                        if (hasAnswered) {
                          if (opt.key === currentQuestion.answer) {
                            btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                          } else if (selectedOption === opt.key) {
                            btnStyle = "border-rose-500 bg-rose-50 text-rose-900";
                          } else {
                            btnStyle = "border-slate-200 bg-white opacity-60 text-slate-500";
                          }
                        }

                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleAnswerSelect(opt.key)}
                            disabled={hasAnswered}
                            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition flex items-start space-x-3 text-base ${btnStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 ${
                              hasAnswered && opt.key === currentQuestion.answer 
                                ? 'bg-emerald-600 text-white' 
                                : hasAnswered && selectedOption === opt.key 
                                ? 'bg-rose-600 text-white' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {opt.key}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Explanation Module Display Drawer Section */}
                {hasAnswered && (
                  <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden animate-slide-up">
                    <div className="px-6 py-4 bg-slate-900 text-white flex items-center space-x-3">
                      {selectedOption === currentQuestion.answer ? (
                        <div className="flex items-center space-x-2 text-emerald-400 font-black">
                          <Check className="w-6 h-6 stroke-[3]" />
                          <span className="text-lg">正解です！</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-rose-400 font-black">
                          <X className="w-6 h-6 stroke-[3]" />
                          <span className="text-lg">正解は 「{currentQuestion.answer}」 です</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-sm uppercase tracking-wider text-slate-500 font-black">ここが重要（要点）</h4>
                        <div className="bg-amber-50/70 border border-amber-200 text-slate-800 text-sm p-4 rounded-xl leading-relaxed whitespace-pre-line">
                          {currentQuestion.explanation.keyPoint}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm uppercase tracking-wider text-slate-500 font-black">詳細解説・計算プロセス</h4>
                        <div className="text-slate-800 text-sm bg-slate-50 border border-slate-200 p-4 rounded-xl leading-relaxed whitespace-pre-line font-mono">
                          {currentQuestion.explanation.detail}
                        </div>
                      </div>

                      {/* Flag configuration utility helper shortcut inline inside evaluation panel drawer */}
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-t border-slate-100 pt-5 space-y-4 md:space-y-0">
                        <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isReviewRegistered}
                            onChange={() => handleReviewToggle(currentQuestion.id, isReviewRegistered)}
                            className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm font-bold text-slate-700">この問題を「要復習」にキープする</span>
                        </label>

                        <button
                          onClick={advanceNextQuestion}
                          className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white text-base font-bold py-3 px-6 rounded-xl transition flex items-center justify-center space-x-2 shadow-md"
                        >
                          <span>{currentIndex + 1 === filteredQuestions.length ? "結果を確認して終了" : "次の問題へ進む"}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* VIEW 4: DETAILED ARCHIVAL AUDIT TRAIL LOG SHEET HISTORY VIEW */}
        {view === "history" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold">学習同期データ・履歴監査ログ</h2>
              </div>
              <button 
                onClick={() => setView("menu")}
                className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition"
              >
                メニューへ戻る
              </button>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">問題番号・タイトル</th>
                      <th className="px-4 py-3">最終結果</th>
                      <th className="px-4 py-3">タイムスタンプ</th>
                      <th className="px-4 py-3 text-center">要復習</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {quizData.map((q) => {
                      const log = userProgress.history?.[q.id];
                      const isRev = !!userProgress.reviewQuestions?.[q.id];
                      return (
                        <tr key={q.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 font-bold text-slate-900">{q.title}</td>
                          <td className="px-4 py-3.5">
                            {log ? (
                              log.isCorrect ? 
                                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">正解</span> : 
                                <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold">不正解</span>
                            ) : (
                              <span className="text-slate-400 text-xs">未解答</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 text-xs font-mono">{log ? log.answeredAt : "---"}</td>
                          <td className="px-4 py-3.5 text-center">
                            <button 
                              onClick={() => handleReviewToggle(q.id, isRev)}
                              className={`p-1.5 rounded-lg transition ${isRev ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-slate-400'}`}
                            >
                              <Star className={`w-4 h-4 ${isRev ? 'fill-current' : ''}`} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="max-w-4xl mx-auto px-4 text-center py-8 text-xs text-slate-400 font-medium tracking-wide">
        &copy; 2026 Smart Finance Study Assistant. Core Engine Framework Verified.
      </footer>
    </div>
  );
}