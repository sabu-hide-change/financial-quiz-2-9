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
  Check, Bookmark, PieChart, BarChart3, Settings
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ReferenceLine
} from 'recharts';

// --- 図表コンポーネント (SVG/HTML再現) ---

// 無差別曲線 (Past 2-8 Q1)
const IndifferenceCurves = () => (
  <div className="grid grid-cols-2 gap-4 p-4">
    {['ア: リスク回避', 'イ', 'ウ', 'エ: リスク中立'].map((label, idx) => (
      <div key={idx} className="flex flex-col items-center">
        <div className="w-full h-32 border-l-2 border-b-2 border-slate-600 relative bg-white">
          {idx === 0 && ( // ア (Risk Averse - Convex)
            <>
              <path d="M10,90 Q40,80 90,10" fill="none" stroke="red" strokeWidth="2" />
              <path d="M10,70 Q40,60 70,10" fill="none" stroke="red" strokeWidth="2" opacity="0.6"/>
            </>
          )}
          {idx === 1 && ( // イ (Risk Lover? - Concave/Down)
             <path d="M10,10 Q40,20 90,90" fill="none" stroke="red" strokeWidth="2" />
          )}
          {idx === 2 && ( // ウ (Down)
             <path d="M10,30 Q50,40 90,90" fill="none" stroke="red" strokeWidth="2" />
          )}
          {idx === 3 && ( // エ (Risk Neutral - Horizontal)
             <>
               <line x1="0" y1="30" x2="100" y2="30" stroke="red" strokeWidth="2" />
               <line x1="0" y1="60" x2="100" y2="60" stroke="red" strokeWidth="2" opacity="0.6"/>
             </>
          )}
        </div>
        <span className="text-xs mt-1 font-bold">{label}</span>
      </div>
    ))}
  </div>
);

// 相関関係ファンチャート (Past 2-8 Q2)
const CorrelationFanChart = () => (
  <div className="w-full h-48 bg-white border rounded p-2 relative">
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#000" />
        </marker>
      </defs>
      <line x1="30" y1="170" x2="280" y2="170" stroke="#000" strokeWidth="1" markerEnd="url(#arrow)" />
      <line x1="30" y1="170" x2="30" y2="20" stroke="#000" strokeWidth="1" markerEnd="url(#arrow)" />
      
      {/* Lines */}
      <line x1="30" y1="100" x2="250" y2="30" stroke="#000" strokeWidth="2" /> {/* ① */}
      <path d="M30,100 Q100,100 250,30" fill="none" stroke="#000" strokeWidth="2" /> {/* ② */}
      <path d="M30,100 Q100,150 250,30" fill="none" stroke="#000" strokeWidth="2" /> {/* ③ */}
      <polyline points="30,100 30,150 250,30" fill="none" stroke="#000" strokeWidth="2" /> {/* ④ */}

      <text x="255" y="30" fontSize="10">A</text>
      <text x="20" y="100" fontSize="10">B</text>
      <text x="180" y="80" fontSize="10">①</text>
      <text x="120" y="90" fontSize="10">②</text>
      <text x="80" y="130" fontSize="10">③</text>
      <text x="40" y="120" fontSize="10">④</text>
    </svg>
  </div>
);

// WACC BOX図 (Past 2-8 Q8)
const WaccBox = () => (
  <div className="w-full max-w-sm mx-auto my-4 border-2 border-black flex">
    <div className="w-1/3 bg-blue-100 flex items-center justify-center p-4 border-r-2 border-black font-bold">
      10,000万円
    </div>
    <div className="w-2/3 flex flex-col">
      <div className="h-1/2 bg-white flex items-center justify-center border-b-2 border-black p-2">
        負債 4,000万円
      </div>
      <div className="h-1/2 bg-green-50 flex flex-col items-center justify-center p-2">
        <span>資本 6,000万円</span>
        <span className="text-[10px]">(1,200円×5万株)</span>
      </div>
    </div>
  </div>
);

// オプション損益図 (Smart 2-9 Q12, Q15, Q16)
const OptionChart = ({ type }) => {
  return (
    <div className="w-full h-48 bg-white border rounded p-4 relative">
      <div className="absolute top-2 left-2 text-xs text-slate-500">損益</div>
      <div className="absolute bottom-2 right-2 text-xs text-slate-500">価格(円安→)</div>
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <line x1="10" y1="75" x2="190" y2="75" stroke="#ccc" strokeWidth="1" />
        <line x1="100" y1="10" x2="100" y2="140" stroke="#ccc" strokeWidth="1" />
        
        {type === 'forex' && (
          <>
            <line x1="20" y1="130" x2="180" y2="20" stroke="#2563eb" strokeWidth="3" /> {/* Blue Solid */}
            <line x1="20" y1="20" x2="180" y2="130" stroke="#dc2626" strokeWidth="3" strokeDasharray="4" /> {/* Red Dotted */}
            <text x="185" y="20" fontSize="10">①</text>
            <text x="185" y="130" fontSize="10">②</text>
          </>
        )}
        
        {type === 'put' && (
          <>
            {/* Blue Solid: Buy Put */}
            <polyline points="20,130 100,50 180,50" fill="none" stroke="#2563eb" strokeWidth="3" />
            {/* Red Dotted: Sell Put */}
            <polyline points="20,20 100,100 180,100" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="4" />
            <text x="185" y="50" fontSize="10">①</text>
            <text x="185" y="100" fontSize="10">②</text>
          </>
        )}

        {type === 'value' && (
          <>
             {/* Call Option Value Curve */}
             <path d="M20,130 Q100,130 180,10" fill="none" stroke="#2563eb" strokeWidth="3" />
             <line x1="100" y1="130" x2="180" y2="50" stroke="#ccc" strokeWidth="1" strokeDasharray="2" />
             <text x="100" y="145" fontSize="10" textAnchor="middle">権利行使価格</text>
          </>
        )}
      </svg>
    </div>
  );
};

