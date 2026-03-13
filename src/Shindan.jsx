import { useState, useEffect, useRef, useReducer, useCallback, memo } from "react";

// ─── Fonts ───────────────────────────────────────────────
const Fonts = () => (
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=DM+Mono:ital,wght@0,300;0,400;1,300&family=Noto+Sans+JP:wght@300;400&display=swap" />
);

// ─── Keyframes ───────────────────────────────────────────
const KF = `
@keyframes kFadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes kFadeIn   { from{opacity:0} to{opacity:1} }
@keyframes kSlideUp  { from{transform:translateY(100%)} to{transform:translateY(0)} }
@keyframes kPulse    { 0%,100%{opacity:.25} 50%{opacity:.8} }
@keyframes kWrite    { from{width:0} to{width:100%} }
@keyframes kBlink    { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes kScaleIn  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
`;

// ─── Design tokens: 紙・インク ────────────────────────────
const C = {
  paper:    "#f8f4ef",
  cream:    "#f2ede6",
  fog:      "#e8e2d9",
  rule:     "#d4cdc3",
  ash:      "#b8b0a4",
  mist:     "#8c8278",
  stone:    "#5c5248",
  ink:      "#2c1a0e",
  deep:     "#1a0f06",
  // single warm accent
  sienna:   "#8b4513",
  siennaLt: "#c4693a",
};

const SERIF = "'Shippori Mincho', 'Hiragino Mincho ProN', Georgia, serif";
const MONO  = "'DM Mono', 'Courier New', monospace";
const SANS  = "'Noto Sans JP', 'Hiragino Sans', sans-serif";

// ─── Quiz data (30問・4軸) ────────────────────────────────
const QUIZ = [
  // 軸1: RS  Resonance(-) ↔ Solitude(+)
  { id:"q01", axis:"RS", label:"エネルギーの向き",
    L:"週末は友人や家族と賑やかに過ごす", R:"週末は一人でゆっくり自分の時間を楽しむ" },
  { id:"q02", axis:"RS", label:"エネルギーの向き",
    L:"考えながら話すことで思考が整理される", R:"十分に考えてからでないと話したくない" },
  { id:"q03", axis:"RS", label:"エネルギーの向き",
    L:"初対面の人とすぐ打ち解けられる方だ", R:"初対面は様子を見てから関わりたい" },
  { id:"q04", axis:"RS", label:"エネルギーの向き",
    L:"グループで何かを作り上げるのが好き", R:"一人で黙々と取り組む方が好き" },
  { id:"q05", axis:"RS", label:"エネルギーの向き",
    L:"沈黙が続くと少し落ち着かない", R:"沈黙はむしろ心地よいと感じる" },
  { id:"q06", axis:"RS", label:"エネルギーの向き",
    L:"自分の感情は表に出やすい方だ", R:"自分の感情は内に秘めやすい方だ" },
  { id:"q07", axis:"RS", label:"エネルギーの向き",
    L:"多くの人と広く関わるのが心地よい", R:"少数の人と深く関わる方が好き" },
  // 軸2: CA  Concrete(-) ↔ Abstract(+)
  { id:"q08", axis:"CA", label:"情報の捉え方",
    L:"事実やデータなど具体的な根拠を重視する", R:"直感や全体的なひらめきを重視する" },
  { id:"q09", axis:"CA", label:"情報の捉え方",
    L:"決まった手順通りに進めるのが好き", R:"自分なりの方法を模索するのが好き" },
  { id:"q10", axis:"CA", label:"情報の捉え方",
    L:"今ここにある具体的なことに集中できる", R:"未来の可能性やまだ見ぬことをよく考える" },
  { id:"q11", axis:"CA", label:"情報の捉え方",
    L:"直接的・具体的な言葉の方が好き", R:"メタファーや象徴的な表現に惹かれる" },
  { id:"q12", axis:"CA", label:"情報の捉え方",
    L:"実体験や事例から学ぶのが好き", R:"理論や概念から入るのが好き" },
  { id:"q13", axis:"CA", label:"情報の捉え方",
    L:"「使えるか」を基準に情報を選ぶ", R:"「面白いか」を基準に情報を選ぶ" },
  { id:"q14", axis:"CA", label:"情報の捉え方",
    L:"現実的で実行しやすい解決策を好む", R:"革新的で新しいアイデアを好む" },
  { id:"q15", axis:"CA", label:"情報の捉え方",
    L:"細部の正確さが気になる", R:"全体の方向性の方が気になる" },
  // 軸3: LE  Logic(-) ↔ Empathy(+)
  { id:"q16", axis:"LE", label:"判断の基準",
    L:"客観的な基準や論理で判断する", R:"関係者の感情も含めて判断する" },
  { id:"q17", axis:"LE", label:"判断の基準",
    L:"批判的なフィードバックは率直に伝える", R:"相手への影響を考えて言葉を選ぶ" },
  { id:"q18", axis:"LE", label:"判断の基準",
    L:"論理的で根拠のある議論が好き", R:"感情を無視した議論は不完全だと思う" },
  { id:"q19", axis:"LE", label:"判断の基準",
    L:"正しいことを貫く方が大事なことがある", R:"関係を保ち調和する方が大事なことがある" },
  { id:"q20", axis:"LE", label:"判断の基準",
    L:"決断に感情を持ち込まない方がいい", R:"感情も重要な判断材料だと思う" },
  { id:"q21", axis:"LE", label:"判断の基準",
    L:"「なぜそう思うか」の理由を聞く", R:"「どう感じたか」の感情を聞く" },
  { id:"q22", axis:"LE", label:"判断の基準",
    L:"問題解決では効率を優先する", R:"問題解決では関係性の維持を優先する" },
  // 軸4: SF  Structure(-) ↔ Flow(+)
  { id:"q23", axis:"SF", label:"行動スタイル",
    L:"予定は早めに計画を立てて動きたい", R:"直前まで選択肢を開けておきたい" },
  { id:"q24", axis:"SF", label:"行動スタイル",
    L:"決まったルーティンがあると安心する", R:"毎日変化がある方が楽しい" },
  { id:"q25", axis:"SF", label:"行動スタイル",
    L:"旅行は事前にしっかり計画を立てる", R:"行き当たりばったりの旅が好き" },
  { id:"q26", axis:"SF", label:"行動スタイル",
    L:"タスクは一つずつ完了させてから次へ", R:"複数のことを同時進行させる" },
  { id:"q27", axis:"SF", label:"行動スタイル",
    L:"「完了している」状態が心地よい", R:"「進行中・模索中」の状態が心地よい" },
  { id:"q28", axis:"SF", label:"行動スタイル",
    L:"物事の見通しが立っていると安心する", R:"状況が流動的でも柔軟に対応できる" },
  { id:"q29", axis:"SF", label:"行動スタイル",
    L:"ルールはきちんと守ることが大切だ", R:"状況次第でルールは変えてよいと思う" },
  { id:"q30", axis:"SF", label:"行動スタイル",
    L:"今あることをとことん深めたい", R:"新しいことをどんどん始めたい" },
];

const FREE_QS = [
  { id:"books",   icon:"📚", label:"好きな本",                hint:"" },
  { id:"movies",  icon:"🎬", label:"好きな映画・ドラマ",      hint:"" },
  { id:"youtube", icon:"📺", label:"好きなYoutubeチャンネルは？", hint:"" },
  { id:"music",   icon:"🎵", label:"好きな音楽・アーティスト", hint:"" },
];

