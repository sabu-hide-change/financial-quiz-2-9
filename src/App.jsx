/**
 * 依存関係インストール:
 * npm install lucide-react recharts clsx tailwind-merge
 * * ビルド失敗時の対策:
 * CI=false npm run build
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, BookOpen, 
  ChevronRight, RefreshCw, Filter, ArrowLeft,
  Check, Bookmark, Settings, Info
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';

// --- 図表コンポーネント ---

// Q5: 資産・負債テーブル
const AssetTable = () => (
  <div className="overflow-x-auto my-4 border rounded-lg shadow-sm bg-white">
    <div className="p-2 bg-slate-100 font-bold text-xs text-center border-b text-slate-700">M社 資産・負債データ (単位: 万円)</div>
    <table className="w-full text-sm text-center">
      <thead className="bg-slate-50 text-slate-700">
        <tr>
          <th className="p-2 border-r border-b">項目</th>
          <th className="p-2 border-r border-b">簿価</th>
          <th className="p-2 border-b">時価</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="p-2 border-r font-bold text-slate-600">資産</td>
          <td className="p-2 border-r">5,000</td>
          <td className="p-2">6,000</td>
        </tr>
        <tr>
          <td className="p-2 border-r font-bold text-slate-600">負債</td>
          <td className="p-2 border-r">2,000</td>
          <td className="p-2">2,000</td>
        </tr>
      </tbody>
    </table>
  </div>
);

// Q10: P社データ
const CompanyPTable = () => (
  <div className="overflow-x-auto my-4 border rounded-lg shadow-sm bg-white">
    <table className="w-full text-sm text-center">
      <thead className="bg-blue-50 text-blue-900">
        <tr>
          <th className="p-2 border-r">純資産額</th>
          <th className="p-2 border-r">発行済株式数</th>
          <th className="p-2">株価</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="p-3 border-r">1億円</td>
          <td className="p-3 border-r">10万株</td>
          <td className="p-3">1,500円</td>
        </tr>
      </tbody>
    </table>
  </div>
);

// Q11: Q社データ
const CompanyQTable = () => (
  <div className="overflow-x-auto my-4 border rounded-lg shadow-sm bg-white">
    <table className="w-full text-sm text-center">
      <thead className="bg-green-50 text-green-900">
        <tr>
          <th className="p-2 border-r">株価純資産倍率 (PBR)</th>
          <th className="p-2 border-r">自己資本利益率 (ROE)</th>
          <th className="p-2">配当性向</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="p-3 border-r">2.5倍</td>
          <td className="p-3 border-r">10%</td>
          <td className="p-3">50%</td>
        </tr>
      </tbody>
    </table>
  </div>
);

// Q12: 為替予約 損益図
const ForwardExchangeChart = () => {
  const data = [
    { rate: 80, bank: -20, company: 20 },
    { rate: 90, bank: -10, company: 10 },
    { rate: 100, bank: 0, company: 0 },
    { rate: 110, bank: 10, company: -10 },
    { rate: 120, bank: 20, company: -20 },
  ];

  return (
    <div className="w-full h-64 bg-white border rounded-lg p-4">
      <h4 className="text-xs text-center font-bold mb-2">為替予約の損益図 (予約レート: 100円)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="rate" 
            label={{ value: '為替相場 (円/ユーロ)', position: 'insideBottom', offset: -5, fontSize: 10 }} 
            domain={[80, 120]}
          />
          <YAxis 
            label={{ value: '損益', angle: -90, position: 'insideLeft', fontSize: 10 }}
          />
          <Tooltip />
          <ReferenceLine y={0} stroke="#000" />
          <ReferenceLine x={100} stroke="#ccc" strokeDasharray="3 3" label={{ value: '予約100円', fontSize: 10, position: 'insideTopLeft' }} />
          <Line type="linear" dataKey="bank" stroke="#2563eb" strokeWidth={2} name="① 青色実線" />
          <Line type="linear" dataKey="company" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" name="② 赤色点線" />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-xs mt-2">
        <span className="text-blue-600 font-bold">― ① 青色実線</span>
        <span className="text-red-600 font-bold">--- ② 赤色点線</span>
      </div>
    </div>
  );
};

// Q15: プットオプション 損益図
const PutOptionChart = () => {
  const data = [
    { rate: 80, buyer: 18, seller: -18 }, // (100-80) - 2 = 18
    { rate: 90, buyer: 8, seller: -8 },   // (100-90) - 2 = 8
    { rate: 98, buyer: 0, seller: 0 },    // Break even
    { rate: 100, buyer: -2, seller: 2 },  // Abandoned, loss premium
    { rate: 110, buyer: -2, seller: 2 },
    { rate: 120, buyer: -2, seller: 2 },
  ];

  return (
    <div className="w-full h-64 bg-white border rounded-lg p-4">
      <h4 className="text-xs text-center font-bold mb-2">プットオプション損益 (行使価格100円, 料2円)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="rate" 
            label={{ value: '市場価格', position: 'insideBottom', offset: -5, fontSize: 10 }} 
            domain={[80, 120]}
          />
          <YAxis label={{ value: '損益', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip />
          <ReferenceLine y={0} stroke="#000" />
          <Line type="monotone" dataKey="seller" stroke="#2563eb" strokeWidth={2} name="① 青色実線" dot={false} />
          <Line type="monotone" dataKey="buyer" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" name="② 赤色点線" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-xs mt-2">
        <span className="text-blue-600 font-bold">― ① 青色実線</span>
        <span className="text-red-600 font-bold">--- ② 赤色点線</span>
      </div>
    </div>
  );
};

// Q16: オプション価値 概念図
const OptionValueConceptChart = () => {
  // 簡易的なコールオプション価値曲線
  const data = Array.from({ length: 21 }, (_, i) => {
    const x = i * 5; // 0 to 100
    const strike = 50;
    const intrinsic = Math.max(0, x - strike);
    // 時間的価値はATM(50)で最大になるような放物線的カーブを加算
    const timeValue = 10 * Math.exp(-Math.pow((x - strike) / 20, 2));
    const totalValue = intrinsic + timeValue;
    return { x, intrinsic, timeValue, totalValue };
  });

  return (
    <div className="w-full h-56 bg-white border rounded-lg p-4 relative">
      <h4 className="text-xs text-center font-bold mb-2">コールオプションの価値構成</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" tick={false} label={{ value: '原資産価格 →', position: 'insideBottom', offset: -5, fontSize: 10 }} />
          <YAxis tick={false} label={{ value: 'オプション価格', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip />
          <Area type="monotone" dataKey="intrinsic" stackId="1" stroke="#8884d8" fill="#8884d8" name="本質的価値" />
          <Area type="monotone" dataKey="timeValue" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="時間的価値" />
          <ReferenceLine x={50} stroke="red" strokeDasharray="3 3" label={{ value: '権利行使価格', position: 'insideTopLeft', fontSize: 10, fill: 'red' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- データ ---

const QUESTIONS = [
  {
    id: 1,
    title: "ゼロ成長モデル",
    text: "次の資料は、I社に関するものである。この資料に基づいた場合、I社の企業価値として、最も適切なものを選べ。\n【資料】\n１．I社が毎年得られるフリー・キャッシュ・フローは、1,000万円と予測されている。\n２．資本コストは、10％である。\n３．企業価値は、DCF法により計算する。",
    choices: ["1,100万円", "1億円", "1億1,000万円", "2億円", "3億円"],
    answer: 1,
    explanation: "ゼロ成長モデル（毎年のFCFが一定）の場合、企業価値 ＝ FCF ÷ 資本コスト で求められます。\n1,000万円 ÷ 0.1 ＝ 1億円 となります。"
  },
  {
    id: 2,
    title: "定率成長モデル",
    text: "次の資料に基づき、J社の企業価値として最も適切なものを選べ。\n【資料】\n１．J社が1年後に得られるFCFは、1,000万円と予測されている。\n２．その後1年ごとの成長率は5％と予測されている。\n３．資本コストは、10％である。",
    choices: ["1,100万円", "1億円", "1億1,000万円", "2億円", "3億円"],
    answer: 3,
    explanation: "定率成長モデルの場合、企業価値 ＝ 1年後のFCF ÷ (資本コスト － 成長率) で求められます。\n1,000万円 ÷ (0.1 － 0.05) ＝ 1,000万円 ÷ 0.05 ＝ 2億円 となります。"
  },
  {
    id: 3,
    title: "収益還元法",
    text: "次の資料に基づき、K社の企業価値として最も適切なものを選べ。\n【資料】\n１．K社が永続的に毎年得る予想税引後利益は、1,000万円である。\n２．資本還元率は、10％である。\n３．企業価値は、収益還元法により計算する。",
    choices: ["1億円", "1億1,000万円", "1億5,000万円", "2億円", "3億円"],
    answer: 0,
    explanation: "収益還元法では、企業価値 ＝ 予想税引後利益 ÷ 資本還元率 で求められます。\n1,000万円 ÷ 0.1 ＝ 1億円 となります。"
  },
  {
    id: 4,
    title: "配当還元法",
    text: "次の資料に基づき、L社の企業価値として最も適切なものを選べ。\n【資料】\n１．L社が永続的に毎年行う配当額は、1,000万円である。\n２．資本還元率は、10％である。\n３．株主価値は配当還元法により計算し、負債価値は1億円である。",
    choices: ["1億円", "1億1,000万円", "1億5,000万円", "2億円", "3億円"],
    answer: 3,
    explanation: "まず株主価値を求めます。株主価値 ＝ 配当額 ÷ 資本還元率 ＝ 1,000万円 ÷ 0.1 ＝ 1億円。\n企業価値 ＝ 株主価値 ＋ 負債価値 ＝ 1億円 ＋ 1億円 ＝ 2億円 となります。"
  },
  {
    id: 5,
    title: "簿価純資産法・時価純資産法",
    text: "次の資料に基づき、M社の株主価値に関する説明として最も適切なものを選べ。",
    visual: <AssetTable />,
    choices: [
      "簿価純資産法では3,000万円、時価純資産法では3,000万円である。",
      "簿価純資産法では3,000万円、時価純資産法では4,000万円である。",
      "簿価純資産法では4,000万円、時価純資産法では3,000万円である。",
      "簿価純資産法では5,000万円、時価純資産法では6,000万円である。"
    ],
    answer: 1,
    explanation: "簿価純資産法：資産(簿価)5,000 － 負債(簿価)2,000 ＝ 3,000万円。\n時価純資産法：資産(時価)6,000 － 負債(時価)2,000 ＝ 4,000万円。\nよって正解はイです。"
  },
  {
    id: 6,
    title: "M&Aの手法",
    text: "買収される企業の資産や将来性を担保に、資金を金融機関から借り入れて、その資金で買収するM&Aの手法はどれか。",
    choices: ["TOB", "MBO", "EBO", "LBO"],
    answer: 3,
    explanation: "LBO (Leveraged Buy Out) は、買収先の資産等を担保に資金を借り入れ（レバレッジを効かせ）て買収する手法です。\nTOBは株式公開買付け、MBOは経営陣による買収、EBOは従業員による買収です。"
  },
  {
    id: 7,
    title: "MM理論",
    text: "MM理論に関する説明として、最も不適切なものはどれか。",
    choices: [
      "法人税が存在しない完全資本市場では、企業価値はその資本構成に依存しない。",
      "法人税が存在しない完全資本市場では、最適資本構成が存在しない。",
      "法人税が存在しない完全資本市場では、加重平均資本コストの最小値が存在する。",
      "法人税が存在する現実では、企業価値はその資本構成に依存する。"
    ],
    answer: 2,
    explanation: "法人税が存在しない完全資本市場では、資本構成に関わらずWACC（加重平均資本コスト）は一定となり、最小値は存在しません（フラットになります）。したがってウが不適切です。"
  },
  {
    id: 8,
    title: "理論株価",
    text: "N社(配当一定100万円)とO社(配当成長率5%, 初年度100万円)がある。資本還元率10%、発行済株式各1,000株の場合の理論株価は？",
    choices: [
      "N社: 1万円、O社: 1万円",
      "N社: 2万円、O社: 1万円",
      "N社: 1万円、O社: 2万円",
      "N社: 2万円、O社: 2万円"
    ],
    answer: 2,
    explanation: "N社(ゼロ成長)：株主価値＝100万÷0.1＝1,000万円。株価＝1,000万÷1,000株＝1万円。\nO社(定率成長)：株主価値＝100万÷(0.1－0.05)＝2,000万円。株価＝2,000万÷1,000株＝2万円。"
  },
  {
    id: 9,
    title: "株価収益率 (PER)",
    text: "株価収益率（PER）に関する説明として、最も適切なものはどれか。",
    choices: [
      "株価を1株当たり当期純利益で割って計算される。",
      "当期純利益を発行済株式数で割って計算される。",
      "株価を1株当たり純資産額で割って計算される。",
      "純資産額を発行済株式数で割って計算される。"
    ],
    answer: 0,
    explanation: "PER (Price Earnings Ratio) は、株価 ÷ 1株当たり当期純利益 (EPS) で求められます。\nイはEPS、ウはPBR、エはBPSの説明です。"
  },
  {
    id: 10,
    title: "株価純資産倍率 (PBR)",
    text: "次の資料に基づき、P社のPBRとして最も適切なものを選べ。",
    visual: <CompanyPTable />,
    choices: ["0.75倍", "1倍", "1.5倍", "15倍", "150倍"],
    answer: 2,
    explanation: "1株当たり純資産(BPS) ＝ 1億円 ÷ 10万株 ＝ 1,000円。\nPBR ＝ 株価 ÷ BPS ＝ 1,500 ÷ 1,000 ＝ 1.5倍。"
  },
  {
    id: 11,
    title: "配当利回り",
    text: "次の資料に基づき、Q社の配当利回りの値として最も適切なものを選べ。",
    visual: <CompanyQTable />,
    choices: ["1％", "2％", "3％", "4％", "5％"],
    answer: 1,
    explanation: "ROE ＝ PBR × 配当利回り ÷ 配当性向 の関係式を用います。\n10% ＝ 2.5 × 配当利回り ÷ 50%\n0.1 ＝ 5 × 配当利回り\n配当利回り ＝ 0.02 ＝ 2%"
  },
  {
    id: 12,
    title: "為替予約",
    text: "R社は3ヶ月後に1ユーロ100円で買う予約をした。損益図に関する説明として適切なものはどれか。",
    visual: <ForwardExchangeChart />,
    choices: [
      "青色実線①はX銀行の損益を表している。",
      "赤色点線②はR社の損益を表している。",
      "予約価格100円より円高(90円等)になると、R社は利益を得る。",
      "予約価格100円より円安(110円等)になると、R社は利益を得る。"
    ],
    answer: 3,
    explanation: "R社は「買う」予約をしています。市場価格が110円（円安）になっても100円で買えるため、R社は利益（プラス）になります。図の赤色点線②が右肩上がりでR社の損益を表し、青色実線①が銀行の損益です。選択肢エが正解です。"
  },
  {
    id: 13,
    title: "先渡取引と先物取引",
    text: "先渡取引（フォワード）と先物取引（フューチャー）に関する説明として、最も適切なものはどれか。",
    choices: [
      "いずれも所定の原資産を将来の一定時点に所定の価格で売買する契約である。",
      "いずれも店頭取引として行われる。",
      "先物取引では、取引条件などを当事者間で任意に取り決める。",
      "先渡取引では、取引所が保証するため信用リスクは少ない。"
    ],
    answer: 0,
    explanation: "両者とも将来の売買契約である点は共通です(ア)。\n先物取引は「取引所取引」で「定型化」されており、先渡取引は「店頭取引(相対)」で「任意」に条件を決められます。"
  },
  {
    id: 14,
    title: "オプション取引",
    text: "オプション取引に関する説明として、最も適切なものはどれか。",
    choices: [
      "権利を取引するものである。",
      "売る権利をコール、買う権利をプットと呼ぶ。",
      "満期日のみ行使できるものをアメリカンタイプという。",
      "いつでも行使できるものをヨーロピアンタイプという。"
    ],
    answer: 0,
    explanation: "オプションは「権利」の売買です(ア)。\n売る権利＝プット、買う権利＝コールです。\n満期日のみ＝ヨーロピアン、いつでも＝アメリカンです。"
  },
  {
    id: 15,
    title: "プット・オプション",
    text: "S社は1ユーロ100円で売る権利(プット)を料2円で購入した。損益図の説明として適切なものは？",
    visual: <PutOptionChart />,
    choices: [
      "青色実線①はS社の損益である。",
      "赤色点線②はS社の損益である。",
      "1ユーロ98円より円高になると、S社は損失を被る。",
      "1ユーロ98円より円高になると、Y銀行は利益を得る。"
    ],
    answer: 1,
    explanation: "プットの買い手(S社)は、価格が下がれば(円高)、市場より高く売れるため利益が出ます。100円で売る権利に対し、料2円を払っているので、98円未満で利益になります。損失は料2円に限定されます。これを示すのは赤色点線②です。"
  },
  {
    id: 16,
    title: "オプション価格",
    text: "オプション価格は(A)価値と(B)価値により構成される。図は(C)オプションを示し、原資産価格が権利行使価格より(D)とき、(A)価値が存在する。",
    visual: <OptionValueConceptChart />,
    choices: [
      "A:時間的 B:本質的 C:コール D:高い",
      "A:時間的 B:本質的 C:プット D:低い",
      "A:本質的 B:時間的 C:プット D:低い",
      "A:本質的 B:時間的 C:コール D:高い"
    ],
    answer: 3,
    explanation: "オプション料＝本質的価値(A)＋時間的価値(B)。図は右肩上がりなのでコールオプション(C)。コールは「買う権利」なので、原資産価格が高い(D)ほど本質的価値が生じます。"
  }
];

// --- アプリケーション ---

export default function App() {
  const [view, setView] = useState('home'); // home, quiz, result
  const [filter, setFilter] = useState('all'); // all, incorrect, review
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // 永続化ステート
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('smart_quiz_2_9_data');
    return saved ? JSON.parse(saved) : { correct: {}, review: {} };
  });

  useEffect(() => {
    localStorage.setItem('smart_quiz_2_9_data', JSON.stringify(history));
  }, [history]);

  // フィルタリングロジック
  const filteredQuestions = useMemo(() => {
    if (filter === 'incorrect') {
      return QUESTIONS.filter(q => history.correct[q.id] === false);
    }
    if (filter === 'review') {
      return QUESTIONS.filter(q => history.review[q.id] === true);
    }
    return QUESTIONS;
  }, [filter, history]);

  const currentQuestion = filteredQuestions[currentIdx];

  // ハンドラー
  const handleStart = (mode) => {
    setFilter(mode);
    setCurrentIdx(0);
    setView('quiz');
    setShowExplanation(false);
    setSelectedChoice(null);
  };

  const handleAnswer = (choiceIdx) => {
    if (showExplanation) return;
    setSelectedChoice(choiceIdx);
    setShowExplanation(true);
    
    const isCorrect = choiceIdx === currentQuestion.answer;
    setHistory(prev => ({
      ...prev,
      correct: { ...prev.correct, [currentQuestion.id]: isCorrect }
    }));
  };

  const handleNext = () => {
    if (currentIdx < filteredQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedChoice(null);
      setShowExplanation(false);
    } else {
      setView('result');
    }
  };

  const toggleReview = (qid) => {
    setHistory(prev => ({
      ...prev,
      review: { ...prev.review, [qid]: !prev.review[qid] }
    }));
  };

  // --- 画面コンポーネント ---

  if (view === 'home') {
    const total = QUESTIONS.length;
    const answered = Object.keys(history.correct).length;
    const correctCount = Object.values(history.correct).filter(v => v).length;
    const reviewCount = Object.values(history.review).filter(v => v).length;
    const incorrectCount = QUESTIONS.filter(q => history.correct[q.id] === false).length;

    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center font-sans text-slate-800">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
              <BookOpen className="w-8 h-8" />
              スマート問題集 2-9
            </h1>
            <p className="text-sm text-slate-500">現代のファイナンス</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round((correctCount / total) * 100)}%</div>
              <div className="text-xs text-blue-400">正答率</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-orange-600">{reviewCount}</div>
              <div className="text-xs text-orange-400">要復習</div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => handleStart('all')}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" /> 全問スタート
            </button>
            <button 
              onClick={() => handleStart('incorrect')}
              disabled={incorrectCount === 0}
              className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-5 h-5" /> 前回不正解のみ ({incorrectCount})
            </button>
            <button 
              onClick={() => handleStart('review')}
              disabled={reviewCount === 0}
              className="w-full py-3 bg-orange-100 text-orange-600 rounded-xl font-bold hover:bg-orange-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Bookmark className="w-5 h-5" /> 要復習のみ ({reviewCount})
            </button>
          </div>

          {/* 履歴リスト */}
          <div className="mt-8 border-t pt-4">
            <h3 className="text-sm font-bold text-slate-400 mb-2">学習履歴</h3>
            <div className="max-h-40 overflow-y-auto space-y-1 text-sm">
              {QUESTIONS.map((q, i) => (
                <div key={q.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                  <span className="text-slate-600 truncate flex-1">Q{i+1}. {q.title}</span>
                  <div className="flex gap-2">
                    {history.review[q.id] && <Bookmark className="w-4 h-4 text-orange-500 fill-current" />}
                    {history.correct[q.id] === true && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {history.correct[q.id] === false && <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'result') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">学習完了！</h2>
          <p className="text-slate-500">お疲れ様でした。今回の学習セットは終了です。</p>
          <button 
            onClick={() => setView('home')}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  // Quiz View
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
        <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <span className="font-bold text-sm text-slate-700">
          Q{currentIdx + 1} / {filteredQuestions.length}
        </span>
        <button 
          onClick={() => toggleReview(currentQuestion.id)}
          className={`p-2 rounded-full transition ${history.review[currentQuestion.id] ? 'bg-orange-100 text-orange-500' : 'hover:bg-slate-100 text-slate-400'}`}
        >
          <Bookmark className={`w-5 h-5 ${history.review[currentQuestion.id] ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        {/* Question Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">{currentQuestion.title}</span>
            {history.correct[currentQuestion.id] === false && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">前回不正解</span>}
          </div>
          <h2 className="text-lg font-bold leading-relaxed whitespace-pre-wrap text-slate-800">
            {currentQuestion.text}
          </h2>
          
          {/* Visual Content */}
          {currentQuestion.visual && (
            <div className="mt-6">
              {currentQuestion.visual}
            </div>
          )}
        </div>

        {/* Choices */}
        <div className="space-y-3">
          {currentQuestion.choices.map((choice, i) => {
            let stateClass = "bg-white border-slate-200 hover:border-blue-400";
            if (showExplanation) {
              if (i === currentQuestion.answer) stateClass = "bg-green-50 border-green-500 text-green-800 ring-1 ring-green-500";
              else if (i === selectedChoice) stateClass = "bg-red-50 border-red-500 text-red-800";
              else stateClass = "bg-slate-50 border-slate-200 text-slate-400";
            }

            return (
              <button
                key={i}
                disabled={showExplanation}
                onClick={() => handleAnswer(i)}
                className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-200 flex items-center justify-between group ${stateClass}`}
              >
                <span className="font-medium">{choice}</span>
                {showExplanation && i === currentQuestion.answer && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {showExplanation && i === selectedChoice && i !== currentQuestion.answer && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
              <Info className="w-5 h-5 text-blue-500" /> 解説
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600">
              {currentQuestion.explanation}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer hover:text-slate-800 transition">
                <input 
                  type="checkbox" 
                  checked={history.review[currentQuestion.id] || false}
                  onChange={() => toggleReview(currentQuestion.id)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                要復習リストに追加
              </label>
              <button 
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition flex items-center gap-2"
              >
                次の問題 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}