// 資金調達ツリー (Smart 2-8 Q14)
const FundingTree = () => (
  <div className="p-2 text-xs">
    <div className="flex items-center gap-2">
      <div className="border p-2 bg-slate-100 font-bold">資金調達</div>
      <div className="h-px w-4 bg-black"></div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="border p-1 bg-blue-50">外部金融</div>
          <div className="h-px w-4 bg-black"></div>
          <div className="flex flex-col gap-2">
             <div className="flex gap-2"><div className="border p-1">間接金融</div><span>(借入)</span></div>
             <div className="flex gap-2"><div className="border p-1">直接金融</div><span>(社債/株式)</span></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="border p-1 bg-green-50">内部金融</div>
          <div className="h-px w-4 bg-black"></div>
          <div className="flex flex-col gap-2">
             <div className="border p-1">内部留保</div>
             <div className="border p-1">減価償却</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- 問題データ (全48問) ---

const QUESTIONS = [
  // --- スマート問題集 2-8 ---
  {
    id: "s28_1",
    source: "スマート問題集 2-8",
    title: "資本市場と資金調達",
    text: "企業にとっての資金調達は、投資家にとっての（ Ａ ）となる。よって、企業の資金調達のコストである資本コストは、投資家にとっては（ Ａ ）に対する（ Ｂ ）となる。ここで、投資家が（ Ａ ）をするにあたり、資本市場において、（ Ｃ ）を購入するか（ Ｄ ）を購入するかの選択肢がある。リスクの少ない（ Ｃ ）と、リスクの大きい（ Ｄ ）の期待するリターンが同じであれば、投資家はリスクの少ない（ Ｃ ）を選ぶ。",
    choices: [
      "Ａ：投資　Ｂ：リスク　Ｃ：社債　Ｄ：株式",
      "Ａ：消費　Ｂ：リスク　Ｃ：株式　Ｄ：社債",
      "Ａ：消費　Ｂ：リターン　Ｃ：社債　Ｄ：株式",
      "Ａ：投資　Ｂ：リターン　Ｃ：株式　Ｄ：社債",
      "Ａ：投資　Ｂ：リターン　Ｃ：社債　Ｄ：株式"
    ],
    answer: 4,
    explanation: "企業にとっての資金調達は、投資家側から見れば「投資(A)」です。その対価は「リターン(B)」となります。\n一般に「社債(C)」は元本等の確実性が高くリスクが低いのに対し、「株式(D)」は価格変動等のリスクが高い金融商品です。"
  },
  {
    id: "s28_2",
    source: "スマート問題集 2-8",
    title: "投資のリスクとリターン",
    text: "次の資料に基づき、この株式の標準偏差として最も適切なものを選べ。\n【資料】\n収益率4%: 確率0.2\n収益率6%: 確率0.5\n収益率8%: 確率0.3",
    choices: ["-1", "0", "1", "1.41", "1.4"],
    answer: 4,
    explanation: "①期待値 = 4×0.2 + 6×0.5 + 8×0.3 = 6.2%\n②分散 = (4-6.2)^2×0.2 + (6-6.2)^2×0.5 + (8-6.2)^2×0.3 = 1.96\n③標準偏差 = √1.96 = 1.4"
  },
  {
    id: "s28_3",
    source: "スマート問題集 2-8",
    title: "リスクの種類",
    text: "ポートフォリオ理論におけるリスクに関する記述として、最も適切なものを選べ。",
    choices: [
      "流動性リスクとは、取引相手の倒産等により回収が滞るリスクである。",
      "カントリー・リスクとは、為替変動により資産価値が変動するリスクである。",
      "価格変動リスクとは、取引量が少なく換金できないリスクである。",
      "信用リスクとは、その国の政治経済により価値が変動するリスクである。",
      "システマティック・リスクとは、市場全体との相関によるリスクであり、分散化で消去できない。"
    ],
    answer: 4,
    explanation: "システマティック・リスク（市場リスク）は分散投資でも消去できません。\n他は定義が誤っています（ア:信用リスク、イ:為替リスク、ウ:流動性リスク、エ:カントリーリスク）。"
  },
  {
    id: "s28_4",
    source: "スマート問題集 2-8",
    title: "リスクに対する選好",
    text: "下図の無差別曲線A, B, Cに対応する投資家の選好として適切な組み合わせを選べ。\n(A:下に凸の右上がり, B:水平, C:上に凸の右下がり)",
    visualType: "indifference",
    choices: [
      "A:リスク回避 B:リスク中立 C:リスク愛好",
      "A:リスク回避 B:リスク愛好 C:リスク中立",
      "A:リスク愛好 B:リスク中立 C:リスク回避",
      "A:リスク愛好 B:リスク回避 C:リスク中立"
    ],
    answer: 0,
    explanation: "リスク回避者(A)は同じリターンなら低リスクを好むため、リスク増にはリターン増を要求し、右上がりの曲線になります。中立者(B)はリターンのみを見るため水平、愛好者(C)はリスクそのものを好むため特異な形状になります。"
  },
  {
    id: "s28_5",
    source: "スマート問題集 2-8",
    title: "ポートフォリオ効果",
    text: "（ A ）とは複数の資産の組み合わせである。マコービッツは（ A ）を組むことで（ B ）の（ C ）が可能になることを示した。これを（ A ）の（ D ）という。",
    choices: [
      "A:ポートフォリオ B:リスク C:分散 D:リスク低減効果",
      "A:ポートフォリオ B:リターン C:集中 D:ポートフォリオ効果",
      "A:選好 B:リターン C:分散 D:リスク低減効果",
      "A:選好 B:リスク C:集中 D:ポートフォリオ効果"
    ],
    answer: 0,
    explanation: "ポートフォリオ（分散投資）を組むことで、リターンを維持したままリスク（標準偏差）を低減させることができます。これをリスク低減効果といいます。"
  },
  {
    id: "s28_6",
    source: "スマート問題集 2-8",
    title: "リターンとリスクのグラフ",
    text: "2資産X, Yの相関によるリスク・リターン曲線について。最も適切な記述はどれか。",
    choices: [
      "X単独投資はローリスク・ローリターンである。",
      "Y単独投資はハイリスク・ハイリターンである。",
      "リスクが最小になるのはX:37%, Y:63%の点である。",
      "最小リスク点以外では、個別投資よりリスクが高い。"
    ],
    answer: 2,
    explanation: "グラフの最も左側（標準偏差が最小）になる点が「最小分散ポートフォリオ」です。この点は単独投資よりもリスクが低くなっています。"
  },
  {
    id: "s28_7",
    source: "スマート問題集 2-8",
    title: "相関係数",
    text: "相関係数が-1, 0, 1の場合のグラフについて適切な記述はどれか。",
    choices: [
      "相関係数-1のとき、リスク低減効果は最小となる。",
      "相関係数1のとき、リスク低減効果は最大となる。",
      "相関係数0のとき、リスクを低減できない。",
      "相関係数1以外のとき、リスク低減効果がある。"
    ],
    answer: 3,
    explanation: "相関係数が1（完全正相関）のときは直線となり効果がありません。それ以外（1未満）であれば、曲線は左側に膨らみ、リスク低減効果が生じます。"
  },
  {
    id: "s28_8",
    source: "スマート問題集 2-8",
    title: "システマティック/アンシステマティック",
    text: "総リスクは（ A ）と（ B ）からなる。（ A ）は銘柄数増加で減少するが、（ B ）は減少しない。（ C ）はベータと期待リターンの関係直線である。",
    choices: [
      "A:システマティック B:アンシステマティック C:資本市場線",
      "A:システマティック B:アンシステマティック C:証券市場線",
      "A:アンシステマティック B:システマティック C:証券市場線",
      "A:アンシステマティック B:システマティック C:資本市場線"
    ],
    answer: 2,
    explanation: "分散投資で減らせるのは「アンシステマティック・リスク(個別リスク)」です。市場全体のリスクである「システマティック・リスク」は減らせません。βとリターンの関係は「証券市場線(SML)」です。"
  },
  {
    id: "s28_9",
    source: "スマート問題集 2-8",
    title: "効率的フロンティア",
    text: "効率的フロンティアに関する記述として不適切なものはどれか。",
    choices: [
      "特定のリスクに対し、最低のリターンをあげるポートフォリオの集合である。",
      "合理的な投資家は、必ず効率的フロンティア上の点を選ぶ。",
      "ローリスク選好者は、フロンティア左側を選ぶ。",
      "ハイリスク選好者は、フロンティア右側を選ぶ。"
    ],
    answer: 0,
    explanation: "効率的フロンティアは「最大（最高）」のリターン、または「最小」のリスクを実現する集合です。「最低のリターン」という記述が誤りです。"
  },
  {
    id: "s28_10",
    source: "スマート問題集 2-8",
    title: "リスクフリー資産",
    text: "リスクフリー資産（国債）を組み入れた場合の記述として適切なものはどれか。",
    choices: [
      "国債の期待収益率は10%である。",
      "国債はリスクフリー資産（標準偏差0）である。",
      "国債比率が低いほど、リスクは小さくなる。",
      "国債を入れると、リスク回避的な投資家の選択肢が狭まる。"
    ],
    answer: 1,
    explanation: "グラフの縦軸上の点（標準偏差0）がリスクフリー資産です。国債を組み入れることで、より低リスクなポートフォリオ組成が可能になります。"
  },
  {
    id: "s28_11",
    source: "スマート問題集 2-8",
    title: "市場ポートフォリオ",
    text: "資本市場線と効率的フロンティアの接点Mに関する記述として適切なものはどれか。",
    choices: [
      "資本市場線とはリスクフリー資産のみを購入する場合である。",
      "市場ポートフォリオ(M)より内部の点Bの方が効率的である。",
      "合理的な投資家は必ず資本市場線上のポートフォリオを選択する。",
      "市場ポートフォリオのリスクは最小である。"
    ],
    answer: 2,
    explanation: "リスクフリー資産が存在する場合、投資家は「資本市場線（CML）」上の点を選択するのが最も合理的です。Mは市場ポートフォリオと呼ばれます。"
  },
  {
    id: "s28_12",
    source: "スマート問題集 2-8",
    title: "CAPM計算",
    text: "Rf=2%, β=1.2, Rm=8% のとき、CAPMによる期待収益率の式は？",
    choices: [
      "8% + 1.2(8% - 2%)",
      "8% - 1.2(8% + 2%)",
      "2% + 1.2(8% + 2%)",
      "2% - 1.2(8% - 2%)",
      "2% + 1.2(8% - 2%)"
    ],
    answer: 4,
    explanation: "CAPM式: Re = Rf + β(Rm - Rf)\n代入すると: 2% + 1.2 × (8% - 2%) となります。"
  },
  {
    id: "s28_13",
    source: "スマート問題集 2-8",
    title: "WACC計算",
    text: "負債(時価400, コスト3%), 資本(時価600, コスト13%), 税率40%のWACC式は？",
    choices: [
      "0.5(1-0.4)3% + 0.5×13%",
      "0.5×0.4×3% + 0.5×13%",
      "0.4×3% + 0.6×13%",
      "0.4(1-0.4)3% + 0.6×13%",
      "0.4×0.4×3% + 0.6×13%"
    ],
    answer: 3,
    explanation: "WACC = D/(D+E) × (1-t) × Rd + E/(D+E) × Re\n比率: 負債40%, 資本60%。負債コストには節税効果(1-0.4)を考慮します。"
  },
  {
    id: "s28_14",
    source: "スマート問題集 2-8",
    title: "資金調達分類",
    text: "資金調達に関する記述として適切なものはどれか。",
    choices: [
      "内部留保と減価償却費は、内部金融である。",
      "内部金融とは企業外部から調達することである。",
      "直接金融とは仲介機関から資金を融通することである。",
      "間接金融とは仲介機関を経由しないことである。"
    ],
    answer: 0,
    explanation: "内部金融（自己金融）は、利益の蓄積（内部留保）や減価償却費など企業内部で生み出される資金です。直接/間接の定義は逆になっています。"
  },
  {
    id: "s28_15",
    source: "スマート問題集 2-8",
    title: "ファイナンス・リース",
    text: "ファイナンス・リース取引の定義として適切なものは？",
    choices: [
      "ノンキャンセラブルかつフルペイアウトである。",
      "途中解約可能でコスト負担がない。",
      "通常の賃貸借処理を行う。",
      "通常の資本取引として処理する。"
    ],
    answer: 0,
    explanation: "ファイナンス・リースは「解約不能（ノンキャンセラブル）」かつ「コスト実質負担（フルペイアウト）」の取引で、売買取引に準じて資産計上します。"
  },
  {
    id: "s28_16",
    source: "スマート問題集 2-8",
    title: "効率的市場仮説",
    text: "テクニカル分析無効は(A)、ファンダメンタル分析無効は(D)。",
    choices: [
      "A:ストロング D:セミストロング",
      "A:ウィーク D:セミストロング",
      "A:ランダム D:ウィーク",
      "A:ランダム D:セミストロング"
    ],
    answer: 1,
    explanation: "過去データの分析（テクニカル）が無効なのは「ウィーク型」。公開情報（ファンダメンタルズ）まで織り込み済みで無効なのは「セミストロング型」です。"
  },

  // --- 過去問セレクト 2-8 ---
  {
    id: "p28_1",
    source: "過去問セレクト 2-8",
    title: "リスク回避者の無差別曲線",
    text: "縦軸に期待収益率、横軸に標準偏差をとった平面上におけるリスク回避者の無差別曲線はどれか。",
    visualType: "indifference",
    choices: ["ア (右上がり・下に凸)", "イ (右下がり)", "ウ (右下がり・上に凸)", "エ (水平)"],
    answer: 0,
    explanation: "リスク回避者は、リスクが増えるならそれに見合うリターン増加を要求するため、右上がりになります。また、リスクが増えるほど要求するリターン幅が大きくなるため、下に凸（急勾配になっていく）形状となります。"
  },
  {
    id: "p28_2",
    source: "過去問セレクト 2-8",
    title: "相関係数 -1 のグラフ",
    text: "下図の①〜④のうち、相関係数が－1であるケースとして、最も適切なものはどれか。",
    visualType: "fan_chart",
    choices: ["① (直線)", "② (曲線)", "③ (より深い曲線)", "④ (折れ線・リスク0点あり)"],
    answer: 3,
    explanation: "相関係数が-1（完全逆相関）の場合、リスクを完全にゼロにできる組み合わせが存在します。したがって、Y軸（リスク0）に接する折れ線グラフとなっている④が正解です。"
  },
  {
    id: "p28_3",
    source: "過去問セレクト 2-8",
    title: "市場ポートフォリオの性質",
    text: "証券投資論に関する記述として適切なものはどれか。",
    choices: [
      "効率的フロンティアは安全資産よりリターンが高い集合である。",
      "最適なリスクPFは、投資家のリスク回避度とは無関係に決まる。",
      "市場PFのリスクは最小である。",
      "リスク回避度は効率的フロンティアに影響を与える。"
    ],
    answer: 1,
    explanation: "トービンの分離定理により、最適なリスク資産ポートフォリオ（接点ポートフォリオ）の構成は、投資家の選好とは無関係に市場の条件のみで決定されます。"
  },
  {
    id: "p28_4",
    source: "過去問セレクト 2-8",
    title: "安全資産と効率的フロンティア",
    text: "安全資産が存在し、かつ借入ができない場合の効率的フロンティアは？",
    choices: [
      "曲線ABCD",
      "点Cのみ",
      "曲線BCD上の点D寄り",
      "FCDを結んだ線"
    ],
    answer: 3,
    explanation: "借入ができない場合、安全資産Fから接点Cまでの直線と、Cから右側の効率的フロンティア曲線Dを繋いだ「FCD」が有効なフロンティアとなります。"
  },
  {
    id: "p28_5",
    source: "過去問セレクト 2-8",
    title: "ポートフォリオ理論の基礎",
    text: "適切な記述はどれか。",
    choices: [
      "PFのリスクは加重平均で求まる。",
      "PFのリターンは加重平均で求まる。",
      "相関係数が大きいほどリスク低減効果は高い。",
      "PFのリスクは投資比率に反比例する。"
    ],
    answer: 1,
    explanation: "リターンは単純な加重平均で計算できます。リスク（標準偏差）は相関関係が影響するため加重平均にはなりません（通常それより小さくなります）。"
  },
  {
    id: "p28_6",
    source: "過去問セレクト 2-8",
    title: "CAPMの概念",
    text: "CAPMに関する記述として適切なものはどれか。",
    choices: [
      "β<1の証券のリターンは無リスク金利より低い。",
      "β=0の証券のリターンはゼロである。",
      "均衡状態では全員が市場PFを保有する。",
      "市場PFのリターンは市場リスクプレミアムと呼ばれる。"
    ],
    answer: 2,
    explanation: "CAPMの世界（均衡状態）では、すべての投資家はリスク資産として市場ポートフォリオを保有し、それと安全資産を組み合わせてリスク調整を行います。"
  },
  {
    id: "p28_7",
    source: "過去問セレクト 2-8",
    title: "CAPM計算(2)",
    text: "Rm=8%, Rf=3%, β=1.4のとき、期待収益率は？",
    choices: ["4.4%", "7.0%", "10.0%", "11.2%"],
    answer: 2,
    explanation: "3% + 1.4 × (8% - 3%) = 3% + 7% = 10%。（税率は関係ありません）"
  },
  {
    id: "p28_8",
    source: "過去問セレクト 2-8",
    title: "WACC計算(2)",
    text: "株価1200円, 5万株, 負債4000万円(金利4%), 自己資本コスト12%, 税率30%。WACCは？",
    visualType: "wacc_box",
    choices: ["6.16%", "7.68%", "8.32%", "8.80%"],
    answer: 2,
    explanation: "時価資本 = 1200×5万 = 6000万円。総資本=1億円。\n負債比率0.4, 資本比率0.6。\nWACC = 0.4×4%×(1-0.3) + 0.6×12% = 1.12% + 7.2% = 8.32%"
  },
  {
    id: "p28_9",
    source: "過去問セレクト 2-8",
    title: "直接金融・間接金融",
    text: "適切な記述はどれか。",
    choices: [
      "証券会社を通じた株式取得は、企業にとって直接金融である。",
      "銀行の株式発行は間接金融である。",
      "「貯蓄から投資」は間接金融を増やすことである。",
      "社債発行は間接金融である。"
    ],
    answer: 0,
    explanation: "証券会社はあくまで仲介であり、市場から資金を調達するため直接金融です。社債も直接金融です。"
  },
  {
    id: "p28_10",
    source: "過去問セレクト 2-8",
    title: "ファイナンス・リースの特徴",
    text: "最も不適切な記述はどれか。",
    choices: [
      "通常、中途解約できない。",
      "維持管理費用は貸し手が負担する。",
      "借り手のBSに計上される。",
      "借り手が減価償却を行う。"
    ],
    answer: 1,
    explanation: "ファイナンス・リースは「フルペイアウト（コスト負担）」が要件であり、維持管理費用や修繕費は『借り手』が負担します。"
  },
  {
    id: "p28_11",
    source: "過去問セレクト 2-8",
    title: "リース会計",
    text: "適切な処理はどれか。",
    choices: [
      "減価償却は常にリース期間で行う。",
      "1年以内の債務は流動負債とする。",
      "計上額は常にリース料総額とする。",
      "1年以内満了資産は流動資産とする。"
    ],
    answer: 1,
    explanation: "リース債務も通常の負債と同様、ワン・イヤー・ルールに基づき、1年以内返済分は流動負債とします。減価償却期間は、所有権移転の有無により異なります。"
  },
  {
    id: "p28_12",
    source: "過去問セレクト 2-8",
    title: "リスクの定義",
    text: "適切な記述はどれか。",
    choices: [
      "安全資産は期待収益率ゼロである。",
      "完全正相関の分散投資ではリスク低減効果は得られない。",
      "社債の方が株式よりリスクが高い。",
      "分散投資でリスクをゼロにできる。"
    ],
    answer: 1,
    explanation: "相関係数が+1（完全正相関）の場合、リスク分散効果は全く働きません（直線になります）。"
  },
  {
    id: "p28_13",
    source: "過去問セレクト 2-8",
    title: "効率的市場仮説(不適切)",
    text: "不適切な記述はどれか。",
    choices: [
      "ウィーク型は過去データで予測不可能とする。",
      "効率的市場では価格形成が効率的である。",
      "取引効率性とはシステムが機能していることである。",
      "セミストロング型ではファンダメンタル分析で超過収益が得られる。"
    ],
    answer: 3,
    explanation: "セミストロング型仮説では、公開情報（財務諸表など）は既に価格に織り込まれているとするため、ファンダメンタル分析を行っても超過収益は得られません。"
  },
  {
    id: "p28_14",
    source: "過去問セレクト 2-8",
    title: "セミストロング型",
    text: "適切な記述はどれか。",
    choices: [
      "インサイダーでも勝てない。",
      "価格は公に入手可能な情報を反映する。",
      "価格は規則的に変動する。",
      "将来価格は確実に予測できる。"
    ],
    answer: 1,
    explanation: "セミストロング型は「公開情報」が反映されている状態です。インサイダー情報まで反映されているのはストロング型です。"
  },
  {
    id: "p28_15",
    source: "過去問セレクト 2-8",
    title: "サステナブル成長率",
    text: "適切な記述はどれか。",
    choices: [
      "全額配当なら成長率はリスクフリーレートになる。",
      "成長率はROE×配当性向である。",
      "内部留保率には左右されない。",
      "配当割引モデルの成長率として利用できる。"
    ],
    answer: 3,
    explanation: "サステナブル成長率 = ROE × (1 - 配当性向) = ROE × 内部留保率。これは企業の持続可能な成長率として、理論株価算定時のgとして利用可能です。"
  },
  {
    id: "p28_16",
    source: "過去問セレクト 2-8",
    title: "市場リスクの例",
    text: "市場リスクの適切な組み合わせは？ a:為替リスク b:信用リスク c:金利リスク d:流動性リスク",
    choices: ["aとb", "aとc", "aとd", "bとc", "bとd"],
    answer: 1,
    explanation: "市場リスクは市場価格の変動によるリスクです。為替(a)と金利(c)が該当します。bは信用リスク、dは流動性リスクです。"
  },

  // --- スマート問題集 2-9 ---
  {
    id: "s29_1",
    source: "スマート問題集 2-9",
    title: "ゼロ成長モデル",
    text: "FCF=1000万, 資本コスト10%の企業価値(ゼロ成長)は？",
    choices: ["1,100万", "1億円", "1億1,000万", "2億円", "3億円"],
    answer: 1,
    explanation: "V = FCF / r = 1000万 / 0.1 = 1億円。"
  },
  {
    id: "s29_2",
    source: "スマート問題集 2-9",
    title: "定率成長モデル",
    text: "1年後FCF=1000万, 成長率5%, コスト10%の企業価値は？",
    choices: ["1,100万", "1億円", "1億1,000万", "2億円", "3億円"],
    answer: 3,
    explanation: "V = FCF1 / (r - g) = 1000万 / (0.1 - 0.05) = 1000万 / 0.05 = 2億円。"
  },
  {
    id: "s29_3",
    source: "スマート問題集 2-9",
    title: "収益還元法",
    text: "税引後利益1000万, 資本還元率10%の企業価値は？",
    choices: ["1億円", "1.1億円", "1.5億円", "2億円", "3億円"],
    answer: 0,
    explanation: "V = 利益 / r = 1000万 / 0.1 = 1億円。"
  },
  {
    id: "s29_4",
    source: "スマート問題集 2-9",
    title: "配当還元法",
    text: "配当1000万, 還元率10%, 負債1億円の企業価値は？",
    choices: ["1億円", "1.1億円", "1.5億円", "2億円", "3億円"],
    answer: 3,
    explanation: "株主価値 = 配当/r = 1000万/0.1 = 1億円。\n企業価値 = 株主価値 + 負債 = 1億 + 1億 = 2億円。"
  },
  {
    id: "s29_5",
    source: "スマート問題集 2-9",
    title: "簿価/時価純資産法",
    text: "資産(簿5000/時6000), 負債(簿2000/時2000)。簿価・時価純資産法による価値は？",
    choices: [
      "簿3000/時3000",
      "簿3000/時4000",
      "簿4000/時3000",
      "簿5000/時6000"
    ],
    answer: 1,
    explanation: "簿価純資産 = 5000 - 2000 = 3000万円。\n時価純資産 = 6000 - 2000 = 4000万円。"
  },
  {
    id: "s29_6",
    source: "スマート問題集 2-9",
    title: "M&A手法",
    text: "買収先資産を担保に資金を借りて買収する手法は？",
    choices: ["TOB", "MBO", "EBO", "LBO"],
    answer: 3,
    explanation: "LBO (Leveraged Buy Out) は、買収先の資産やCFを担保に多額の負債(レバレッジ)を利用して買収する手法です。"
  },
  {
    id: "s29_7",
    source: "スマート問題集 2-9",
    title: "MM理論",
    text: "MM理論(法人税なし)の説明として不適切なものは？",
    choices: [
      "企業価値は資本構成に依存しない。",
      "最適資本構成は存在しない。",
      "WACCの最小値が存在する。",
      "法人税がある現実では資本構成に依存する。"
    ],
    answer: 2,
    explanation: "法人税のない完全市場では、WACCは一定となり、最小値は存在しません（資本構成に関わらず一定）。"
  },
  {
    id: "s29_8",
    source: "スマート問題集 2-9",
    title: "理論株価",
    text: "N社(配当一定100万), O社(成長5%, 初年度100万), r=10%, 1000株。株価は？",
    choices: ["N:1万 O:1万", "N:2万 O:1万", "N:1万 O:2万", "N:2万 O:2万"],
    answer: 2,
    explanation: "N社(ゼロ成長): 100万/0.1 = 1000万。株価=1000万/1000株=1万円。\nO社(定率成長): 100万/(0.1-0.05) = 2000万。株価=2000万/1000株=2万円。"
  },
  {
    id: "s29_9",
    source: "スマート問題集 2-9",
    title: "PER",
    text: "株価収益率(PER)の説明として適切なものは？",
    choices: [
      "株価 / 1株当たり純利益",
      "純利益 / 発行済株式数",
      "株価 / 1株当たり純資産",
      "純資産 / 発行済株式数"
    ],
    answer: 0,
    explanation: "PER = 株価 / EPS (1株当たり純利益) です。"
  },
  {
    id: "s29_10",
    source: "スマート問題集 2-9",
    title: "PBR",
    text: "売上2億, 純利1000万, 純資産1億(10万株), 株価1500円。PBRは？",
    choices: ["0.75倍", "1倍", "1.5倍", "15倍", "150倍"],
    answer: 2,
    explanation: "BPS = 1億/10万株 = 1000円。\nPBR = 株価/BPS = 1500/1000 = 1.5倍。"
  },
  {
    id: "s29_11",
    source: "スマート問題集 2-9",
    title: "配当利回り",
    text: "PBR2.5倍, 配当性向50%, ROE10%のとき、配当利回りは？",
    choices: ["1%", "2%", "3%", "4%", "5%"],
    answer: 1,
    explanation: "ROE = PBR × 配当利回り ÷ 配当性向\n10% = 2.5 × ? ÷ 50%\n0.1 = 5 × ?\n? = 0.02 = 2%"
  },
  {
    id: "s29_12",
    source: "スマート問題集 2-9",
    title: "為替予約",
    text: "1ユーロ100円で買う予約(R社)。円安(110円)になったら？",
    visualType: "forex_chart",
    choices: [
      "青実線はX銀行の損益。",
      "赤点線はR社の損益。",
      "円高になるとR社は損失を被る。",
      "円高になるとY銀行は利益を得る。"
    ],
    answer: 2,
    explanation: "R社は「買う予約」をしているため、市場価格が上がれば(円安)、安く買える予約により利益が出ます。逆に円高になれば、高く買うことになり損失が出ます（青実線）。"
  },
  {
    id: "s29_13",
    source: "スマート問題集 2-9",
    title: "先渡・先物",
    text: "適切な記述はどれか。",
    choices: [
      "両方とも将来の価格で売買する契約である。",
      "両方とも店頭取引である。",
      "先物取引は条件を任意に決められる。",
      "先渡取引は取引所が保証するため信用リスクが低い。"
    ],
    answer: 0,
    explanation: "両者の定義は「将来の売買契約」で共通です。先物は取引所(定型)、先渡は店頭(任意)です。"
  },
  {
    id: "s29_14",
    source: "スマート問題集 2-9",
    title: "オプション取引",
    text: "適切な記述はどれか。",
    choices: [
      "権利を売買する取引である。",
      "売る権利をコール、買う権利をプットという。",
      "満期日のみ行使可能をアメリカンという。",
      "いつでも行使可能をヨーロピアンという。"
    ],
    answer: 0,
    explanation: "オプションは「権利」の取引です。売る権利はプット、満期日のみはヨーロピアンです。"
  },
  {
    id: "s29_15",
    source: "スマート問題集 2-9",
    title: "プット・オプション",
    text: "プット買い(S社)の損益図について。適切なものは？",
    visualType: "put_chart",
    choices: [
      "青実線はS社の損益。",
      "赤点線はS社の損益。",
      "円高になるとS社は損失。",
      "円高になるとY銀行は利益。"
    ],
    answer: 1,
    explanation: "プット買い（売る権利）は、価格が下がれば（円高）、高く売れる権利を行使して利益が出ます。円安なら放棄して損失限定です。図の赤点線が「利益無限大・損失限定」の買い手の形です。"
  },
  {
    id: "s29_16",
    source: "スマート問題集 2-9",
    title: "オプション価格",
    text: "価格は(A)価値と(B)価値からなる。図は(C)オプション。(D)いとき(A)がある。",
    visualType: "value_chart",
    choices: [
      "A:時間 B:本質 C:コール D:高い",
      "A:時間 B:本質 C:プット D:低い",
      "A:本質 B:時間 C:プット D:低い",
      "A:本質 B:時間 C:コール D:高い"
    ],
    answer: 3,
    explanation: "オプション価格(プレミアム) = 本質的価値 + 時間的価値。図は右肩上がりなのでコールオプション。原資産価格が高いほど本質的価値が生じます。"
  }
];

// --- メインアプリ ---

export default function App() {
  const [view, setView] = useState('list'); // list, quiz
  const [filterMode, setFilterMode] = useState('all'); // all, incorrect, review
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userState, setUserState] = useState({
    history: {}, // { id: boolean (isCorrect) }
    reviews: {}  // { id: boolean }
  });
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Load / Save
  useEffect(() => {
    const saved = localStorage.getItem('sm_finance_app_v1');
    if (saved) setUserState(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sm_finance_app_v1', JSON.stringify(userState));
  }, [userState]);

  // Derived List
  const targetQuestions = useMemo(() => {
    if (filterMode === 'incorrect') {
      return QUESTIONS.filter(q => userState.history[q.id] === false);
    }
    if (filterMode === 'review') {
      return QUESTIONS.filter(q => userState.reviews[q.id]);
    }
    return QUESTIONS;
  }, [filterMode, userState]);

  const currentQ = targetQuestions[currentIdx];

  // Logic
  const handleStart = (mode) => {
    setFilterMode(mode);
    setCurrentIdx(0);
    setSelectedChoice(null);
    setShowExplanation(false);
    setView('quiz');
  };

  const handleAnswer = (choiceIdx) => {
    if (showExplanation) return;
    setSelectedChoice(choiceIdx);
    setShowExplanation(true);
    const isCorrect = choiceIdx === currentQ.answer;
    
    setUserState(prev => ({
      ...prev,
      history: { ...prev.history, [currentQ.id]: isCorrect }
    }));
  };

  const handleNext = () => {
    if (currentIdx < targetQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedChoice(null);
      setShowExplanation(false);
    } else {
      setView('list');
    }
  };

  const toggleReview = (id) => {
    setUserState(prev => ({
      ...prev,
      reviews: { ...prev.reviews, [id]: !prev.reviews[id] }
    }));
  };

  // Renderers
  const renderVisual = (type) => {
    switch (type) {
      case 'indifference': return <IndifferenceCurves />;
      case 'fan_chart': return <CorrelationFanChart />;
      case 'wacc_box': return <WaccBox />;
      case 'funding_tree': return <FundingTree />;
      case 'forex_chart': return <OptionChart type="forex" />;
      case 'put_chart': return <OptionChart type="put" />;
      case 'value_chart': return <OptionChart type="value" />;
      default: return null;
    }
  };

  if (view === 'list') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
        <div className="max-w-3xl mx-auto space-y-6">
          <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center space-y-2">
            <h1 className="text-2xl font-bold text-blue-700 flex items-center justify-center gap-2">
              <BookOpen className="w-8 h-8" />
              財務・会計 マスター
            </h1>
            <p className="text-sm text-slate-500">資本市場 / 現代ファイナンス / 過去問演習</p>
            <div className="flex justify-center gap-4 text-sm mt-4">
              <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500"/> 正解: {Object.values(userState.history).filter(v=>v).length}</div>
              <div className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-orange-500"/> 要復習: {Object.values(userState.reviews).filter(v=>v).length}</div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => handleStart('all')}
              className="p-4 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" /> 全問スタート
            </button>
            <button 
              onClick={() => handleStart('incorrect')}
              disabled={!Object.values(userState.history).includes(false)}
              className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold shadow-sm hover:bg-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-5 h-5" /> 不正解のみ
            </button>
            <button 
              onClick={() => handleStart('review')}
              disabled={!Object.values(userState.reviews).some(v=>v)}
              className="p-4 bg-orange-100 text-orange-700 border border-orange-200 rounded-xl font-bold shadow-sm hover:bg-orange-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Bookmark className="w-5 h-5" /> 要復習のみ
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-100 border-b font-semibold text-slate-600 flex justify-between">
              <span>問題一覧</span>
              <span className="text-xs self-center">全{QUESTIONS.length}問</span>
            </div>
            <div className="divide-y max-h-[60vh] overflow-y-auto">
              {QUESTIONS.map((q, i) => {
                const history = userState.history[q.id];
                const isReview = userState.reviews[q.id];
                return (
                  <div key={q.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-mono">{q.source}</span>
                      <span className="text-sm font-medium">{q.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {isReview && <Bookmark className="w-4 h-4 text-orange-500 fill-orange-500" />}
                      {history === true && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {history === false && <XCircle className="w-5 h-5 text-red-500" />}
                      {history === undefined && <div className="w-5 h-5 border-2 rounded-full border-slate-200" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center space-y-4">
      <div className="text-xl font-bold text-slate-400">対象の問題がありません</div>
      <button onClick={() => setView('list')} className="text-blue-600 underline">一覧に戻る</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div className="text-center">
          <div className="text-[10px] text-slate-400">{currentQ.source}</div>
          <div className="text-sm font-bold">Q.{currentIdx + 1} / {targetQuestions.length}</div>
        </div>
        <button 
          onClick={() => toggleReview(currentQ.id)}
          className={`p-2 rounded-full ${userState.reviews[currentQ.id] ? 'text-orange-500 bg-orange-50' : 'text-slate-300'}`}
        >
          <Bookmark className={`w-5 h-5 ${userState.reviews[currentQ.id] ? 'fill-orange-500' : ''}`} />
        </button>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8 space-y-6 pb-24">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">{currentQ.title}</h2>
          <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{currentQ.text}</p>
          {currentQ.visualType && (
            <div className="my-4 border rounded-xl overflow-hidden bg-slate-100 p-2 md:p-4">
              {renderVisual(currentQ.visualType)}
            </div>
          )}
        </div>

        <div className="grid gap-3">
          {currentQ.choices.map((choice, i) => {
            let stateStyle = "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50";
            if (showExplanation) {
              if (i === currentQ.answer) stateStyle = "border-green-500 bg-green-50 text-green-800 font-bold";
              else if (i === selectedChoice) stateStyle = "border-red-500 bg-red-50 text-red-800";
              else stateStyle = "border-slate-100 text-slate-400 opacity-50";
            }
            return (
              <button
                key={i}
                disabled={showExplanation}
                onClick={() => handleAnswer(i)}
                className={`w-full p-4 text-left border-2 rounded-xl transition-all ${stateStyle} flex items-center justify-between group`}
              >
                <span>{choice}</span>
                {showExplanation && i === currentQ.answer && <Check className="w-5 h-5 text-green-600" />}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-2 h-full ${selectedChoice === currentQ.answer ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg font-bold ${selectedChoice === currentQ.answer ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedChoice === currentQ.answer ? "正解！" : "不正解..."}
                </span>
              </div>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                <span className="font-bold text-slate-800 block mb-2">【解説】</span>
                {currentQ.explanation}
              </div>
              
              <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500 hover:text-orange-600 transition">
                  <input 
                    type="checkbox" 
                    checked={!!userState.reviews[currentQ.id]} 
                    onChange={() => toggleReview(currentQ.id)}
                    className="accent-orange-500 w-4 h-4"
                  />
                  要復習リストに追加
                </label>
                <button 
                  onClick={handleNext}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2"
                >
                  {currentIdx < targetQuestions.length - 1 ? '次の問題へ' : '結果一覧へ'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}