const LLM_PROMPT = `<task>
Perform a deep psychological personality analysis based on our full conversation history.
Output everything in Japanese.
</task>

<methodology>
Apply ALL of the following frameworks with evidence cited from our actual conversations:
1. Big Five (OCEAN) — score 1–10 per trait + specific evidence
2. Attachment Theory — style label + behavioral evidence from conversations
3. Schwartz's Basic Human Values — top 5 values ranked with grounding
4. Cognitive Style — dominant thinking pattern + recurring distortions if any
5. Love Language — all 5 ranked based on what I praise, complain about, or notice
</methodology>

<romantic_personality_analysis>
1. 無意識の愛着ニーズ（理想ではなく、実際に安心・充足感を感じる関係の条件）
2. 繰り返しやすい恋愛パターンと恐れていること
3. 本当に相性がいい相手の像（望む相手でなく、最も生き生きできる関係を作れる相手）
4. 見落としがちなグリーンフラグ
5. 無視しがちなレッドフラグ
6. パートナーとして提供できるものと出し惜しみしがちなもの
</romantic_personality_analysis>

<output_instructions>
【三行の肖像】この人物の本質を3文で。詩的に。
【Big Five分析】【愛着スタイル分析】【価値観ランキング】
【思考スタイル・認知パターン】【愛の言語ランキング】
【深層分析】【恋愛パターンと相性分析】

Rules:
- 感情を保護するために分析を曖昧にしないこと
- 証拠のない推測には「推測」と明記すること
- 日本語で1500字以上
</output_instructions>`;

// ─── API prompt builder ───────────────────────────────────
function buildPrompt(scores, freeData, llmResponse) {
  const fd = freeData || {};
  const freeText = FREE_QS.map(q => {
    const items = (fd[q.id] || []).filter(v => v.text?.trim());
    if (!items.length) return null;
    return `${q.label}:\n${items.map((v,i) => `  ${i+1}. ${v.text}`).join("\n")}`;
  }).filter(Boolean).join("\n\n");

  return `あなたは、市販の「誕生日別・数秘術で見る性格と相性」の本の執筆を担当するプロのライターです。以下の「この人専用のデータ」だけを根拠に、誰にでも当てはまる抽象的な表現は一切使わず、この人にしか当てはまらない具体的な分析文を書いてください。

■ 文字数（厳守）
- 合計で必ず4000字以上。不足は不可。
- [SECTION_1] は 1400字以上
- [SECTION_2] は 1000字以上
- [SECTION_3] は 800字以上
各セクションで上記字数を満たさないと無効とする。長く書くことを優先すること。

■ 絶対ルール
- 抽象的で誰にでも当てはまる表現は禁止。「心が豊か」「深い絆を求める」など曖昧なフレーズは使わない。
- かならず「入力データ」の数値・自由記述・深層分析の内容を引用・言い換えして根拠を示す。例：「エネルギー軸が＋○だから、一人の時間で充電する傾向が強い」「好きな本に△△とあることから、〜な世界観を持っている」。
- 見出しは【】で囲む（例：【数秘術によるあなたの運勢】【仕事と適性】【恋愛と人間関係】【隠された自己】）。本の1ページのように、見出しごとに段落でしっかり描写する。
- 二人称「あなたは〜」で統一。ネガティブな表現は避け、長所・可能性・アドバイスは肯定的に。

■ 入力データ（この3つだけを根拠に書く）

【データ1: 30問スコア（各軸の合計値）】
エネルギー軸（負=共鳴的・人と過ごすと充電, 正=独奏的・一人で充電）: ${scores?.RS ?? 0}
情報軸（負=具体的・事実重視, 正=抽象的・直感・アイデア重視）:       ${scores?.CA ?? 0}
判断軸（負=論理的・正しさ優先, 正=共感的・関係性優先）:       ${scores?.LE ?? 0}
行動軸（負=計画的・見通し重視, 正=流動的・柔軟重視）:       ${scores?.SF ?? 0}

【データ2: 自由記述（好きな本・映画・音楽など）】
${freeText || "（未入力）"}

【データ3: AIによる深層分析（ユーザーの会話履歴から）】
${llmResponse?.trim() || "（未入力）"}

---
■ 出力形式
必ず3セクションに分け、各区切りの直前に [SECTION_N] を1行で書くこと。この [SECTION_N] の行だけが出力テキスト内に現れる唯一のメタ情報とする。

[SECTION_1]
「総合性格・運勢・仕事」に相当する部分。
【数秘術によるあなたの運勢】【仕事と適性】のような見出しを本文中に含め、スコアの数値の意味を具体的に解釈する（例：RSが正なら「一人の時間を大切にし、深く考えてから話す傾向」など）。データ2・データ3の内容にも触れ、この人ならではの適性・人生の方向性・転機のようなものを段落で描写する。誰にでも言えるような一般論は書かない。まず字数を満たすこと。

[SECTION_2]
「恋愛と人間関係」に相当する部分。
【恋愛と人間関係】の見出しを本文中に含め、スコアとデータ3を根拠に、この人の恋愛のパターン・求めている関係・人との距離の取り方・パートナーに求めるものを具体的に書く。データ2（好きな本・映画など）から読み取れる価値観が恋愛にどう表れるかも書いてよい。占い本らしい温かみのある文体だが、内容はこの人専用であること。まず字数を満たすこと。

[SECTION_3]
「隠された自己・長所」に相当する部分。
【隠された自己】の見出しと、●長所（箇条書きで5つ以上）を必ず含める。データ1〜3から読み取れる「表には出しにくいけれど持っている強み」「周囲が気づきにくい魅力」を具体的に書く。ネガティブな表現は使わず、この人固有の魅力・強み・可能性だけを書くこと。まず字数を満たすこと。`;
}

// ─── Parse API response into sections ────────────────────
function parseSections(text) {
  const sections = { s1: "", s2: "", s3: "", s4: "" };
  if (!text) return sections;
  const parts = text.split(/\[SECTION_(\d)\]/);
  for (let i = 1; i < parts.length; i += 2) {
    const n = parseInt(parts[i]);
    const content = parts[i + 1]?.trim() || "";
    if (n === 1) sections.s1 = content;
    if (n === 2) sections.s2 = content;
    if (n === 3) sections.s3 = content;
    if (n === 4) sections.s4 = content;
  }
  // fallback: if no markers, put everything in s1
  if (!sections.s1 && text.trim()) sections.s1 = text.trim();
  return sections;
}

// ─── Fallback text ────────────────────────────────────────
function buildFallback(scores) {
  const s = scores || { RS: 0, CA: 0, LE: 0, SF: 0 };
  const solo = s.RS > 0;
  const abst = s.CA > 0;
  const empa = s.LE > 0;
  const flow = s.SF > 0;
  return {
    s1: `あなたは、${solo ? "内側に豊かな世界を持ち、一人の時間の中でエネルギーを取り戻す" : "人とのつながりの中でエネルギーを得て、関わりを通じて自分を発見していく"}人です。${abst ? "目の前の現実より、まだ見ぬ可能性や概念の世界に強く惹かれる傾向があり、" : "現実の手触りや具体的な事実を大切にしながら、"}${empa ? "感情の機微に敏感で、相手の言葉の奥にあるものを読み取ろうとします。" : "論理と根拠を信頼し、物事の本質を理性で見極めようとします。"}${flow ? "計画より流れを重視し、状況に応じて柔軟に方向を変えられる適応力があります。" : "見通しを持って動くことで安心を得る、確かな足取りの持ち主です。"}\n\nあなたの中には、他者がなかなか気づかない深みがあります。それはときに孤独感として現れることもありますが、同時にあなたを特別にしている核心でもあります。\n\nあなたの弱点があるとすれば、その豊かさを外に見せることへの抵抗が、誤解を招くことがあるかもしれません。あなたが「まだ準備できていない」と感じるとき、実際にはすでに十分なことが多い。`,
    s2: `恋愛において、あなたは「本当にわかり合える人」を深く求めています。表面的な付き合いには満足できず、魂の部分で通じ合えるかどうかを無意識に測っています。そのため、関係が深まるまでに時間がかかることが多く、その間に相手に誤解されてしまうこともあります。\n\n一方、本当に信頼できると感じた相手には、驚くほど深く献身的になります。これは美しい資質ですが、同時にその深さが重荷になる場合もあります。\n\n傷つくパターンとしては、自分の内側の世界を軽く扱われたと感じたとき、静かにしかし確実に距離を置いてしまうことがあります。それは相手に伝わらないまま関係が冷えることにつながりがちです。`,
    s3: `あなたと本当に合うのは、沈黙を怖れない人です。言葉が少なくても安心できる、存在そのものが心地よい関係を作れる人。そして、あなたの「見えない深さ」に興味を持ち続けてくれる人です。\n\n急かさず、でも逃げない。あなたが自分のペースで開いていくことを待てる、静かでありながら確かな強さを持つ人があなたを最も生き生きとさせます。\n\nコミュニケーションスタイルとしては、表面的な情報交換より、本質的な話ができる関係を好む人。笑いや軽さも大切にしながら、深い話になったとき真剣に向き合える人があなたには合います。`,
    s4: `あなたが次に進むための鍵は、「もう少しだけ、見せること」かもしれません。\n\nあなたの内側にあるものは、すでに十分に価値があります。それを磨き続けることも大切ですが、今のあなたのままで、少しずつ外に出していくことが、新しい関係と機会を引き寄せます。\n\n完璧でなくていい。準備ができていなくていい。あなたがそこにいるだけで、誰かの世界はすでに豊かになっています。`,
  };
}

// ─── Shared atoms ─────────────────────────────────────────
const Label = ({ children, style = {} }) => (
  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".22em", color: C.ash, textTransform: "uppercase", ...style }}>
    {children}
  </span>
);

const Divider = ({ style = {} }) => (
  <div style={{ height: 1, background: C.rule, ...style }} />
);

const PrimaryBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: "100%", padding: "16px 24px",
    background: disabled ? C.fog : C.ink,
    color: disabled ? C.ash : C.paper,
    border: "none", fontFamily: SANS, fontSize: 14, fontWeight: 400,
    letterSpacing: ".06em", cursor: disabled ? "default" : "pointer",
    transition: "background .2s", WebkitTapHighlightColor: "transparent",
  }}>
    {children}
  </button>
);

const GhostBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    width: "100%", padding: "14px 24px",
    background: "transparent", color: C.mist,
    border: `1px solid ${C.rule}`, fontFamily: MONO, fontSize: 10,
    letterSpacing: ".12em", cursor: "pointer",
    transition: "border-color .2s, color .2s", WebkitTapHighlightColor: "transparent",
  }}>
    {children}
  </button>
);

// Top nav
const Nav = ({ onBack, backLabel, right }) => (
  <div style={{
    height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", flexShrink: 0, background: C.paper,
    borderBottom: `1px solid ${C.rule}`,
  }}>
    <div style={{ width: 72 }}>
      {onBack && (
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          fontFamily: SANS, fontSize: 13, color: C.mist, padding: 0,
        }}>
          <span style={{ fontSize: 15 }}>←</span>{backLabel}
        </button>
      )}
    </div>
    <div style={{ width: 72, height: 26 }} />
    <div style={{ width: 72, display: "flex", justifyContent: "flex-end" }}>{right}</div>
  </div>
);

// Serial number generator
function serialNo() {
  const now = new Date();
  const d = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")}`;
  const n = String(Math.floor(Math.random() * 99999)).padStart(5, "0");
  return { date: d, serial: `#${n}` };
}

// ══════════════════════════════════════════════════════════
//  SCREENS
// ══════════════════════════════════════════════════════════

// ─── Landing ─────────────────────────────────────────────
const LandingScreen = memo(({ onNext }) => (
  <div style={{
    minHeight: "100dvh", display: "flex", flexDirection: "column",
    background: C.paper, animation: "kFadeIn .5s ease both",
    position: "relative", overflow: "hidden",
  }}>
    {/* subtle grain texture overlay */}
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: .035 }} aria-hidden>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
      <rect width="100%" height="100%" filter="url(#grain)"/>
    </svg>

    {/* very faint ruled lines like paper */}
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: .06 }} aria-hidden>
      {Array.from({ length: 30 }).map((_, i) => (
        <line key={i} x1="0" y1={i * 36 + 80} x2="100%" y2={i * 36 + 80} stroke={C.ink} strokeWidth=".5" />
      ))}
    </svg>

    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 28px", position: "relative" }}>
      <div style={{ paddingTop: 120, paddingBottom: 40, textAlign: "center" }}>
        <h1 style={{
          fontFamily: SERIF, fontSize: 48, fontWeight: 400,
          color: C.ink, lineHeight: 1.1, letterSpacing: "-.02em", marginBottom: 10,
        }}>
          <span style={{ whiteSpace: "nowrap", display: "inline-block" }}>
            심층 성격 분석 검사
          </span>
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 300, color: C.stone, lineHeight: 1.9, maxWidth: 320, margin: "0 auto 22px" }}>
          AI 통계 분석을 활용한 심층 성격 프로파일 연구
        </p>
        <h2 style={{
          fontFamily: SERIF, fontSize: 30, fontWeight: 400,
          color: C.ink, lineHeight: 1.3, letterSpacing: "-.01em", marginBottom: 6,
        }}>
          深層性格分析検査
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 300, color: C.stone, lineHeight: 1.9, maxWidth: 320, margin: "0 auto" }}>
          AI統計分析を活用した深層性格プロファイル研究
        </p>
      </div>

      <div style={{ marginTop: "auto", paddingBottom: 12 }}>
        <Divider style={{ marginBottom: 32 }} />

        <PrimaryBtn onClick={onNext}>Start</PrimaryBtn>
        <p style={{ textAlign: "center", fontFamily: MONO, fontSize: 9, color: C.ash, letterSpacing: ".16em", padding: "16px 0 32px" }}>
          about 3–5 minutes
        </p>
      </div>
    </div>
  </div>
));

// ─── Intro (nickname & birthday) ─────────────────────────
const IntroScreen = memo(({ onBack, onNext }) => {
  const [nickname, setNickname] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const canNext =
    nickname.trim().length > 0 &&
    year !== "" &&
    month !== "" &&
    day !== "";

  const years = Array.from({ length: 2026 - 1980 + 1 }, (_, i) => 1980 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const birthdayValue =
    year && month && day
      ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      : "";

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: C.paper, animation: "kFadeIn .4s ease both" }}>
      <Nav onBack={onBack} backLabel="Back" />
      <div style={{ flex: 1, padding: "32px 28px 48px", display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label style={{ display: "block", marginBottom: 8 }}>ユーザーネーム</Label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="入力する"
              style={{
                width: "100%",
                padding: "10px 0",
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${C.rule}`,
                fontFamily: SERIF,
                fontSize: 15,
                color: C.ink,
                outline: "none",
              }}
              onFocus={e => e.target.style.borderBottomColor = C.sienna}
              onBlur={e => e.target.style.borderBottomColor = C.rule}
            />
          </div>

          <div>
            <Label style={{ display: "block", marginBottom: 8 }}>生年月日</Label>
            <div style={{ display: "flex", gap: 12 }}>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px solid ${C.rule}`,
                  fontFamily: MONO,
                  fontSize: 13,
                  color: C.ink,
                  outline: "none",
                  appearance: "none",
                }}
                onFocus={e => e.target.style.borderBottomColor = C.sienna}
                onBlur={e => e.target.style.borderBottomColor = C.rule}
              >
                <option value="">年</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                style={{
                  width: 80,
                  padding: "8px 0",
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px solid ${C.rule}`,
                  fontFamily: MONO,
                  fontSize: 13,
                  color: C.ink,
                  outline: "none",
                  appearance: "none",
                }}
                onFocus={e => e.target.style.borderBottomColor = C.sienna}
                onBlur={e => e.target.style.borderBottomColor = C.rule}
              >
                <option value="">月</option>
                {months.map(m => (
                  <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                ))}
              </select>
              <select
                value={day}
                onChange={e => setDay(e.target.value)}
                style={{
                  width: 80,
                  padding: "8px 0",
                  background: "transparent",
                  border: `1px solid transparent`,
                  borderBottom: `1px solid ${C.rule}`,
                  fontFamily: MONO,
                  fontSize: 13,
                  color: C.ink,
                  outline: "none",
                  appearance: "none",
                }}
                onFocus={e => e.target.style.borderBottomColor = C.sienna}
                onBlur={e => e.target.style.borderBottomColor = C.rule}
              >
                <option value="">日</option>
                {days.map(d => (
                  <option key={d} value={d}>{String(d).padStart(2, "0")}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto" }}>
          <PrimaryBtn
            onClick={() => onNext({ nickname: nickname.trim(), birthday: birthdayValue })}
            disabled={!canNext}
          >
            次へ
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
});

// ─── Language selection ───────────────────────────────────
const LANG_OPTIONS = [
  { id: "ja", label: "日本語" },
  { id: "ko", label: "韓国語" },
  { id: "en", label: "英語" },
  { id: "ru", label: "ロシア語" },
  { id: "zh", label: "中国語" },
];

const LanguageScreen = memo(({ onBack, onNext }) => (
  <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: C.paper, animation: "kFadeIn .4s ease both" }}>
    <Nav onBack={onBack} backLabel="戻る" />
    <div style={{ flex: 1, padding: "32px 28px 48px", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <Label style={{ display: "block", marginBottom: 12 }}>言語を選んでください</Label>
        <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: C.ink, lineHeight: 1.6 }}>
          表示する言語を選んでください
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {LANG_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => onNext(opt.id)}
            style={{
              width: "100%",
              padding: "16px 20px",
              textAlign: "left",
              background: "transparent",
              border: `1px solid ${C.rule}`,
              borderRadius: 8,
              fontFamily: SERIF,
              fontSize: 16,
              color: C.ink,
              cursor: "pointer",
              transition: "border-color .2s, background .2s",
            }}
            onMouseEnter={e => { e.target.style.borderColor = C.sienna; e.target.style.background = C.cream; }}
            onMouseLeave={e => { e.target.style.borderColor = C.rule; e.target.style.background = "transparent"; }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 24 }}>
        <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 300, color: C.ash, textAlign: "center" }}>
          選択した言語は診断結果の表示に利用されます
        </p>
      </div>
    </div>
  </div>
));

// ─── Quiz ─────────────────────────────────────────────────
const QuizScreen = memo(({ onNext }) => {
  const total = QUIZ.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const q = QUIZ[step];
  const isDone = !q || step >= total;
  const doneRef = useRef(false);

  useEffect(() => {
    if (isDone && !doneRef.current) {
      doneRef.current = true;
      const scores = { RS: 0, CA: 0, LE: 0, SF: 0 };
      QUIZ.forEach(qi => {
        const a = answers[qi.id];
        if (a !== undefined) scores[qi.axis] += a;
      });
      onNext(scores);
    }
  }, [isDone, answers, onNext]);

  const advance = useCallback((currentAnswers) => {
    if (step < total - 1) {
      setStep(s => s + 1);
    } else {
      const scores = { RS: 0, CA: 0, LE: 0, SF: 0 };
      QUIZ.forEach(qi => {
        const a = currentAnswers[qi.id];
        if (a !== undefined) scores[qi.axis] += a;
      });
      onNext(scores);
    }
  }, [step, total, onNext]);

  const select = useCallback((v) => {
    if (!q) return;
    const next = { ...answers, [q.id]: v };
    setAnswers(next);
    setTimeout(() => advance(next), 340);
  }, [answers, q, advance]);

  if (isDone) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: C.paper }}>
        <p style={{ fontFamily: SANS, fontSize: 14, color: C.stone }}>次へ進んでいます…</p>
      </div>
    );
  }

  const val = answers[q.id] ?? null;
  const pct = (step / total) * 100;
  const prevLabel = step > 0 ? QUIZ[step - 1].label : null;

  const headerHeight = 54; // 2px progress + 52px Nav
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: C.paper, ...(step === 14 && { minWidth: 430 }) }}>
      {/* fixed header: progress + Nav (position fixed so 11/30 doesn't shift) */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: C.paper,
      }}>
        <div style={{ height: 2, background: C.fog }}>
          <div style={{ height: "100%", background: C.sienna, width: `${pct}%`, transition: "width .45s cubic-bezier(.4,0,.2,1)" }} />
        </div>
        <Nav />
      </div>

      <div key={step} style={{
        flex: 1, padding: `${headerHeight}px 28px 48px`, display: "flex", flexDirection: "column",
        animation: "kFadeUp .3s ease both", overflowY: "auto", scrollbarGutter: "stable",
      }}>
        {/* 設問エリア: 画面中央寄りに配置 */}
        <div style={{ minHeight: 220, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.ash, letterSpacing: ".08em", display: "block", marginBottom: 18 }}>
            {String(step + 1).padStart(2, "0")}&thinsp;/&thinsp;{String(total).padStart(2, "0")}
          </span>
          {/* Pole labels（L/Rはここだけ表示） */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
            <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 300, color: C.stone, lineHeight: 1.7, maxWidth: "44%", textAlign: "left" }}>
              {q.L}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 300, color: C.stone, lineHeight: 1.7, maxWidth: "44%", textAlign: "right" }}>
              {q.R}
            </p>
          </div>
        </div>

        {/* 7段階（中央が小さく、端ほど大きく）・幅固定で全設問で同一間隔 */}
        <div style={{ minHeight: 52, width: "100%", maxWidth: 360, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", marginBottom: 8, flexShrink: 0 }}>
          {[-3, -2, -1, 0, 1, 2, 3].map((v) => {
            const sel = val === v;
            const sz = v === 0 ? 34 : Math.abs(v) === 1 ? 40 : Math.abs(v) === 2 ? 46 : 52;
            return (
              <button key={v} onClick={() => select(v)} style={{
                width: sz, height: sz, borderRadius: "50%",
                background: sel ? C.ink : "transparent",
                border: `1.5px solid ${sel ? C.ink : C.rule}`,
                cursor: "pointer", flexShrink: 0,
                transition: "all .2s cubic-bezier(.4,0,.2,1)",
                transform: sel ? "scale(1.08)" : "scale(1)",
                boxShadow: sel ? `0 2px 12px ${C.ink}30` : "none",
                WebkitTapHighlightColor: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {sel && <span style={{ width: sz * .28, height: sz * .28, borderRadius: "50%", background: C.paper, display: "block" }} />}
              </button>
            );
          })}
        </div>

        {/* axis labels（左・右） */}
        <div style={{ display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
          <Label>強くそう思う</Label>
          <Label>強くそう思う</Label>
        </div>

        {/* ひとつ前に戻る：前の質問があるときは常に表示 */}
        {step > 0 && (
          <div style={{ marginTop: 20 }}>
            <GhostBtn onClick={() => setStep(s => s - 1)}>
              ← ひとつ前に戻る
            </GhostBtn>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Free description（ジャンルごとに1ページずつ）─────────────────────
const FreeScreen = memo(({ onNext }) => {
  const [freeStep, setFreeStep] = useState(0);
  const [data, setData] = useState(
    Object.fromEntries(FREE_QS.map(q => [q.id, [{ text: "", reason: "" }, { text: "", reason: "" }, { text: "", reason: "" }]]))
  );
  const totalFree = FREE_QS.length;
  const fq = FREE_QS[freeStep];

  const update = (id, i, field, val) =>
    setData(p => {
      const arr = [...p[id]];
      arr[i] = { ...arr[i], [field]: val };
      return { ...p, [id]: arr };
    });

  const goNext = () => {
    if (freeStep < totalFree - 1) setFreeStep(s => s + 1);
    else onNext(data);
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: C.paper, animation: "kFadeIn .3s ease both" }}>
      <Nav right={
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.ash, letterSpacing: ".08em" }}>
          {String(freeStep + 1).padStart(2, "0")}&thinsp;/&thinsp;{String(totalFree).padStart(2, "0")}
        </span>
      } />
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 28px 64px", minHeight: "calc(100dvh - 52px)", display: "flex", flexDirection: "column" }}>
        <Label style={{ display: "block", marginBottom: 16 }}>step 2 — あなたの世界</Label>

        {/* 全ステップで同じ高さ・幅の枠になるよう固定 */}
        <div style={{ marginBottom: 44, marginTop: 24, minHeight: 320, flex: "1 1 auto", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, minHeight: 48 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{fq.icon}</span>
            <p style={{ fontFamily: SERIF, fontSize: 17, color: C.ink, margin: 0 }}>{fq.label}</p>
          </div>
          {fq.hint && <Label style={{ display: "block", marginBottom: 16 }}>{fq.hint}</Label>}

          <div style={{ minHeight: 220 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ marginBottom: 20, paddingLeft: 20, borderLeft: `1px solid ${C.rule}`, minHeight: 56 }}>
                <Label style={{ display: "block", marginBottom: 8 }}>
                  {String(i + 1).padStart(2, "0")}
                </Label>
                <input
                  value={data[fq.id][i].text}
                  onChange={e => update(fq.id, i, "text", e.target.value)}
                  placeholder="入力"
                  style={{
                    width: "100%", minWidth: 0, padding: "10px 0", background: "transparent",
                    border: "none", borderBottom: `1px solid ${C.rule}`,
                    fontFamily: SERIF, fontSize: 15, color: C.ink, outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderBottomColor = C.sienna}
                  onBlur={e => e.target.style.borderBottomColor = C.rule}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
          {freeStep > 0 && (
            <GhostBtn onClick={() => setFreeStep(s => s - 1)}>← 戻る</GhostBtn>
          )}
          <PrimaryBtn onClick={goNext}>
            次へ
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
});

// ─── LLM prompt screen ────────────────────────────────────
const LLMScreen = memo(({ onNext }) => {
  const [copied, setCopied] = useState(false);
  const [response, setResponse] = useState("");
  const canGo = response.trim().length > 80;

  const copy = () => {
    navigator.clipboard?.writeText(LLM_PROMPT).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: C.paper, animation: "kFadeIn .3s ease both" }}>
      <Nav />
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 28px 64px" }}>
        <Label style={{ display: "block", marginBottom: 16 }}>step 3 — ai深層分析</Label>
        <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, color: C.ink, lineHeight: 1.5, marginBottom: 12 }}>
          AIにあなたを聞く
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 300, color: C.stone, lineHeight: 1.8, marginBottom: 24 }}>
          いつも使っているChatGPTまたはGeminiに、以下のプロンプトを投げてください。
        </p>

        {/* prompt preview */}
        <div style={{
          background: C.cream, border: `1px solid ${C.rule}`,
          padding: "20px", marginBottom: 16,
          maxHeight: 180, overflow: "hidden", position: "relative",
        }}>
          <pre style={{
            fontFamily: MONO, fontSize: 10, color: C.stone, lineHeight: 1.9,
            whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
          }}>
            {LLM_PROMPT.slice(0, 350)}…
          </pre>
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 56,
            background: `linear-gradient(transparent, ${C.cream})`,
          }} />
        </div>

        <button onClick={copy} style={{
          width: "100%", padding: "14px",
          background: copied ? C.ink : "transparent",
          color: copied ? C.paper : C.sienna,
          border: `1px solid ${copied ? C.ink : C.sienna}`,
          fontFamily: MONO, fontSize: 10, letterSpacing: ".12em",
          cursor: "pointer", transition: "all .2s", marginBottom: 36,
        }}>
          {copied ? "✓ コピーしました" : "プロンプトをコピー"}
        </button>

        <Divider style={{ marginBottom: 32 }} />

        <Label style={{ display: "block", marginBottom: 14 }}>AIの回答を貼り付け</Label>
        <textarea
          rows={10}
          value={response}
          onChange={e => setResponse(e.target.value)}
          placeholder="AIの回答をそのまま貼り付けてください…"
          style={{
            width: "100%", padding: "16px",
            background: C.cream, border: `1px solid ${C.rule}`,
            fontFamily: SANS, fontSize: 13, fontWeight: 300,
            color: C.ink, resize: "vertical", outline: "none",
            lineHeight: 1.8,
          }}
          onFocus={e => e.target.style.borderColor = C.sienna}
          onBlur={e => e.target.style.borderColor = C.rule}
        />

        <div style={{ marginTop: 28 }}>
          <PrimaryBtn onClick={() => onNext(response)} disabled={!canGo}>
            分析を開始する
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
});

// ─── Loading ──────────────────────────────────────────────
const LoadingScreen = memo(({ scores, freeData, llmResponse, onNext }) => {
  const phases = [
    "データを統合しています",
    "深層を読み解いています",
    "恋愛傾向を分析中",
    "言葉を選んでいます",
  ];
  const [pi, setPi] = useState(0);

  useEffect(() => {
    const ts = phases.slice(1).map((_, i) => setTimeout(() => setPi(i + 1), 2200 * (i + 1)));
    let fired = false;
    const finish = (sections) => { if (!fired) { fired = true; onNext(sections); } };
    const minMs = 7000;
    const t0 = Date.now();

    const callAPI = async () => {
      const prompt = buildPrompt(scores, freeData, llmResponse);
      const apiBase = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";
      try {
        const res = await fetch(`${apiBase}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("API error", res.status, data);
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
        const text = (data.text || "").trim();
        const sections = parseSections(text);
        if (!sections.s1) throw new Error("empty response");
        const wait = Math.max(0, minMs - (Date.now() - t0));
        setTimeout(() => finish(sections), wait);
      } catch (e) {
        console.error("Diagnosis API failed, using template:", e?.message);
        const wait = Math.max(0, minMs - (Date.now() - t0));
        setTimeout(() => finish(buildFallback(scores)), wait);
      }
    };

    callAPI();
    return () => { fired = true; ts.forEach(clearTimeout); };
  }, []);

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      background: C.paper, alignItems: "center", justifyContent: "center",
      padding: "0 48px", position: "relative", overflow: "hidden",
    }}>
      {/* ruled lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: .05 }} aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1="0" y1={i * 40 + 20} x2="100%" y2={i * 40 + 20} stroke={C.ink} strokeWidth=".5" />
        ))}
      </svg>

      {/* animated ink drop */}
      <div style={{ marginBottom: 48, position: "relative" }}>
        <div style={{
          width: 2, height: 80, background: C.rule, margin: "0 auto",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%",
            height: "40%", background: C.sienna,
            animation: "kPulse 1.4s ease-in-out infinite",
          }} />
        </div>
      </div>

      <p style={{
        fontFamily: SERIF, fontSize: 22, fontWeight: 400, fontStyle: "italic",
        color: C.ink, marginBottom: 8, lineHeight: 1.6, textAlign: "center",
      }}>
        データ解析中
      </p>
      <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", color: C.ash, minHeight: 18, marginBottom: 8 }}>
        ※60秒ほどかかる場合があります
      </p>
      <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", color: C.ash, minHeight: 18 }}>
        {phases[pi]}
      </p>
    </div>
  );
});

// ─── Result ───────────────────────────────────────────────
const ResultScreen = memo(({ sections: rawSections, scores, onViewMatches }) => {
  const sections = rawSections || buildFallback(scores);
  const { date, serial } = serialNo();
  const bodyRef = useRef();

  // paragraph renderer with line breaks（左詰め）
  const Para = ({ text, style = {} }) => (
    <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 300, color: C.stone, lineHeight: 2.1, textAlign: "left", ...style }}>
      {(text || "").split("\n").map((line, i, arr) => (
        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
      ))}
    </p>
  );

  const SectionBlock = ({ label, number, text, accent = C.sienna }) => (
    <div style={{ padding: "40px 0", borderBottom: `1px solid ${C.rule}` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 28 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, color: C.ash }}>
          {String(number).padStart(2, "0")}
        </span>
        <Label style={{ color: accent }}>{label}</Label>
      </div>
      <Para text={text} />
    </div>
  );

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      background: C.paper, animation: "kFadeIn .5s ease both",
    }}>
      <Nav />

      <div ref={bodyRef} style={{ flex: 1, overflowY: "auto" }}>

        {/* Header — letter style */}
        <div style={{
          padding: "48px 28px 40px",
          borderBottom: `1px solid ${C.rule}`,
          position: "relative", overflow: "hidden",
        }}>
          {/* faint ruled paper background */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: .04 }} aria-hidden>
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={i} x1="0" y1={i * 40 + 24} x2="100%" y2={i * 40 + 24} stroke={C.ink} strokeWidth=".5" />
            ))}
          </svg>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, position: "relative" }}>
            <Label>{date}</Label>
            <Label>{serial}</Label>
          </div>

          <h1 style={{
            fontFamily: SERIF, fontSize: 34, fontWeight: 400,
            color: C.ink, lineHeight: 1.3, marginBottom: 8, position: "relative",
          }}>
            診断結果
          </h1>
          <div style={{ width: 40, height: 1, background: C.sienna, marginTop: 20 }} />
        </div>

        {/* Sections */}
        <div style={{ padding: "0 28px 56px" }}>
          <SectionBlock number={1} label="総合性格分析" text={sections.s1} />
          <SectionBlock number={2} label="恋愛傾向" text={sections.s2} accent={C.siennaLt} />
          <SectionBlock number={3} label="相性のいい人物像" text={sections.s3} />
        </div>

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${C.rule}`, padding: "24px 28px 48px",
          display: "flex", flexDirection: "column", gap: 20,
        }}>
          <GhostBtn onClick={onViewMatches}>相性のいい人を確認する</GhostBtn>
        </div>
      </div>
    </div>
  );
});

// ─── Match list ────────────────────────────────────────────
const DEFAULT_MATCHES = [
  {
    id: "m1",
    name: "Aさん",
    score: 7,
    note:
      "8月8日 LEO（しし座）【基本データ】太陽： しし座　支配星： いて座／木星　位置： 15°-16° しし座　状態： 不動宮　元素： 火　星の名前： ドゥベ、アクベンス\n" +
      "気まぐれな性格も人生の原動力。彼は、あふれんばかりのパワーを持つ半面、情緒不安定なところがあります。この相反する2つのことは、彼の人生には多くのことが待ち構えていることを示しています。創造性があり、野心に燃え、成功志向で、名声を得たいと思っています。支配星（いて座の木星）の隠れた影響で、楽観主義者で熱血漢。たゆみない努力は、彼の環境やライフスタイルに大きな変化をもたらします。彼は勤勉で、直感的に物事をとらえることができ、頭の回転が速い現実主義者です。8日生まれの人は生産的ですが、行きすぎた熱意や、過剰な苛立ちには注意が必要です。\n" +
      "彼にとって、変化は人生のスパイス。退屈な生活は似合いません。新たな出会い、知らない土地への旅行は、彼の原動力であり、気まぐれな性格も人生の冒険において役に立つでしょう。人生の後半になると落ち着きたい、定着したいという気持ちがわき起こります。責任のとり方を学び、長期的な投資をすることで、安心できるはずです。不安定な状況と飽きっぽい性格を克服し、理想主義と物質主義との葛藤に終止符を打ちましょう。ストレスを受けるとすぐにあきらめる癖は、事前に念入りな計画を練ることで克服できます。\n" +
      "14歳の時に、太陽がおとめ座に移動し、30年間にわたり秩序、現実的問題の解決、時間とエネルギーの使い方に重点が置かれます。44歳の時に新たな転換期を迎え、太陽がてんびん座に移動します。これによってバランスと調和を求める気持ちが強まり、人との協力関係に対する意識が高まります。\n" +
      "【隠された自己】迅速に、しかも確実に前進していく時と、無気力な時とが交互に訪れます。これは、欲求不満が起こり、自尊心を失うことが原因です。前進できず、堂々巡りのくり返しを克服するためには、客観的になり、いつまでもくよくよしないこと。このような停滞期は一時的なものだと気づくことにより、長期的に物事を考え、深刻にならずにすみます。豊かな創造力により、独創性が発揮されます。このように創造力を育むことで、人生を楽しみ、不安や優柔不断を防止することができるようになります。\n" +
      "【仕事と適性】“変化”が彼にとっての絶対条件。そういう意味では演劇やエンターテインメントが適職ですが、金銭的報酬が十分に得られなければ続かないでしょう。人に従うのを嫌うので、自営業や管理職に向いています。想像力と優れた鑑賞眼を持つ彼は、イメージ作りを伴う仕事で成功します。旅を伴う仕事は、冒険好きの彼には格好の仕事です。\n" +
      "【恋愛と人間関係】強い個性に惹かれる彼は、自信にあふれた指導力のある人に惹かれます。楽しいだけでなく、刺激を与えてくれる人とのつき合いを求めるため、友情は重要です。愛する人の前では、天性のタレントの才能が発揮されます。人間関係では調和を求めますが、感情が不安定になってしまうと、喧嘩腰。忍耐を学ぶことで困難な状況を乗り越えることができます。\n" +
      "【数秘術による彼の運勢】8という数字が示すのは、優れた価値観と判断力を持つ人柄です。8という数字は、成功を求める野心があることを示しています。支配欲、安定欲、物欲が8日生まれの特徴です。天性のビジネスセンスがあり、組織、管理能力に恵まれています。安定し、落ち着きたいという欲求が、長期的な計画や投資を促します。8月の隠れた影響により、この傾向が強まります。鋭敏な感受性を持つ彼は、人の評価や状況判断が得意。効率よく仕事を進め、責任を負って、一生懸命働きます。しかし、いずれ公正公平な方法で、権力を行使したり委譲する術を学ばなければならないでしょう。盛者必衰、自信過剰は禁物です。",
  },
  {
    id: "m2",
    name: "Bさん",
    score: 5,
    note:
      "7月27日 LEO（しし座）【基本データ】太陽： しし座　支配星： しし座／太陽　位置： 3°45'-5° しし座　状態： 不動宮　元素： 火　星の名前： なし\n" +
      "知識欲と探究心が強く、独創的なアイディアの持ち主。彼は愛想がよく、思いやりと第六感を備えており、強い個性を持つ、感受性の鋭いしし座です。知識欲と探究心が強く、独創的で、想像力と好奇心にあふれています。意志が強く進歩的な思考を持つ彼は、精神的刺激を追求し、常に新しいアイディアにあふれています。理解力に富み、最新の情報に遅れないために、書籍や雑誌の情報、日進月歩のコンピューターの技術を収集しています。支配星のしし座の隠れた影響により、魅力にあふれ、外見がよく、生き生きとしています。誰からも好かれ、人と親密に交流できるでしょう。本来、両極端な性格を持つ彼ですが、寛大さと過敏な面、不安定な面と頑固な面とのバランスをとりましょう。社交的で気前がよく、強引な彼は、一般大衆を相手にするのを好み、外交や広報が得意です。刺激を受ければ、どんなことでも熱心に始めますが、しばしば準備不足。飽きやすく、関心の対象が多すぎるために、集中することができません。また、アイディアにあふれていますが、それを形にするのは少々苦手。優れた発想を実行するために試行錯誤していくとよいでしょう。\n" +
      "26歳以降は、太陽がおとめ座に移動し、分析、現実、思索に関心を寄せます。責任が増すにつれて、仕事の完璧さや効率のよさを求めるようになります。56歳からは太陽がてんびん座に移動し、人生の重点が変わり、陽気で、適応力が高く、駆け引き上手になります。\n" +
      "【隠された自己】強い野心を持っているものの、その野心を人と共有することに最大の喜びを感じます。独立心が強い時と、依存心が強い時があり、親密で深い関係を築くためには、極端な感情のゆれのバランスをとる必要があります。すべての人間関係は、対等なギブアンドテイクのうえに成り立っているということに特に注意しましょう。彼は心温かく、愛情深く、理想主義者です。芸術、音楽、精神性を通じて、すばらしいインスピレーションを得るでしょう。しかし、優れたひらめきに他の人はついていけず、これが彼の悩みの種にもなります。思った通りに人が動いてくれることを期待せずに、あるがままを受け入れることで、失望せずにすむでしょう。\n" +
      "【仕事と適性】頭の回転の速さと、優れた記憶力、リーダーシップを備えた彼は、どんな仕事もうまくこなせます。人を相手にする仕事に関心を持てば、販売、広告関係、広報などで成功します。また、作家、教師も適職。ビジネスでは、自分が中心となりたがるので、自営業または管理職が向いています。専門知識を持てば、弁護士やカウンセラーでも活躍できます。また、色、美、造形、音楽鑑賞を伴う仕事も適職。真実と公正を強く望み、博愛主義性格から、法律、政治、社会改革の道に進むとよいでしょう。このような才能を想像力や感受性と合わせて作家などの執筆業や、福祉の仕事にも向いています。もともと博愛主義で面倒見がよいため、地域に密着した公務員なども適職です。\n" +
      "【恋愛と人間関係】温かく魅力ある彼の周りには人が集まります。人間好きなので、常に人に合わせる努力をします。少々さみしがり屋の面も。しかし、パートナーや友人を操縦しようとしたり、依存しすぎることのないよう気をつけましょう。彼にとって家族は特に大切な存在で、彼は将来的によき父、よき母になるでしょう。\n" +
      "【数秘術による彼の運勢】29の数字に影響を受ける人は強烈な個性と無限の潜在能力があります。直感が鋭く、感受性が強くて感情的。インスピレーションが彼の成功の鍵となり、それなくしては目的を失ってしまいます。まさしく夢追い人ですが、性格は二面性を持ちあわせるので、気分がころころ変わらないように注意して。心に秘めた感情に従い他人に心を開けば、心配性な面が抑えられ、理性を働かすことができます。独創的な思考を活かせば、人々の心を動かすようなことを成し遂げられます。生まれ月の11という数字の影響から、博愛主義で理想主義で、精神的な充足感や満足感を求めます。新しいアイディアに敏感で、好奇心旺盛な冒険好きです。楽観的ですが、新たな事業に着手する時には確固たる信念を持って、常識を働かせ現実的な面を残しておかなければなりません。",
  },
  {
    id: "m3",
    name: "Cさん",
    score: 4,
    note:
      "11月29日 SAGITTARIUS（いて座）【基本データ】太陽： いて座　支配星： いて座／木星　位置： 6°30'-7°30' いて座　状態： 柔軟宮　元素： 火　星の名前： なし\n" +
      "強い信念を持つ、誠実で正直者。彼女は活力と気力にあふれ、理解力があり臨機応変な、精神的な安定を望む思いやりのある人物です。直感力が鋭いので、人の話の真意を理解できますが、相手と一定の距離を保つべき。本来理想主義ですが、野心と優れた実務感覚を持っているので、地に足をつけて慎重に行動するとよいでしょう。支配星の木星の影響は、何よりも誠実さを大切にするまじめで理想主義な面に表れます。情熱的で楽観的、視野が広く探究心があるため、真実や悟りを求めてはるか遠くに旅することもあるでしょう。しかし世の中を普通に生きていくには、柔軟性がなさすぎる点が足かせとなります。強い信念や意見を持ち誠実で率直な性格であるため、思っていることをずばりと口にします。誠実で正直ですので、約束はきちんと守る人です。精力的に働き一生懸命になれるので、周りから信頼を受けます。気前がよすぎる点に注意。十分な見返りと慈善的なふるまいのバランスをとるように心がけましょう。\n" +
      "22歳までは楽観的で、起業、勉学あるいは旅行を通して可能性を広げたいと考えます。進行する太陽がやぎ座に入る23歳になると、目的を持って現実的な方策で目標達成を進めます。このことは人生に秩序や規律を望む気持ちが強くなってくることに関係します。53歳でも転機を迎えますが、この時期に進行する太陽がみずがめ座に入ります。自由や新しい考え、それから個性の表現に関心が高まっていきます。\n" +
      "【隠された自己】現実的で決断力がありながら、創造力豊かで機知に富み、人を楽しませることができる人です。感性が豊かで、美的センスにあふれています。ふだんは気さくで親切ですが、時に独善的になったり横柄な態度をとることがあり、人から反感をいだかれるおそれも。しかし、チャンスをかぎ分ける特別な能力と抜け目のない実務主義な面を持ちあわせているため、お金に困ることはありません。常により高くより大きい目標を追求し成果主義で動くため、仕事に適しています。頭の回転が速く、切れる彼女は、目標達成を心から望めば十分なやる気を出します。壮大な計画を好みますが、細かなことを見落さないようにしましょう。\n" +
      "【仕事と適性】真実と公正を強く望み、博愛主義的性格から、法律、政治、社会改革の道に進むとよいでしょう。このような才能を想像力や感受性と合わせて作家などの執筆業や、福祉の仕事にも向いています。もともと博愛主義で面倒見がよいため、地域に密着した公務員なども適職です。\n" +
      "【恋愛と人間関係】温かく魅力ある彼女の周りには人が集まります。人間好きなので、常に人に合わせる努力をします。少々さみしがり屋の面も。しかし、パートナーや友人を操縦しようとしたり、依存しすぎることのないよう気をつけましょう。彼女にとって家族は特に大切な存在で、彼女は将来的に良き父母になるでしょう。\n" +
      "【数秘術による彼女の運勢】29の数字に影響を受ける人は強烈な個性と無限の潜在能力があります。直感が鋭く、感受性が強くて感情的。インスピレーションが彼女の成功の鍵となり、それなくしては目的を失ってしまいます。まさしく夢追い人ですが、性格は二面性を持ちあわせるので、気分がころころ変わらないように注意して。心に秘めた感情に従い他人に心を開けば、心配性な面が抑えられ、理性を働かすことができます。独創的な思考を活かせば、人々の心を動かすようなことを成し遂げられます。生まれ月の11という数字の影響から、博愛主義で理想主義で、精神的な充足感や満足感を求めます。新しいアイディアに敏感で、好奇心旺盛な冒険好きです。楽観的ですが、新たな事業に着手する時には確固たる信念を持って、常識を働かせ現実的な面を残しておかなければなりません。\n" +
      "【性格の要約】長所： ひらめきがある、直感的である、感覚がよい、心が平穏である、寛大である、独創的である、思いやりがある、壮大な夢を持つ、世界に長ける、信念がある　短所： 集中力に欠ける、不安定である、神経質である、利己的である、うぬぼれが強い、独断的である、気難しい、極端に走りやすい、気がきかない、孤立しすぎる",
  },
];

const MatchAvatar = ({ name }) => {
  const initial = (name || "").charAt(0) || "?";
  return (
    <div style={{
      width: 80,
      height: 80,
      borderRadius: "50%",
      background: C.cream,
      border: `1px solid ${C.rule}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: SERIF,
      fontSize: 32,
      color: C.ink,
      flexShrink: 0,
    }}>
      {initial}
    </div>
  );
};

const MatchStars = ({ score }) => {
  const s = Math.max(1, Math.min(7, score ?? 1));
  const stars = "★".repeat(s) + "☆".repeat(7 - s);
  return (
    <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", color: C.sienna }}>
      {stars}
    </span>
  );
};

const MatchesScreen = memo(({ matches, onBackToResult, onOpenDetail }) => (
  <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: C.paper, animation: "kFadeIn .4s ease both" }}>
    <Nav
      onBack={onBackToResult}
      backLabel="結果に戻る"
      right={
        <button
          onClick={onBackToResult}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: ".12em",
            color: C.mist,
            padding: 0,
          }}
        >
          診断結果
        </button>
      }
    />
    <div style={{ flex: 1, padding: "32px 28px 48px", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, color: C.ink, lineHeight: 1.8 }}>
          相性一覧
        </h2>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {matches.map(m => (
          <button
            key={m.id}
            onClick={() => onOpenDetail(m)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "14px 16px",
              borderRadius: 10,
              border: `1px solid ${C.rule}`,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <MatchAvatar name={m.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: C.ink }}>{m.name}</span>
                <MatchStars score={m.score} />
              </div>
              <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 300, color: C.stone, lineHeight: 1.7, marginTop: 6 }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
));

const MatchDetailScreen = memo(({ match, onBack }) => {
  if (!match) return null;
  const renderNote = (text) => {
    const full = (text || "").trim();
    const taglineStarts = [
      "気まぐれな性格も人生の原動力。",
      "知識欲と探究心が強く、独創的なアイディアの持ち主。",
      "強い信念を持つ、誠実で正直者。",
    ];
    const out = [];
    let i = 0;

    const pushHeading = (content, size = 16) => {
      out.push(
        <p key={i++} style={{ fontFamily: SERIF, fontSize: size, fontWeight: 500, color: C.ink, margin: "18px 0 6px", textAlign: "left" }}>
          {content}
        </p>
      );
    };
    const pushBody = (content) => {
      if (!content.trim()) return;
      out.push(
        <p key={i++} style={{ fontFamily: SANS, fontSize: 15, fontWeight: 300, color: C.stone, lineHeight: 2.0, margin: "0 0 10px", textAlign: "left" }}>
          {content}
        </p>
      );
    };

    const lines = full.split("\n");
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) {
        out.push(<div key={i++} style={{ height: 12 }} />);
        continue;
      }
      if (line.includes("【基本データ】")) {
        const [before, after] = line.split("【基本データ】");
        const title = before.trim();
        const dataBlock = (after || "").trim();
        if (title) pushHeading(title, 18);
        pushHeading("【基本データ】", 16);
        if (dataBlock) {
          dataBlock.split(/\s*　\s*/).filter(Boolean).forEach(part => pushBody(part));
        }
        continue;
      }
      if (line.startsWith("【")) {
        const close = line.indexOf("】");
        if (close !== -1) {
          pushHeading(line.slice(0, close + 1), 16);
          const rest = line.slice(close + 1).trim();
          if (rest) pushBody(rest);
        } else {
          pushHeading(line, 16);
        }
        continue;
      }
      const tag = taglineStarts.find(t => line.startsWith(t));
      if (tag) {
        pushHeading(tag, 17);
        const rest = line.slice(tag.length).trim();
        if (rest) pushBody(rest);
        continue;
      }
      pushBody(line);
    }
    return out;
  };
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: C.paper, animation: "kFadeIn .4s ease both" }}>
      <Nav
        onBack={onBack}
        backLabel="一覧に戻る"
        right={
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: ".12em",
              color: C.mist,
              padding: 0,
            }}
          >
            診断結果
          </button>
        }
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ padding: "24px 28px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <MatchAvatar name={match.name} />
              <span style={{ fontFamily: SERIF, fontSize: 20, color: C.ink }}>{match.name}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <Label>あなたとの相性</Label>
              <div style={{ marginTop: 6 }}>
                <MatchStars score={match.score} />
              </div>
            </div>
          </div>
          <Divider style={{ marginTop: 24 }} />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 28px 48px", paddingTop: 8 }}>
          {renderNote(match.note)}
        </div>
      </div>
    </div>
  );
});

// ─── Reducer & Root ───────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "START":      return { screen: "intro" };
    case "INTRO_DONE": return { ...state, screen: "language", profile: action.profile };
    case "LANG_DONE":  return { ...state, screen: "quiz", lang: action.lang };
    case "QUIZ_DONE":  return { ...state, screen: "loading", scores: action.scores };
    // 以降の FREE_DONE / LLM_DONE は現在は使用しないが、将来の拡張用に残しておく
    case "FREE_DONE":  return { ...state, screen: "llm",  freeData: action.data };
    case "LLM_DONE":   return { ...state, screen: "loading", llmResponse: action.response };
    case "DONE":      return { ...state, screen: "result", sections: action.sections };
    case "OPEN_MATCHES":
      return { ...state, screen: "matches", matches: DEFAULT_MATCHES };
    case "OPEN_MATCH_DETAIL":
      return { ...state, screen: "matchDetail", selectedMatch: action.match };
    case "BACK_TO_RESULT":
      return { ...state, screen: "result" };
    case "BACK_TO_MATCHES":
      return { ...state, screen: "matches" };
    case "BACK_TO_INTRO":
      return { ...state, screen: "intro" };
    case "RESTART":   return { screen: "landing" };
    default: return state;
  }
}

export default function App() {
  const [st, dispatch] = useReducer(reducer, { screen: "landing" });

  return (
    <>
      <Fonts />
      <style>{KF}</style>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{background:${C.paper} !important;color:${C.ink}}
        html{color-scheme:light}
        html{-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:transparent}
        body{overscroll-behavior:none;-webkit-font-smoothing:antialiased}
        button,input,textarea{font-family:inherit}
        input::placeholder,textarea::placeholder{color:${C.ash}}
        ::-webkit-scrollbar{display:none}
      `}</style>
      <div style={{ width: "100%", minHeight: "100dvh", background: C.paper }}>
        <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100dvh", background: C.paper }}>
        {st.screen === "landing" && (
          <LandingScreen onNext={() => dispatch({ type: "START" })} />
        )}
        {st.screen === "intro" && (
          <IntroScreen
            onBack={() => dispatch({ type: "RESTART" })}
            onNext={profile => dispatch({ type: "INTRO_DONE", profile })}
          />
        )}
        {st.screen === "language" && (
          <LanguageScreen
            onBack={() => dispatch({ type: "BACK_TO_INTRO" })}
            onNext={lang => dispatch({ type: "LANG_DONE", lang })}
          />
        )}
        {st.screen === "quiz" && (
          <QuizScreen onNext={scores => dispatch({ type: "QUIZ_DONE", scores })} />
        )}
        {st.screen === "loading" && (
          <LoadingScreen
            scores={st.scores}
            freeData={st.freeData}
            llmResponse={st.llmResponse}
            onNext={sections => dispatch({ type: "DONE", sections })}
          />
        )}
        {st.screen === "result" && (
          <ResultScreen
            sections={st.sections}
            scores={st.scores}
            onViewMatches={() => dispatch({ type: "OPEN_MATCHES" })}
          />
        )}
        {st.screen === "matches" && (
          <MatchesScreen
            matches={st.matches || DEFAULT_MATCHES}
            onBackToResult={() => dispatch({ type: "BACK_TO_RESULT" })}
            onOpenDetail={match => dispatch({ type: "OPEN_MATCH_DETAIL", match })}
          />
        )}
        {st.screen === "matchDetail" && (
          <MatchDetailScreen
            match={st.selectedMatch}
            onBack={() => dispatch({ type: "BACK_TO_MATCHES" })}
          />
        )}
        </div>
      </div>
    </>
  );
}
