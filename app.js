(() => {
  'use strict';

  // ====== 상수 ======
  const DAN_MIN = 11, DAN_MAX = 99, MUL_MAX = 20;
  const PCT_BASIC_COUNT = 20;
  const TOL = 0.1;

  const MUL_APPLIED_CATS = ['mul_pack','mul_price','mul_speed','mul_drive','mul_lap'];
  const MUL_APPLIED_GOAL = 20;
  const DIV_APPLIED_CATS = ['div_share','div_unit','div_pour'];
  const PCT_APPLIED_CATS = ['pct_sale','pct_pop','pct_tip'];

  // 퍼센트 — 100그룹 (레벨10×그룹10), 각 그룹 기초 20 + 응용 20
  // 레벨1~2: 10·25·50·100% / 레벨3~4: 5·20·30·60·75·80% / 레벨5~6: 40·70·90%
  // 레벨7~8: 비정형 11~19% / 레벨9~10: 비정형 21~29% /
  // 레벨11~12: 1~5% 소량 / 레벨13~14: 60~95% 고비율 /
  // 레벨15~16: 혼합 / 레벨17~18: 큰 금액 + 소수점% / 레벨19~20: 극한
  // (홀수 그룹: "A의 N%는?", 짝수 그룹: "X는 A의 몇%?")
  const PCT_LEVELS = Array.from({ length: 100 }, (_, i) => i + 1);
  const PCT_APPLIED_GOAL = 20;
  const PCT_LEVEL_CFG = {
    // ── 레벨 1 (G1~10): 10·25·50·100% — 가장 친숙한 % ──
    1:  { type:'of',    vals:[100,200,300,400,500,800,1000,2000],       pcts:[10,50,100] },
    2:  { type:'of',    vals:[100,200,300,400,500,800,1000,2000],       pcts:[10,25,50,100] },
    3:  { type:'of',    vals:[100,200,300,400,500,600,800,1000,2000],   pcts:[10,25,50,100] },
    4:  { type:'of',    vals:[100,200,300,400,500,600,800,1000,2000],   pcts:[10,20,25,50,100] },
    5:  { type:'of',    vals:[100,200,300,400,500,800,1000,2000,5000],  pcts:[10,20,25,50] },
    6:  { type:'of',    vals:[100,200,300,400,500,800,1000,2000,5000],  pcts:[10,25,50,75,100] },
    7:  { type:'of',    vals:[100,200,400,500,800,1000,2000,5000],      pcts:[10,20,25,50,75] },
    8:  { type:'of',    vals:[100,200,400,500,800,1000,2000,5000],      pcts:[10,20,25,50,75,100] },
    9:  { type:'of',    vals:[100,200,300,400,500,800,1000,2000,5000],  pcts:[5,10,20,25,50,75] },
    10: { type:'of',    vals:[100,200,300,400,500,800,1000,2000,5000],  pcts:[5,10,20,25,50,75,100] },
    // ── 레벨 2 (G11~20): 레벨1과 같은 난이도, 역방향(몇%?) ──
    11: { type:'ratio', vals:[100,200,300,400,500,800,1000,2000],       pcts:[10,50,100] },
    12: { type:'ratio', vals:[100,200,300,400,500,800,1000,2000],       pcts:[10,25,50,100] },
    13: { type:'ratio', vals:[100,200,300,400,500,600,800,1000,2000],   pcts:[10,25,50,100] },
    14: { type:'ratio', vals:[100,200,300,400,500,600,800,1000,2000],   pcts:[10,20,25,50,100] },
    15: { type:'ratio', vals:[100,200,300,400,500,800,1000,2000,5000],  pcts:[10,20,25,50] },
    16: { type:'ratio', vals:[100,200,300,400,500,800,1000,2000,5000],  pcts:[10,25,50,75,100] },
    17: { type:'ratio', vals:[100,200,400,500,800,1000,2000,5000],      pcts:[10,20,25,50,75] },
    18: { type:'ratio', vals:[100,200,400,500,800,1000,2000,5000],      pcts:[10,20,25,50,75,100] },
    19: { type:'ratio', vals:[100,200,300,400,500,800,1000,2000,5000],  pcts:[5,10,20,25,50,75] },
    20: { type:'ratio', vals:[100,200,300,400,500,800,1000,2000,5000],  pcts:[5,10,20,25,50,75,100] },
    // ── 레벨 3 (G21~30): 5·20·30·40·60% 추가 ──
    21: { type:'of',    vals:[100,200,400,500,800,1000,2000],           pcts:[5,10,20,30,40] },
    22: { type:'of',    vals:[100,200,400,500,800,1000,2000],           pcts:[10,20,30,40,50,60] },
    23: { type:'of',    vals:[100,200,400,500,800,1000,2000],           pcts:[5,10,20,25,30,50] },
    24: { type:'of',    vals:[100,200,400,500,800,1000,2000],           pcts:[5,20,30,40,50,60] },
    25: { type:'of',    vals:[200,400,500,800,1000,2000,4000],          pcts:[5,10,20,30,40,50] },
    26: { type:'of',    vals:[200,400,500,800,1000,2000,4000],          pcts:[5,10,20,25,40,50,60] },
    27: { type:'of',    vals:[200,400,500,800,1000,2000,4000],          pcts:[10,20,30,40,50,60,75] },
    28: { type:'of',    vals:[200,400,500,800,1000,2000,4000],          pcts:[5,10,20,25,30,40,50,60] },
    29: { type:'of',    vals:[100,200,400,500,800,1000,2000,4000],      pcts:[5,10,15,20,25,30,40,50] },
    30: { type:'of',    vals:[100,200,400,500,800,1000,2000,4000],      pcts:[5,10,15,20,25,30,40,50,60,75] },
    // ── 레벨 4 (G31~40): 레벨3 역방향 ──
    31: { type:'ratio', vals:[100,200,400,500,800,1000,2000],           pcts:[5,10,20,30,40] },
    32: { type:'ratio', vals:[100,200,400,500,800,1000,2000],           pcts:[10,20,30,40,50,60] },
    33: { type:'ratio', vals:[100,200,400,500,800,1000,2000],           pcts:[5,10,20,25,30,50] },
    34: { type:'ratio', vals:[100,200,400,500,800,1000,2000],           pcts:[5,20,30,40,50,60] },
    35: { type:'ratio', vals:[200,400,500,800,1000,2000,4000],          pcts:[5,10,20,30,40,50] },
    36: { type:'ratio', vals:[200,400,500,800,1000,2000,4000],          pcts:[5,10,20,25,40,50,60] },
    37: { type:'ratio', vals:[200,400,500,800,1000,2000,4000],          pcts:[10,20,30,40,50,60,75] },
    38: { type:'ratio', vals:[200,400,500,800,1000,2000,4000],          pcts:[5,10,20,25,30,40,50,60] },
    39: { type:'ratio', vals:[100,200,400,500,800,1000,2000,4000],      pcts:[5,10,15,20,25,30,40,50] },
    40: { type:'ratio', vals:[100,200,400,500,800,1000,2000,4000],      pcts:[5,10,15,20,25,30,40,50,60,75] },
    // ── 레벨 5 (G41~50): 15·35·40·60·70·80·90% ──
    41: { type:'of',    vals:[200,400,500,800,1000,2000],               pcts:[15,35,45,55,65] },
    42: { type:'of',    vals:[200,400,500,800,1000,2000],               pcts:[30,40,60,70,80] },
    43: { type:'of',    vals:[200,400,500,800,1000,2000,4000],          pcts:[15,30,45,60,75,90] },
    44: { type:'of',    vals:[200,400,500,800,1000,2000,4000],          pcts:[35,40,55,65,70,80] },
    45: { type:'of',    vals:[200,400,500,800,1000,2000,4000],          pcts:[15,25,35,45,55,65] },
    46: { type:'of',    vals:[200,400,600,800,1000,2000,4000],          pcts:[30,40,50,60,70,80,90] },
    47: { type:'of',    vals:[200,400,600,800,1000,2000,4000],          pcts:[15,25,35,45,55,65,75] },
    48: { type:'of',    vals:[200,400,600,800,1000,2000,4000],          pcts:[20,30,40,60,70,80,90] },
    49: { type:'of',    vals:[200,400,600,800,1000,2000,4000,5000],     pcts:[15,30,45,50,60,70,80] },
    50: { type:'of',    vals:[200,400,600,800,1000,2000,4000,5000],     pcts:[15,25,35,40,50,60,70,80,90] },
    // ── 레벨 6 (G51~60): 레벨5 역방향 ──
    51: { type:'ratio', vals:[200,400,500,800,1000,2000],               pcts:[15,35,45,55,65] },
    52: { type:'ratio', vals:[200,400,500,800,1000,2000],               pcts:[30,40,60,70,80] },
    53: { type:'ratio', vals:[200,400,500,800,1000,2000,4000],          pcts:[15,30,45,60,75,90] },
    54: { type:'ratio', vals:[200,400,500,800,1000,2000,4000],          pcts:[35,40,55,65,70,80] },
    55: { type:'ratio', vals:[200,400,500,800,1000,2000,4000],          pcts:[15,25,35,45,55,65] },
    56: { type:'ratio', vals:[200,400,600,800,1000,2000,4000],          pcts:[30,40,50,60,70,80,90] },
    57: { type:'ratio', vals:[200,400,600,800,1000,2000,4000],          pcts:[15,25,35,45,55,65,75] },
    58: { type:'ratio', vals:[200,400,600,800,1000,2000,4000],          pcts:[20,30,40,60,70,80,90] },
    59: { type:'ratio', vals:[200,400,600,800,1000,2000,4000,5000],     pcts:[15,30,45,50,60,70,80] },
    60: { type:'ratio', vals:[200,400,600,800,1000,2000,4000,5000],     pcts:[15,25,35,40,50,60,70,80,90] },
    // ── 레벨 7 (G61~70): 비정형 % 11~19 등장 ──
    61: { type:'of',    vals:[100,200,400,500,800,1000],                pcts:[11,12,13,14,15] },
    62: { type:'of',    vals:[100,200,400,500,800,1000],                pcts:[16,17,18,19] },
    63: { type:'of',    vals:[100,200,400,500,800,1000],                pcts:[11,13,15,17,19] },
    64: { type:'of',    vals:[200,400,500,800,1000,2000],               pcts:[11,12,13,14,15,16] },
    65: { type:'of',    vals:[200,400,500,800,1000,2000],               pcts:[14,15,16,17,18,19] },
    66: { type:'of',    vals:[200,400,500,800,1000,2000],               pcts:[11,12,13,15,17,19] },
    67: { type:'of',    vals:[200,400,600,1000,2000,4000],              pcts:[11,13,15,17,19] },
    68: { type:'of',    vals:[200,400,600,1000,2000,4000],              pcts:[11,12,13,14,15,16,17] },
    69: { type:'of',    vals:[100,200,400,600,1000,2000,4000],          pcts:[11,13,15,17,18,19] },
    70: { type:'of',    vals:[100,200,400,600,1000,2000,4000],          pcts:[11,12,13,14,15,16,17,18,19] },
    // ── 레벨 8 (G71~80): 레벨7 역방향 ──
    71: { type:'ratio', vals:[100,200,400,500,800,1000],                pcts:[11,12,13,14,15] },
    72: { type:'ratio', vals:[100,200,400,500,800,1000],                pcts:[16,17,18,19] },
    73: { type:'ratio', vals:[100,200,400,500,800,1000],                pcts:[11,13,15,17,19] },
    74: { type:'ratio', vals:[200,400,500,800,1000,2000],               pcts:[11,12,13,14,15,16] },
    75: { type:'ratio', vals:[200,400,500,800,1000,2000],               pcts:[14,15,16,17,18,19] },
    76: { type:'ratio', vals:[200,400,500,800,1000,2000],               pcts:[11,12,13,15,17,19] },
    77: { type:'ratio', vals:[200,400,600,1000,2000,4000],              pcts:[11,13,15,17,19] },
    78: { type:'ratio', vals:[200,400,600,1000,2000,4000],              pcts:[11,12,13,14,15,16,17] },
    79: { type:'ratio', vals:[100,200,400,600,1000,2000,4000],          pcts:[11,13,15,17,18,19] },
    80: { type:'ratio', vals:[100,200,400,600,1000,2000,4000],          pcts:[11,12,13,14,15,16,17,18,19] },
    // ── 레벨 9 (G81~90): 비정형 % 21~29 ──
    81: { type:'of',    vals:[100,200,400,500,800,1000],                pcts:[21,22,23,24,25] },
    82: { type:'of',    vals:[100,200,400,500,800,1000],                pcts:[26,27,28,29] },
    83: { type:'of',    vals:[100,200,400,500,800,1000],                pcts:[21,23,25,27,29] },
    84: { type:'of',    vals:[200,400,500,800,1000,2000],               pcts:[21,22,23,24,25,26] },
    85: { type:'of',    vals:[200,400,500,800,1000,2000],               pcts:[24,25,26,27,28,29] },
    86: { type:'of',    vals:[200,400,600,1000,2000,4000],              pcts:[21,23,25,27,29] },
    87: { type:'of',    vals:[200,400,600,1000,2000,4000],              pcts:[21,22,23,24,25,26,27] },
    88: { type:'of',    vals:[200,400,600,1000,2000,4000],              pcts:[21,23,25,27,28,29] },
    89: { type:'of',    vals:[100,200,400,600,1000,2000,4000],          pcts:[21,22,23,25,27,28,29] },
    90: { type:'of',    vals:[100,200,400,600,1000,2000,4000],          pcts:[21,22,23,24,25,26,27,28,29] },
    // ── 레벨 10 (G91~100): 레벨9 역방향 ──
    91: { type:'ratio', vals:[100,200,400,500,800,1000],                pcts:[21,22,23,24,25] },
    92: { type:'ratio', vals:[100,200,400,500,800,1000],                pcts:[26,27,28,29] },
    93: { type:'ratio', vals:[100,200,400,500,800,1000],                pcts:[21,23,25,27,29] },
    94: { type:'ratio', vals:[200,400,500,800,1000,2000],               pcts:[21,22,23,24,25,26] },
    95: { type:'ratio', vals:[200,400,500,800,1000,2000],               pcts:[24,25,26,27,28,29] },
    96: { type:'ratio', vals:[200,400,600,1000,2000,4000],              pcts:[21,23,25,27,29] },
    97: { type:'ratio', vals:[200,400,600,1000,2000,4000],              pcts:[21,22,23,24,25,26,27] },
    98: { type:'ratio', vals:[200,400,600,1000,2000,4000],              pcts:[21,23,25,27,28,29] },
    99: { type:'ratio', vals:[100,200,400,600,1000,2000,4000],          pcts:[21,22,23,25,27,28,29] },
    100:{ type:'ratio', vals:[100,200,400,600,1000,2000,4000],          pcts:[21,22,23,24,25,26,27,28,29] },
  };

  // 레벨별 전체 (val, pct) 조합을 결정적으로 섞어 idx번째 반환 → 중복 없음
  function genPctBasicProblem(level, idx) {
    const cfg = PCT_LEVEL_CFG[level];
    const pairs = [];
    for (const a of cfg.vals) {
      for (const p of cfg.pcts) {
        pairs.push([a, p]);
      }
    }
    // Fisher-Yates shuffle (레벨 고정 시드)
    const r = seededRand(level * 200003 + 31);
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    const [a, p] = pairs[idx % pairs.length];
    if (cfg.type === 'of') {
      return { text: t('pct.qOf', { a, p }), answer: round1(a * p / 100) };
    } else {
      const x = round1(a * p / 100);
      return { text: t('pct.qRatio', { x, a }), answer: p };
    }
  }
  function genPctAppliedRaw(level) {
    const cfg = PCT_LEVEL_CFG[level];
    const cat = PCT_APPLIED_CATS[Math.floor(Math.random() * PCT_APPLIED_CATS.length)];
    const a = cfg.vals[Math.floor(Math.random() * cfg.vals.length)];
    const b = cfg.pcts[Math.floor(Math.random() * cfg.pcts.length)];
    let answer;
    if (cat === 'pct_sale')      answer = a * (100 - b) / 100;
    else if (cat === 'pct_pop')  answer = a * b / 100;
    else if (cat === 'pct_tip')  answer = a * (100 + b) / 100;
    return { cat, vars: { a, b }, answer, text: t(`cats.${cat}.q`, { a, b }) };
  }

  // 나누기 — 100그룹 (레벨10×그룹10), 각 그룹 기초 12문제 + 응용 20문제
  const DIV_LEVELS = Array.from({ length: 100 }, (_, i) => i + 1);
  const DIV_LEVEL_QCOUNT = 12;
  const DIV_APPLIED_GOAL = 20;

  // 그룹별 난이도 설정 (정수 나누기 → 큰 수 → 소수점 순)
  const DIV_LEVEL_CFG = {
    // ── 레벨 1 (G1~10): 한 자리 제수, 두 자리 피제수 ──
    1:  { dMin:10,  dMax:40,  divisors:[2] },
    2:  { dMin:12,  dMax:60,  divisors:[3] },
    3:  { dMin:20,  dMax:80,  divisors:[4] },
    4:  { dMin:15,  dMax:75,  divisors:[5] },
    5:  { dMin:18,  dMax:96,  divisors:[6] },
    6:  { dMin:21,  dMax:98,  divisors:[7] },
    7:  { dMin:24,  dMax:96,  divisors:[8] },
    8:  { dMin:27,  dMax:99,  divisors:[9] },
    9:  { dMin:10,  dMax:99,  divisors:[2,3] },
    10: { dMin:12,  dMax:96,  divisors:[4,5,6] },
    // ── 레벨 2 (G11~20): 한 자리 제수, 세 자리 피제수 ──
    11: { dMin:100, dMax:400, divisors:[2] },
    12: { dMin:102, dMax:600, divisors:[3] },
    13: { dMin:100, dMax:500, divisors:[4] },
    14: { dMin:100, dMax:500, divisors:[5] },
    15: { dMin:102, dMax:600, divisors:[6] },
    16: { dMin:105, dMax:700, divisors:[7] },
    17: { dMin:104, dMax:800, divisors:[8] },
    18: { dMin:108, dMax:900, divisors:[9] },
    19: { dMin:100, dMax:600, divisors:[2,3,4] },
    20: { dMin:100, dMax:700, divisors:[5,6,7,8,9] },
    // ── 레벨 3 (G21~30): 제수 10~19 ──
    21: { dMin:20,  dMax:200, divisors:[10] },
    22: { dMin:22,  dMax:220, divisors:[11] },
    23: { dMin:24,  dMax:240, divisors:[12] },
    24: { dMin:26,  dMax:260, divisors:[13,14] },
    25: { dMin:30,  dMax:300, divisors:[15] },
    26: { dMin:32,  dMax:320, divisors:[16,17] },
    27: { dMin:36,  dMax:360, divisors:[18,19] },
    28: { dMin:30,  dMax:300, divisors:[10,11,12] },
    29: { dMin:40,  dMax:400, divisors:[13,14,15] },
    30: { dMin:50,  dMax:500, divisors:[16,17,18,19] },
    // ── 레벨 4 (G31~40): 제수 20~39 ──
    31: { dMin:40,  dMax:400, divisors:[20,21] },
    32: { dMin:60,  dMax:500, divisors:[22,23,24] },
    33: { dMin:50,  dMax:500, divisors:[25] },
    34: { dMin:80,  dMax:600, divisors:[26,27,28] },
    35: { dMin:90,  dMax:600, divisors:[29,30] },
    36: { dMin:100, dMax:700, divisors:[31,32,33] },
    37: { dMin:100, dMax:700, divisors:[34,35] },
    38: { dMin:100, dMax:700, divisors:[36,37] },
    39: { dMin:110, dMax:800, divisors:[38,39] },
    40: { dMin:100, dMax:700, divisors:[20,25,30,35] },
    // ── 레벨 5 (G41~50): 제수 40~59 ──
    41: { dMin:120, dMax:800, divisors:[40,41] },
    42: { dMin:130, dMax:800, divisors:[42,43,44] },
    43: { dMin:135, dMax:900, divisors:[45] },
    44: { dMin:140, dMax:900, divisors:[46,47,48] },
    45: { dMin:150, dMax:900, divisors:[49,50] },
    46: { dMin:150, dMax:900, divisors:[51,52,53] },
    47: { dMin:160, dMax:999, divisors:[54,55] },
    48: { dMin:170, dMax:999, divisors:[56,57,58] },
    49: { dMin:180, dMax:999, divisors:[59] },
    50: { dMin:200, dMax:999, divisors:[40,45,50,55] },
    // ── 레벨 6 (G51~60): 제수 60~79 ──
    51: { dMin:180, dMax:900, divisors:[60,61,62] },
    52: { dMin:190, dMax:900, divisors:[63,64,65] },
    53: { dMin:200, dMax:900, divisors:[66,67,68] },
    54: { dMin:210, dMax:999, divisors:[69,70] },
    55: { dMin:210, dMax:999, divisors:[71,72,73] },
    56: { dMin:220, dMax:999, divisors:[74,75] },
    57: { dMin:230, dMax:999, divisors:[76,77,78] },
    58: { dMin:240, dMax:999, divisors:[79] },
    59: { dMin:240, dMax:999, divisors:[60,65,70,75] },
    60: { dMin:240, dMax:999, divisors:[62,64,68,72,76] },
    // ── 레벨 7 (G61~70): 제수 80~99 ──
    61: { dMin:240, dMax:960, divisors:[80,81,82] },
    62: { dMin:250, dMax:999, divisors:[83,84,85] },
    63: { dMin:260, dMax:999, divisors:[86,87,88] },
    64: { dMin:270, dMax:999, divisors:[89,90] },
    65: { dMin:280, dMax:999, divisors:[91,92,93] },
    66: { dMin:280, dMax:999, divisors:[94,95] },
    67: { dMin:290, dMax:999, divisors:[96,97,98] },
    68: { dMin:300, dMax:999, divisors:[99] },
    69: { dMin:320, dMax:999, divisors:[80,85,90,95] },
    70: { dMin:320, dMax:999, divisors:[81,84,90,96,99] },
    // ── 레벨 8 (G71~80): 네 자리 큰 수 나누기 ──
    71: { dMin:500,  dMax:5000, divisors:[2,3,4,5] },
    72: { dMin:600,  dMax:5000, divisors:[6,7,8,9] },
    73: { dMin:800,  dMax:5000, divisors:[10,11,12,15] },
    74: { dMin:1000, dMax:5000, divisors:[20,25,50] },
    75: { dMin:1000, dMax:9900, divisors:[100] },
    76: { dMin:1000, dMax:8000, divisors:[200,400,500] },
    77: { dMin:1000, dMax:9000, divisors:[11,13,17,19] },
    78: { dMin:1000, dMax:8000, divisors:[23,29,31] },
    79: { dMin:1000, dMax:9000, divisors:[37,41,43,47] },
    80: { dMin:2000, dMax:9000, divisors:[100,200,500] },
    // ── 레벨 9 (G81~90): 소수점 나누기, 작은 제수 ──
    81: { dMin:10,  dMax:90,  divisors:[3],           decimal:true },
    82: { dMin:10,  dMax:90,  divisors:[6],           decimal:true },
    83: { dMin:10,  dMax:90,  divisors:[7],           decimal:true },
    84: { dMin:20,  dMax:150, divisors:[3,6],         decimal:true },
    85: { dMin:20,  dMax:150, divisors:[7,9],         decimal:true },
    86: { dMin:50,  dMax:300, divisors:[11,13],       decimal:true },
    87: { dMin:50,  dMax:300, divisors:[17,19],       decimal:true },
    88: { dMin:100, dMax:500, divisors:[3,6,7,9],     decimal:true },
    89: { dMin:100, dMax:500, divisors:[11,13,17,19], decimal:true },
    90: { dMin:100, dMax:500, divisors:[7,11,13,17],  decimal:true },
    // ── 레벨 10 (G91~100): 소수점 나누기, 큰 제수 ──
    91: { dMin:100, dMax:500, divisors:[23,29,31],       decimal:true },
    92: { dMin:100, dMax:600, divisors:[37,41,43],       decimal:true },
    93: { dMin:200, dMax:700, divisors:[47,53,59],       decimal:true },
    94: { dMin:200, dMax:800, divisors:[61,67,71],       decimal:true },
    95: { dMin:300, dMax:900, divisors:[73,79,83],       decimal:true },
    96: { dMin:300, dMax:999, divisors:[89,97],          decimal:true },
    97: { dMin:200, dMax:800, divisors:[23,29,37,41],    decimal:true },
    98: { dMin:200, dMax:900, divisors:[43,47,53,59],    decimal:true },
    99: { dMin:300, dMax:999, divisors:[61,67,71,73],    decimal:true },
    100:{ dMin:400, dMax:999, divisors:[79,83,89,97],    decimal:true },
  };

  // 결정적 난수 (레벨×인덱스 시드)
  function seededRand(seed) {
    let s = seed >>> 0;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  function genDivBasicProblem(level, idx) {
    const cfg = DIV_LEVEL_CFG[level];
    const r = seededRand(level * 100003 + idx * 37 + 7);
    const b = cfg.divisors[Math.floor(r() * cfg.divisors.length)];
    if (cfg.decimal) {
      const range = cfg.dMax - cfg.dMin + 1;
      const a = cfg.dMin + Math.floor(r() * range);
      const answer = Math.round(a / b * 10) / 10;
      return { a, b, answer, decimal: true };
    }
    const minAns = Math.max(2, Math.ceil(cfg.dMin / b));
    const maxAns = Math.floor(cfg.dMax / b);
    const ans = minAns + Math.floor(r() * Math.max(1, (maxAns - minAns + 1)));
    return { a: b * ans, b, answer: ans };
  }
  function genDivAppliedRaw(level) {
    const cfg = DIV_LEVEL_CFG[level];
    const cat = DIV_APPLIED_CATS[Math.floor(Math.random() * DIV_APPLIED_CATS.length)];
    const b = cfg.divisors[Math.floor(Math.random() * cfg.divisors.length)];
    const minAns = Math.max(2, Math.ceil(cfg.dMin / b));
    const maxAns = Math.floor(cfg.dMax / b);
    const ans = minAns + Math.floor(Math.random() * Math.max(1, (maxAns - minAns + 1)));
    const a = b * ans;
    return { cat, vars: { a, b }, answer: ans, text: t(`cats.${cat}.q`, { a, b }) };
  }

  // ====== DOM ======
  const app = document.getElementById('app');
  const backBtn = document.getElementById('backBtn');
  const titleEl = document.getElementById('title');
  const profileNameEl = document.getElementById('profileName');

  // ====== 언어 ======
  window.currentLang = localStorage.getItem('gumon.lang') || 'ko';
  document.documentElement.lang = window.currentLang;

  function setLang(lang) {
    window.currentLang = lang;
    localStorage.setItem('gumon.lang', lang);
    document.documentElement.lang = lang;
    applyStaticI18n();
    render();
  }

  function applyStaticI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    titleEl.textContent = t('app.title');
  }

  // ====== 프로필 ======
  function loadProfiles() {
    try { return JSON.parse(localStorage.getItem('gumon.profiles')) || []; }
    catch { return []; }
  }
  function saveProfiles(list) {
    localStorage.setItem('gumon.profiles', JSON.stringify(list));
  }
  function currentProfileId() {
    return localStorage.getItem('gumon.currentProfile') || 'guest';
  }
  function currentProfile() {
    const id = currentProfileId();
    if (id === 'guest') return { id: 'guest', name: t('settings.guest') };
    return loadProfiles().find(p => p.id === id) || { id: 'guest', name: t('settings.guest') };
  }
  function setCurrentProfile(id) {
    localStorage.setItem('gumon.currentProfile', id);
    progress = loadProgress();
    updateProfileChip();
  }
  function updateProfileChip() {
    profileNameEl.textContent = currentProfile().name;
  }
  function login(name) {
    name = String(name || '').trim();
    if (!name) return;
    const list = loadProfiles();
    let p = list.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!p) {
      p = { id: 'p_' + Date.now().toString(36), name };
      list.push(p);
      saveProfiles(list);
    }
    setCurrentProfile(p.id);
  }
  function logout() { setCurrentProfile('guest'); }
  function removeProfile(id) {
    const list = loadProfiles().filter(p => p.id !== id);
    saveProfiles(list);
    localStorage.removeItem(`gumon.profile.${id}.progress`);
    if (currentProfileId() === id) setCurrentProfile('guest');
  }

  // ====== 진행상황 ======
  function progressKey() { return `gumon.profile.${currentProfileId()}.progress`; }
  function loadProgress() {
    try {
      const raw = JSON.parse(localStorage.getItem(progressKey())) || {};
      raw.mul = raw.mul || { basic: {}, applied: {} };
      raw.div = raw.div || { basic: {}, applied: {} };
      raw.pct = raw.pct || { basic: {}, applied: {} };
      raw.mul.basic = raw.mul.basic || {};
      raw.mul.applied = raw.mul.applied || {};
      raw.div.basic = raw.div.basic || {};
      raw.div.applied = raw.div.applied || {};
      raw.pct.basic = raw.pct.basic || {};
      raw.pct.applied = raw.pct.applied || {};
      return raw;
    } catch {
      return { mul: { basic: {}, applied: {} }, div: { basic: {}, applied: {} },
               pct: { basic: {}, applied: {} } };
    }
  }
  function saveProgress() {
    localStorage.setItem(progressKey(), JSON.stringify(progress));
  }
  function resetProgress() {
    localStorage.removeItem(progressKey());
    progress = loadProgress();
  }
  let progress = loadProgress();

  // ====== 완료 판정 ======
  function mulDanDone(dan) {
    const s = progress.mul.basic[dan] || {};
    for (let m = 1; m <= MUL_MAX; m++) if (!s[m]) return false;
    return true;
  }
  function mulDanCount(dan) {
    const s = progress.mul.basic[dan] || {};
    let c = 0;
    for (let m = 1; m <= MUL_MAX; m++) if (s[m]) c++;
    return c;
  }
  function mulAppliedCount(dan) {
    return progress.mul.applied[dan]?.correct || 0;
  }
  function mulDanFullyDone(dan) {
    return mulDanDone(dan) && mulAppliedCount(dan) >= MUL_APPLIED_GOAL;
  }
  function divLevelDone(lv) {
    const s = progress.div.basic[lv] || {};
    for (let i = 0; i < DIV_LEVEL_QCOUNT; i++) if (!s[i]) return false;
    return true;
  }
  function divLevelCount(lv) {
    const s = progress.div.basic[lv] || {};
    let c = 0;
    for (let i = 0; i < DIV_LEVEL_QCOUNT; i++) if (s[i]) c++;
    return c;
  }
  function divAppliedCount(lv) {
    return progress.div.applied[lv]?.correct || 0;
  }
  function divFullyDone(lv) {
    return divLevelDone(lv) && divAppliedCount(lv) >= DIV_APPLIED_GOAL;
  }
  function pctLevelCount(lv) {
    const s = progress.pct.basic[lv] || {};
    let c = 0;
    for (let i = 0; i < PCT_BASIC_COUNT; i++) if (s[i]) c++;
    return c;
  }
  function pctLevelDone(lv) {
    return pctLevelCount(lv) === PCT_BASIC_COUNT;
  }
  function pctAppliedCount(lv) {
    return progress.pct.applied[lv]?.correct || 0;
  }
  function pctFullyDone(lv) {
    return pctLevelDone(lv) && pctAppliedCount(lv) >= PCT_APPLIED_GOAL;
  }

  // ====== 네비게이션 ======
  let stack = [{ tab: 'mul', name: 'levels' }];

  // 핸드폰 뒤로가기 버튼 지원: 항상 history 항목을 하나 유지해 popstate 를 가로챔
  history.replaceState({ pw: true }, '');
  function _pushHistoryEntry() { history.pushState({ pw: true }, ''); }
  window.addEventListener('popstate', () => {
    if (stack.length > 1) {
      stack.pop();
      render();
    }
    // 항목을 다시 밀어넣어 다음 뒤로가기도 인터셉트
    history.pushState({ pw: true }, '');
  });

  function go(view, replace = false) {
    if (replace) stack[stack.length - 1] = view;
    else { stack.push(view); _pushHistoryEntry(); }
    render();
  }
  function back() {
    if (stack.length > 1) { stack.pop(); render(); }
  }
  function switchTab(tab) {
    stack = [tabHome(tab)];
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    render();
  }
  function tabHome(tab) {
    if (tab === 'mul') return { tab, name: 'levels' };
    if (tab === 'div') return { tab, name: 'home' };
    if (tab === 'pct') return { tab, name: 'home' };
    return { tab, name: 'home' };
  }
  backBtn.addEventListener('click', back);
  document.getElementById('profileChip').addEventListener('click', () => switchTab('settings'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });

  // ====== 채점 헬퍼 ======
  function check(input, expected) {
    if (input === '' || input == null) return false;
    const v = Number(input);
    if (!Number.isFinite(v)) return false;
    return Math.abs(v - expected) <= TOL;
  }
  function round1(n) { return Math.round(n * 10) / 10; }

  // ====== 응용 문제 생성기 ======
  // 곱하기 응용: dan = N, 두번째 인자 M은 1~20
  function genMulApplied(dan) {
    const cat = MUL_APPLIED_CATS[Math.floor(Math.random() * MUL_APPLIED_CATS.length)];
    let a, b;
    if (cat === 'mul_price') {
      a = dan * 100; // 1100원, 1200원 같이
      b = 2 + Math.floor(Math.random() * 19); // 2~20
    } else if (cat === 'mul_drive') {
      a = dan; // 시속 dan km
      b = 2 + Math.floor(Math.random() * 9); // 2~10 시간
    } else if (cat === 'mul_lap') {
      a = dan * 10; // 한 바퀴 (dan*10) m
      b = 2 + Math.floor(Math.random() * 14); // 2~15 바퀴
    } else {
      a = dan;
      b = 2 + Math.floor(Math.random() * 19); // 2~20
    }
    const answer = a * b;
    return { cat, vars: { a, b }, answer, text: t(`cats.${cat}.q`, { a, b }) };
  }

  // ====== 렌더링 ======
  const QUIZ_VIEWS = new Set(['basicQuiz', 'appliedQuiz']);
  function isGuest() { return currentProfileId() === 'guest'; }

  function renderGuestGate() {
    titleEl.textContent = t('common.loginRequired');
    const lang = window.currentLang;
    const langOpts = [
      ['ko', '한국어'],
      ['zh', '中文'],
      ['en', 'English'],
    ].map(([code, name]) =>
      `<button class="lang-btn ${lang === code ? 'active' : ''}" data-lang="${code}">${name}</button>`
    ).join('');
    app.innerHTML = `
      <section class="settings-section" style="margin-top:24px">
        <div class="lang-row" style="display:flex;gap:8px;justify-content:center;margin-bottom:20px">${langOpts}</div>
        <h3>🔒 ${t('common.loginRequired')}</h3>
        <div class="sub" style="margin:12px 0">${t('common.loginRequiredDesc')}</div>
        <div class="login-box">
          <input id="gateLoginName" class="text-input" placeholder="${t('settings.nameLabel')}" />
          <button class="primary-btn" id="gateLoginBtn">${t('settings.login')}</button>
        </div>
      </section>`;
    app.querySelectorAll('.lang-btn').forEach(b =>
      b.addEventListener('click', () => { setLang(b.dataset.lang); renderGuestGate(); })
    );
    const nameInput = document.getElementById('gateLoginName');
    const doLogin = () => {
      const name = nameInput.value.trim();
      if (!name) return;
      login(name);
      render();
    };
    document.getElementById('gateLoginBtn').addEventListener('click', doLogin);
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    nameInput.focus();
  }

  function render() {
    const v = stack[stack.length - 1];
    backBtn.hidden = stack.length <= 1;
    applyStaticI18n();
    updateProfileChip();

    // 한 번도 로그인 안 한 상태면 로그인 페이지 먼저
    if (isGuest()) {
      renderGuestGate();
      return;
    }

    if (v.tab === 'mul') renderMul(v);
    else if (v.tab === 'div') renderDiv(v);
    else if (v.tab === 'pct') renderPct(v);
    else if (v.tab === 'settings') renderSettings();
  }

  // ---- 곱하기 ----
  function levelRange(level) {
    const start = 10 + (level - 1) * 10 + 1;
    const end = Math.min(start + 9, DAN_MAX);
    return { start, end };
  }
  function renderMul(v) {
    if (v.name === 'levels') {
      titleEl.textContent = t('tab.mul');
      const cards = [];
      for (let lv = 1; lv <= 9; lv++) {
        const { start, end } = levelRange(lv);
        let done = 0, total = end - start + 1;
        for (let d = start; d <= end; d++) if (mulDanFullyDone(d)) done++;
        const pct = Math.round(done / total * 100);
        const complete = done === total;
        cards.push(`
          <div class="card ${complete ? 'complete' : ''}" data-level="${lv}">
            <div class="label">${t('common.level')} ${lv}</div>
            <div class="sub">${start}${t('common.dan')} ~ ${end}${t('common.dan')}</div>
            <div class="progress-bar"><span style="width:${pct}%"></span></div>
            <div class="sub">${done} / ${total}</div>
          </div>`);
      }
      app.innerHTML = `
        <div class="section-title">${t('common.selectLevel')}</div>
        <div class="level-grid">${cards.join('')}</div>`;
      app.querySelectorAll('.card').forEach(el => {
        el.addEventListener('click', () =>
          go({ tab: 'mul', name: 'dans', level: +el.dataset.level }));
      });
      return;
    }

    if (v.name === 'dans') {
      const { start, end } = levelRange(v.level);
      titleEl.textContent = `${t('common.level')} ${v.level}`;
      const cards = [];
      for (let d = start; d <= end; d++) {
        const basic = mulDanCount(d);
        const app = mulAppliedCount(d);
        const fully = mulDanFullyDone(d);
        const basicPct = basic / MUL_MAX;
        const appPct = Math.min(app / MUL_APPLIED_GOAL, 1);
        const pct = Math.round((basicPct * 0.5 + appPct * 0.5) * 100);
        cards.push(`
          <div class="card ${fully ? 'complete' : ''}" data-dan="${d}">
            <div class="label">${d}${t('common.dan')}</div>
            <div class="progress-bar"><span style="width:${pct}%"></span></div>
            <div class="sub">기초 ${basic}/${MUL_MAX}</div>
            <div class="sub">응용 ${Math.min(app, MUL_APPLIED_GOAL)}/${MUL_APPLIED_GOAL}</div>
          </div>`);
      }
      app.innerHTML = `
        <div class="section-title">${start}${t('common.dan')} ~ ${end}${t('common.dan')}</div>
        <div class="dan-grid">${cards.join('')}</div>`;
      app.querySelectorAll('.card').forEach(el => {
        el.addEventListener('click', () =>
          go({ tab: 'mul', name: 'danMenu', dan: +el.dataset.dan }));
      });
      return;
    }

    if (v.name === 'danMenu') {
      const dan = v.dan;
      titleEl.textContent = `${dan}${t('common.dan')}`;
      const basicDone = mulDanDone(dan);
      const basicCount = mulDanCount(dan);
      const applied = progress.mul.applied[dan]?.correct || 0;
      app.innerHTML = `
        <div class="section-title">${t('common.selectStage')}</div>
        <div class="stage-list">
          <div class="card stage-card ${basicDone ? 'complete' : ''}" data-stage="basic">
            <div class="label">${t('common.basic')}</div>
            <div class="sub">${t('mul.stageBasic')}</div>
            <div class="progress-bar"><span style="width:${Math.round(basicCount/MUL_MAX*100)}%"></span></div>
            <div class="sub">${basicCount}/${MUL_MAX}</div>
          </div>
          <div class="card stage-card ${basicDone ? '' : 'locked'}" data-stage="applied">
            <div class="label">${t('common.applied')} ${basicDone ? '' : '🔒'}</div>
            <div class="sub">${t('mul.appliedDesc', { dan })}</div>
            <div class="sub">${t('common.correctCount')}: ${applied}</div>
          </div>
        </div>`;
      app.querySelectorAll('.stage-card').forEach(el => {
        el.addEventListener('click', () => {
          const s = el.dataset.stage;
          if (s === 'applied' && !basicDone) { alert(t('common.basicNotDone')); return; }
          go({ tab: 'mul', name: s === 'basic' ? 'basicQuiz' : 'appliedQuiz', dan });
        });
      });
      return;
    }

    if (v.name === 'basicQuiz') {
      renderMulBasicQuiz(v.dan);
      return;
    }
    if (v.name === 'appliedQuiz') {
      const level = Math.floor((v.dan - 11) / 10) + 1;
      const { start, end } = levelRange(level);
      renderRandomQuiz({
        title: `${v.dan}${t('common.dan')} · ${t('common.applied')}`,
        getCount: () => {
          const n = progress.mul.applied[v.dan]?.correct || 0;
          return `${Math.min(n, MUL_APPLIED_GOAL)}/${MUL_APPLIED_GOAL}` + (n > MUL_APPLIED_GOAL ? ` (+${n-MUL_APPLIED_GOAL})` : '');
        },
        getRaw: () => progress.mul.applied[v.dan]?.correct || 0,
        goal: MUL_APPLIED_GOAL,
        bump: () => {
          progress.mul.applied[v.dan] = progress.mul.applied[v.dan] || { correct: 0 };
          progress.mul.applied[v.dan].correct++;
          saveProgress();
        },
        gen: () => genMulApplied(v.dan),
        nextLabel: `${start}~${end}${t('common.dan')} →`,
        onNext: () => {
          stack = [{ tab: 'mul', name: 'levels' }, { tab: 'mul', name: 'dans', level }];
          render();
        },
        onReset: () => {
          delete progress.mul.applied[v.dan];
          saveProgress();
        },
      });
      return;
    }
  }

  function renderMulBasicQuiz(dan) {
    titleEl.textContent = `${dan}${t('common.dan')} · ${t('common.basic')}`;
    const state = progress.mul.basic[dan] || {};
    const rows = [];
    for (let m = 1; m <= MUL_MAX; m++) {
      const correct = !!state[m];
      const ans = dan * m;
      rows.push(`
        <div class="q-row ${correct ? 'correct' : ''}" data-mul="${m}">
          <span class="eq">${dan} × ${m} =</span>
          <input class="answer-box" type="number" inputmode="numeric"
                 data-answer="${ans}" ${correct ? `value="${ans}" readonly` : ''} />
        </div>`);
    }
    const done = mulDanCount(dan);
    app.innerHTML = `
      <div class="dan-header">
        <h2>${dan}${t('common.dan')}</h2>
        <div>
          <span class="count">${done}/${MUL_MAX}</span>
          <button class="reset-btn" id="resetDan">${t('common.reset')}</button>
        </div>
      </div>
      <div class="q-list">${rows.join('')}</div>
      <div id="banner"></div>`;
    app.querySelectorAll('.q-row').forEach(row => {
      const input = row.querySelector('.answer-box');
      const expected = Number(input.dataset.answer);
      const doCheck = () => {
        if (!input.value) return;
        if (check(input.value, expected)) {
          row.classList.remove('wrong');
          row.classList.add('correct');
          input.setAttribute('readonly', '');
          input.value = expected;
          progress.mul.basic[dan] = progress.mul.basic[dan] || {};
          progress.mul.basic[dan][+row.dataset.mul] = true;
          saveProgress();
          updateBasicFooter(dan);
          const nx = findNextEmpty(row);
          if (nx) nx.focus();
        } else {
          row.classList.add('wrong');
          setTimeout(() => row.classList.remove('wrong'), 400);
        }
      };
      input.addEventListener('blur', doCheck);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doCheck(); } });
    });
    document.getElementById('resetDan').addEventListener('click', () => {
      if (!confirm(t('settings.resetConfirm'))) return;
      delete progress.mul.basic[dan];
      saveProgress();
      renderMulBasicQuiz(dan);
    });
    updateBasicFooter(dan);
  }
  function updateBasicFooter(dan) {
    const done = mulDanCount(dan);
    const c = document.querySelector('.dan-header .count');
    if (c) c.textContent = `${done}/${MUL_MAX}`;
    const banner = document.getElementById('banner');
    if (done === MUL_MAX && banner) {
      const level = Math.floor((dan - 11) / 10) + 1;
      const { start, end } = levelRange(level);
      banner.innerHTML = `
        <button type="button" class="complete-banner banner-btn" id="goDansBtn">
          🎉 ${dan}${t('common.dan')} ${t('common.basic')} ${t('common.perfect')} — ${start}~${end}${t('common.dan')} →
        </button>`;
      const btn = document.getElementById('goDansBtn');
      const handler = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        // 단 목록 페이지로 복귀
        stack = [{ tab: 'mul', name: 'levels' }, { tab: 'mul', name: 'dans', level }];
        render();
      };
      if (btn) {
        btn.addEventListener('click', handler);
        btn.addEventListener('touchend', handler);
      }
    } else if (banner) {
      banner.innerHTML = '';
    }
  }
  function findNextEmpty(row) {
    let el = row.nextElementSibling;
    while (el) {
      const inp = el.querySelector?.('.answer-box');
      if (inp && !inp.hasAttribute('readonly')) return inp;
      el = el.nextElementSibling;
    }
    return null;
  }

  // ---- 무한 랜덤 퀴즈 (응용 공통) ----
  // goal: 도달 시 완료 화면 표시. getRaw: 현재 정답 개수(숫자).
  function renderRandomQuiz({ title, getCount, bump, gen, goal, getRaw, nextLabel, onNext, onReset }) {
    titleEl.textContent = title;
    let problem = gen();
    let extra = false; // 목표 달성 후 추가 연습 모드

    function isDone() {
      return goal && !extra && getRaw && getRaw() >= goal;
    }
    function doReset() {
      if (!onReset) return;
      if (!confirm(t('settings.resetConfirm'))) return;
      onReset();
      extra = false;
      problem = gen();
      draw();
    }
    function drawComplete() {
      const nextBtn = onNext
        ? `<button class="primary-btn" id="nextPartBtn">${nextLabel || t('common.nextPart')}</button>`
        : '';
      app.innerHTML = `
        <div class="dan-header">
          <h2>${title}</h2>
          <span class="count">${t('common.correctCount')}: ${getCount()}</span>
        </div>
        <div class="complete-banner" style="margin-top:24px">
          🎉 ${t('common.perfect')} (${goal}/${goal})
        </div>
        <div class="q-actions" style="margin-top:16px">
          ${nextBtn}
          <button class="reset-btn" id="moreBtn">${t('common.practiceMore')}</button>
          ${onReset ? `<button class="reset-btn" id="resetAppliedBtn">${t('common.reset')}</button>` : ''}
          <button class="reset-btn" id="doneBackBtn">${t('common.back')}</button>
        </div>`;
      const nb = document.getElementById('nextPartBtn');
      if (nb) nb.addEventListener('click', onNext);
      document.getElementById('moreBtn').addEventListener('click', () => {
        extra = true; problem = gen(); draw();
      });
      const rb = document.getElementById('resetAppliedBtn');
      if (rb) rb.addEventListener('click', doReset);
      document.getElementById('doneBackBtn').addEventListener('click', back);
    }
    function draw() {
      if (isDone()) { drawComplete(); return; }
      app.innerHTML = `
        <div class="dan-header">
          <h2>${title}</h2>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="count">${t('common.correctCount')}: ${getCount()}</span>
            ${onReset ? `<button class="reset-btn" id="resetAppliedBtn" style="font-size:0.75rem">${t('common.reset')}</button>` : ''}
          </div>
        </div>
        <div class="word-q">${problem.text}</div>
        <div class="q-row solo">
          <span class="eq">${t('common.answer')} =</span>
          <input class="answer-box" id="appInput" type="number" inputmode="decimal" autofocus />
        </div>
        <div class="q-actions">
          <button class="primary-btn" id="checkBtn">${t('common.confirm')}</button>
        </div>
        <div id="feedback" class="feedback"></div>`;
      const input = document.getElementById('appInput');
      const fb = document.getElementById('feedback');
      const checkBtn = document.getElementById('checkBtn');
      const rb = document.getElementById('resetAppliedBtn');
      if (rb) rb.addEventListener('click', doReset);
      function attempt() {
        if (!input.value) return;
        if (check(input.value, problem.answer)) {
          bump();
          fb.innerHTML = `<span class="ok">✓ ${problem.answer}</span>`;
          setTimeout(() => {
            if (isDone()) { drawComplete(); return; }
            problem = gen(); draw();
          }, 700);
        } else {
          fb.innerHTML = `<span class="ng">${t('common.tryAgain')}</span>`;
          input.classList.add('wrong-input');
          setTimeout(() => input.classList.remove('wrong-input'), 400);
        }
      }
      checkBtn.addEventListener('click', attempt);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); attempt(); } });
      input.focus();
    }
    draw();
  }

  // ---- 그룹 설명 헬퍼 ----
  function divGroupDesc(lv) {
    const c = DIV_LEVEL_CFG[lv];
    if (!c) return '';
    const ds = c.divisors;
    const dStr = ds.length === 1 ? `÷${ds[0]}` : `÷${ds[0]}~÷${ds[ds.length-1]}`;
    return `${c.dMin}~${c.dMax} ${dStr}${c.decimal ? ' (소수)' : ''}`;
  }
  function pctGroupDesc(lv) {
    const c = PCT_LEVEL_CFG[lv];
    if (!c) return '';
    const typeStr = c.type === 'of' ? t('pct.catOf') : t('pct.catRatio');
    return `${typeStr} · ${c.pcts[0]}~${c.pcts[c.pcts.length-1]}%`;
  }

  // ---- 나누기 ----
  const DIV_GROUP_SIZE = 10; // 레벨당 그룹 수
  const DIV_SUPER_COUNT = 10; // 총 레벨 수 (10개씩 10레벨 = 100그룹)
  function divGroupRange(superLv) {
    const start = (superLv - 1) * DIV_GROUP_SIZE + 1;
    const end = superLv * DIV_GROUP_SIZE;
    return { start, end };
  }

  function renderDiv(v) {
    // ① 레벨 선택 (2개)
    if (v.name === 'home') {
      titleEl.textContent = t('tab.div');
      const cards = [];
      for (let sl = 1; sl <= DIV_SUPER_COUNT; sl++) {
        const { start, end } = divGroupRange(sl);
        let done = 0;
        for (let lv = start; lv <= end; lv++) if (divFullyDone(lv)) done++;
        const pct = Math.round(done / DIV_GROUP_SIZE * 100);
        const complete = done === DIV_GROUP_SIZE;
        cards.push(`
          <div class="card ${complete ? 'complete' : ''}" data-sl="${sl}">
            <div class="label">${t('common.level')} ${sl}</div>
            <div class="sub">${t('common.group')} ${start} ~ ${end}</div>
            <div class="progress-bar"><span style="width:${pct}%"></span></div>
            <div class="sub">${done} / ${DIV_GROUP_SIZE}</div>
          </div>`);
      }
      app.innerHTML = `
        <div class="section-title">${t('common.selectLevel')}</div>
        <div class="level-grid">${cards.join('')}</div>`;
      app.querySelectorAll('.card').forEach(el => {
        el.addEventListener('click', () =>
          go({ tab: 'div', name: 'groups', superLevel: +el.dataset.sl }));
      });
      return;
    }

    // ② 그룹 선택 (10개)
    if (v.name === 'groups') {
      const { start, end } = divGroupRange(v.superLevel);
      titleEl.textContent = `${t('common.level')} ${v.superLevel}`;
      const cards = [];
      for (let lv = start; lv <= end; lv++) {
        const basic = divLevelCount(lv);
        const applied = divAppliedCount(lv);
        const fully = divFullyDone(lv);
        const pct = Math.round((basic / DIV_LEVEL_QCOUNT * 0.5 + Math.min(applied / DIV_APPLIED_GOAL, 1) * 0.5) * 100);
        cards.push(`
          <div class="card ${fully ? 'complete' : ''}" data-lv="${lv}">
            <div class="label">${t('common.group')} ${lv}</div>
            <div class="sub">${divGroupDesc(lv)}</div>
            <div class="progress-bar"><span style="width:${pct}%"></span></div>
            <div class="sub">${basic}/${DIV_LEVEL_QCOUNT}</div>
          </div>`);
      }
      app.innerHTML = `
        <div class="section-title">${t('common.group')} ${start} ~ ${end}</div>
        <div class="dan-grid">${cards.join('')}</div>`;
      app.querySelectorAll('.card').forEach(el => {
        el.addEventListener('click', () =>
          go({ tab: 'div', name: 'groupMenu', level: +el.dataset.lv, superLevel: v.superLevel }));
      });
      return;
    }

    // ③ 기초/응용 선택
    if (v.name === 'groupMenu') {
      const lv = v.level;
      titleEl.textContent = `${t('common.group')} ${lv}`;
      const basicDone = divLevelDone(lv);
      const basicCount = divLevelCount(lv);
      const applied = divAppliedCount(lv);
      app.innerHTML = `
        <div class="section-title">${divGroupDesc(lv)}</div>
        <div class="stage-list">
          <div class="card stage-card ${basicDone ? 'complete' : ''}" data-stage="basic">
            <div class="label">${t('common.basic')}</div>
            <div class="progress-bar"><span style="width:${Math.round(basicCount/DIV_LEVEL_QCOUNT*100)}%"></span></div>
            <div class="sub">${basicCount}/${DIV_LEVEL_QCOUNT}</div>
          </div>
          <div class="card stage-card ${basicDone ? '' : 'locked'}" data-stage="applied">
            <div class="label">${t('common.applied')} ${basicDone ? '' : '🔒'}</div>
            <div class="sub">${t('common.correctCount')}: ${Math.min(applied, DIV_APPLIED_GOAL)}/${DIV_APPLIED_GOAL}</div>
          </div>
        </div>`;
      app.querySelectorAll('.stage-card').forEach(el => {
        el.addEventListener('click', () => {
          const s = el.dataset.stage;
          if (s === 'applied' && !basicDone) { alert(t('common.basicNotDone')); return; }
          go({ tab: 'div', name: s === 'basic' ? 'basicQuiz' : 'appliedQuiz', level: lv, superLevel: v.superLevel });
        });
      });
      return;
    }

    if (v.name === 'basicQuiz') {
      renderDivBasicQuiz(v.level, v.superLevel);
      return;
    }
    if (v.name === 'appliedQuiz') {
      const lv = v.level;
      const sl = v.superLevel;
      renderRandomQuiz({
        title: `${t('common.group')} ${lv} · ${t('common.applied')}`,
        getCount: () => {
          const n = divAppliedCount(lv);
          return `${Math.min(n, DIV_APPLIED_GOAL)}/${DIV_APPLIED_GOAL}` + (n > DIV_APPLIED_GOAL ? ` (+${n-DIV_APPLIED_GOAL})` : '');
        },
        getRaw: () => divAppliedCount(lv),
        goal: DIV_APPLIED_GOAL,
        bump: () => {
          progress.div.applied[lv] = progress.div.applied[lv] || { correct: 0 };
          progress.div.applied[lv].correct++;
          saveProgress();
        },
        gen: () => genDivAppliedRaw(lv),
        nextLabel: t('common.levelList'),
        onNext: () => {
          stack = [{ tab: 'div', name: 'home' }, { tab: 'div', name: 'groups', superLevel: sl }];
          render();
        },
        onReset: () => {
          delete progress.div.applied[lv];
          saveProgress();
        },
      });
      return;
    }
  }

  function renderDivBasicQuiz(level, superLevel) {
    superLevel = superLevel || Math.ceil(level / DIV_GROUP_SIZE);
    const desc = divGroupDesc(level);
    titleEl.textContent = `${t('common.group')} ${level} · ${desc}`;
    const state = progress.div.basic[level] || {};
    const isDecimalLevel = !!DIV_LEVEL_CFG[level]?.decimal;
    const probs = Array.from({ length: DIV_LEVEL_QCOUNT }, (_, i) => genDivBasicProblem(level, i));
    const rows = probs.map((p, i) => {
      const correct = !!state[i];
      return `
        <div class="q-row ${correct ? 'correct' : ''}" data-idx="${i}">
          <span class="eq">${p.a} ÷ ${p.b} =</span>
          <input class="answer-box" type="number" inputmode="${isDecimalLevel ? 'decimal' : 'numeric'}"
                 data-answer="${p.answer}" ${correct ? `value="${p.answer}" readonly` : ''} />
        </div>`;
    }).join('');
    const done = divLevelCount(level);
    app.innerHTML = `
      <div class="dan-header">
        <h2>${t('common.group')} ${level}</h2>
        <div>
          <span class="count">${done}/${DIV_LEVEL_QCOUNT}</span>
          <button class="reset-btn" id="resetDiv">${t('common.reset')}</button>
        </div>
      </div>
      <div class="sub" style="margin-bottom:12px">${desc}</div>
      <div class="q-list">${rows}</div>
      <div id="banner"></div>`;
    app.querySelectorAll('.q-row').forEach(row => {
      const input = row.querySelector('.answer-box');
      const expected = Number(input.dataset.answer);
      const doCheck = () => {
        if (!input.value) return;
        if (check(input.value, expected)) {
          row.classList.remove('wrong');
          row.classList.add('correct');
          input.setAttribute('readonly', '');
          input.value = expected;
          progress.div.basic[level] = progress.div.basic[level] || {};
          progress.div.basic[level][+row.dataset.idx] = true;
          saveProgress();
          const newDone = divLevelCount(level);
          const c = document.querySelector('.dan-header .count');
          if (c) c.textContent = `${newDone}/${DIV_LEVEL_QCOUNT}`;
          const banner = document.getElementById('banner');
          if (newDone === DIV_LEVEL_QCOUNT && banner) {
            banner.innerHTML = `
              <button type="button" class="complete-banner banner-btn" id="goDivAppliedBtn">
                🎉 ${t('common.level')} ${level} ${t('common.basic')} ${t('common.perfect')} — ${t('common.levelList')} →
              </button>`;
            const b = document.getElementById('goDivAppliedBtn');
            const h = () => { stack = [{ tab: 'div', name: 'home' }, { tab: 'div', name: 'groups', superLevel }]; render(); };
            b.addEventListener('click', h);
            b.addEventListener('touchend', h);
          }
          const nx = findNextEmpty(row);
          if (nx) nx.focus();
        } else {
          row.classList.add('wrong');
          setTimeout(() => row.classList.remove('wrong'), 400);
        }
      };
      input.addEventListener('blur', doCheck);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doCheck(); } });
    });
    document.getElementById('resetDiv').addEventListener('click', () => {
      if (!confirm(t('settings.resetConfirm'))) return;
      delete progress.div.basic[level];
      saveProgress();
      renderDivBasicQuiz(level);
    });
  }

  // ---- 퍼센트 ----
  const PCT_GROUP_SIZE = 10;
  const PCT_SUPER_COUNT = 10;
  function pctGroupRange(superLv) {
    const start = (superLv - 1) * PCT_GROUP_SIZE + 1;
    const end = superLv * PCT_GROUP_SIZE;
    return { start, end };
  }

  function renderPct(v) {
    // ① 레벨 선택 (2개)
    if (v.name === 'home') {
      titleEl.textContent = t('tab.pct');
      const cards = [];
      for (let sl = 1; sl <= PCT_SUPER_COUNT; sl++) {
        const { start, end } = pctGroupRange(sl);
        let done = 0;
        for (let lv = start; lv <= end; lv++) if (pctFullyDone(lv)) done++;
        const pct = Math.round(done / PCT_GROUP_SIZE * 100);
        const complete = done === PCT_GROUP_SIZE;
        cards.push(`
          <div class="card ${complete ? 'complete' : ''}" data-sl="${sl}">
            <div class="label">${t('common.level')} ${sl}</div>
            <div class="sub">${t('common.group')} ${start} ~ ${end}</div>
            <div class="progress-bar"><span style="width:${pct}%"></span></div>
            <div class="sub">${done} / ${PCT_GROUP_SIZE}</div>
          </div>`);
      }
      app.innerHTML = `
        <div class="section-title">${t('common.selectLevel')}</div>
        <div class="level-grid">${cards.join('')}</div>`;
      app.querySelectorAll('.card').forEach(el => {
        el.addEventListener('click', () =>
          go({ tab: 'pct', name: 'groups', superLevel: +el.dataset.sl }));
      });
      return;
    }

    // ② 그룹 선택 (10개)
    if (v.name === 'groups') {
      const { start, end } = pctGroupRange(v.superLevel);
      titleEl.textContent = `${t('common.level')} ${v.superLevel}`;
      const cards = [];
      for (let lv = start; lv <= end; lv++) {
        const basic = pctLevelCount(lv);
        const applied = pctAppliedCount(lv);
        const fully = pctFullyDone(lv);
        const pct = Math.round((basic / PCT_BASIC_COUNT * 0.5 + Math.min(applied / PCT_APPLIED_GOAL, 1) * 0.5) * 100);
        cards.push(`
          <div class="card ${fully ? 'complete' : ''}" data-lv="${lv}">
            <div class="label">${t('common.group')} ${lv}</div>
            <div class="sub">${pctGroupDesc(lv)}</div>
            <div class="progress-bar"><span style="width:${pct}%"></span></div>
            <div class="sub">${basic}/${PCT_BASIC_COUNT}</div>
          </div>`);
      }
      app.innerHTML = `
        <div class="section-title">${t('common.group')} ${start} ~ ${end}</div>
        <div class="dan-grid">${cards.join('')}</div>`;
      app.querySelectorAll('.card').forEach(el => {
        el.addEventListener('click', () =>
          go({ tab: 'pct', name: 'groupMenu', level: +el.dataset.lv, superLevel: v.superLevel }));
      });
      return;
    }

    // ③ 기초/응용 선택
    if (v.name === 'groupMenu') {
      const lv = v.level;
      titleEl.textContent = `${t('common.group')} ${lv}`;
      const basicDone = pctLevelDone(lv);
      const basicCount = pctLevelCount(lv);
      const applied = pctAppliedCount(lv);
      app.innerHTML = `
        <div class="section-title">${pctGroupDesc(lv)}</div>
        <div class="stage-list">
          <div class="card stage-card ${basicDone ? 'complete' : ''}" data-stage="basic">
            <div class="label">${t('common.basic')}</div>
            <div class="progress-bar"><span style="width:${Math.round(basicCount/PCT_BASIC_COUNT*100)}%"></span></div>
            <div class="sub">${basicCount}/${PCT_BASIC_COUNT}</div>
          </div>
          <div class="card stage-card ${basicDone ? '' : 'locked'}" data-stage="applied">
            <div class="label">${t('common.applied')} ${basicDone ? '' : '🔒'}</div>
            <div class="sub">${t('common.correctCount')}: ${Math.min(applied, PCT_APPLIED_GOAL)}/${PCT_APPLIED_GOAL}</div>
          </div>
        </div>`;
      app.querySelectorAll('.stage-card').forEach(el => {
        el.addEventListener('click', () => {
          const s = el.dataset.stage;
          if (s === 'applied' && !basicDone) { alert(t('common.basicNotDone')); return; }
          go({ tab: 'pct', name: s === 'basic' ? 'basicQuiz' : 'appliedQuiz', level: lv, superLevel: v.superLevel });
        });
      });
      return;
    }

    if (v.name === 'basicQuiz') {
      renderPctBasicQuiz(v.level, v.superLevel);
      return;
    }
    if (v.name === 'appliedQuiz') {
      const lv = v.level;
      const sl = v.superLevel;
      renderRandomQuiz({
        title: `${t('common.group')} ${lv} · ${t('common.applied')}`,
        getCount: () => {
          const n = pctAppliedCount(lv);
          return `${Math.min(n, PCT_APPLIED_GOAL)}/${PCT_APPLIED_GOAL}` + (n > PCT_APPLIED_GOAL ? ` (+${n-PCT_APPLIED_GOAL})` : '');
        },
        getRaw: () => pctAppliedCount(lv),
        goal: PCT_APPLIED_GOAL,
        bump: () => {
          progress.pct.applied[lv] = progress.pct.applied[lv] || { correct: 0 };
          progress.pct.applied[lv].correct++;
          saveProgress();
        },
        gen: () => genPctAppliedRaw(lv),
        nextLabel: t('common.levelList'),
        onNext: () => {
          stack = [{ tab: 'pct', name: 'home' }, { tab: 'pct', name: 'groups', superLevel: sl }];
          render();
        },
        onReset: () => {
          delete progress.pct.applied[lv];
          saveProgress();
        },
      });
      return;
    }
  }

  function renderPctBasicQuiz(level, superLevel) {
    superLevel = superLevel || Math.ceil(level / PCT_GROUP_SIZE);
    const typeLabel = pctGroupDesc(level);
    titleEl.textContent = `${t('common.group')} ${level}`;
    const state = progress.pct.basic[level] || {};
    const probs = Array.from({ length: PCT_BASIC_COUNT }, (_, i) => genPctBasicProblem(level, i));
    const rows = probs.map((p, i) => {
      const correct = !!state[i];
      return `
        <div class="q-row ${correct ? 'correct' : ''}" data-idx="${i}">
          <span class="eq">${p.text}</span>
          <input class="answer-box" type="number" inputmode="decimal"
                 data-answer="${p.answer}" ${correct ? `value="${p.answer}" readonly` : ''} />
        </div>`;
    }).join('');
    const done = pctLevelCount(level);
    app.innerHTML = `
      <div class="dan-header">
        <h2>${t('common.group')} ${level}</h2>
        <div>
          <span class="count">${done}/${PCT_BASIC_COUNT}</span>
          <button class="reset-btn" id="resetPct">${t('common.reset')}</button>
        </div>
      </div>
      <div class="sub" style="margin-bottom:12px">${typeLabel}</div>
      <div class="q-list">${rows}</div>
      <div id="banner"></div>`;
    app.querySelectorAll('.q-row').forEach(row => {
      const input = row.querySelector('.answer-box');
      const expected = Number(input.dataset.answer);
      const doCheck = () => {
        if (!input.value) return;
        if (check(input.value, expected)) {
          row.classList.remove('wrong');
          row.classList.add('correct');
          input.setAttribute('readonly', '');
          input.value = expected;
          progress.pct.basic[level] = progress.pct.basic[level] || {};
          progress.pct.basic[level][+row.dataset.idx] = true;
          saveProgress();
          const newDone = pctLevelCount(level);
          const c = document.querySelector('.dan-header .count');
          if (c) c.textContent = `${newDone}/${PCT_BASIC_COUNT}`;
          if (newDone === PCT_BASIC_COUNT) {
            const banner = document.getElementById('banner');
            banner.innerHTML = `
              <button type="button" class="complete-banner banner-btn" id="goPctAppliedBtn">
                🎉 ${t('common.level')} ${level} ${t('common.basic')} ${t('common.perfect')} — ${t('common.levelList')} →
              </button>`;
            const b = document.getElementById('goPctAppliedBtn');
            const h = () => { stack = [{ tab: 'pct', name: 'home' }, { tab: 'pct', name: 'groups', superLevel }]; render(); };
            b.addEventListener('click', h);
            b.addEventListener('touchend', h);
          }
          const nx = findNextEmpty(row);
          if (nx) nx.focus();
        } else {
          row.classList.add('wrong');
          setTimeout(() => row.classList.remove('wrong'), 400);
        }
      };
      input.addEventListener('blur', doCheck);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doCheck(); } });
    });
    document.getElementById('resetPct').addEventListener('click', () => {
      if (!confirm(t('settings.resetConfirm'))) return;
      delete progress.pct.basic[level];
      saveProgress();
      renderPctBasicQuiz(level);
    });
  }

  // ---- 설정 ----
  function renderSettings() {
    titleEl.textContent = t('tab.settings');
    const lang = window.currentLang;
    const cur = currentProfile();
    const profiles = loadProfiles();
    const isGuest = cur.id === 'guest';

    const langOpts = [
      ['ko', '한국어'],
      ['zh', '中文'],
      ['en', 'English'],
    ].map(([code, name]) =>
      `<button class="lang-btn ${lang === code ? 'active' : ''}" data-lang="${code}">${name}</button>`
    ).join('');

    const profileList = profiles.map(p => `
      <div class="profile-row">
        <span>👤 ${escapeHtml(p.name)}${p.id === cur.id ? ' ✓' : ''}</span>
        <span class="profile-actions">
          ${p.id === cur.id ? '' : `<button class="reset-btn" data-switch="${p.id}">${t('settings.switchTo')}</button>`}
          <button class="reset-btn danger" data-remove="${p.id}">${t('settings.remove')}</button>
        </span>
      </div>`).join('');

    app.innerHTML = `
      <section class="settings-section">
        <h3>${t('settings.language')}</h3>
        <div class="lang-row">${langOpts}</div>
      </section>

      <section class="settings-section">
        <h3>${t('settings.profile')}</h3>
        <div class="sub">${t('settings.currentUser')}: <b>${escapeHtml(cur.name)}</b></div>

        ${isGuest ? `
          <div class="login-box">
            <div class="sub">${t('settings.loginHint')}</div>
            <input id="loginName" class="text-input" placeholder="${t('settings.nameLabel')}" />
            <button class="primary-btn" id="loginBtn">${t('settings.login')}</button>
          </div>
        ` : `
          <button class="primary-btn" id="logoutBtn">${t('settings.logout')}</button>
        `}

        ${profiles.length ? `
          <h4>${t('settings.savedProfiles')}</h4>
          <div class="profile-list">${profileList}</div>
        ` : ''}
      </section>

      <section class="settings-section">
        <button class="reset-btn danger" id="resetAll">${t('settings.reset')}</button>
      </section>
    `;

    app.querySelectorAll('.lang-btn').forEach(b =>
      b.addEventListener('click', () => setLang(b.dataset.lang))
    );
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      const nameInput = document.getElementById('loginName');
      const doLogin = () => { login(nameInput.value); render(); };
      loginBtn.addEventListener('click', doLogin);
      nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { logout(); render(); });

    app.querySelectorAll('[data-switch]').forEach(b =>
      b.addEventListener('click', () => { setCurrentProfile(b.dataset.switch); render(); })
    );
    app.querySelectorAll('[data-remove]').forEach(b =>
      b.addEventListener('click', () => {
        if (confirm(t('settings.remove') + '?')) { removeProfile(b.dataset.remove); render(); }
      })
    );

    document.getElementById('resetAll').addEventListener('click', () => {
      if (!confirm(t('settings.resetConfirm'))) return;
      resetProgress();
      render();
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  // ====== 부트 ======
  function boot() {
    try {
      const boot = document.getElementById('bootMsg');
      if (boot) boot.remove();
      applyStaticI18n();
      updateProfileChip();
      render();
      console.log('[GUMON] boot ok, lang=', window.currentLang, 'profile=', currentProfileId());
    } catch (err) {
      const el = document.getElementById('globalError');
      if (el) {
        el.style.display = 'block';
        el.textContent = '[Boot Error] ' + (err && err.stack ? err.stack : err);
      } else {
        document.body.innerHTML = '<pre style="color:#fca5a5;padding:20px">' + (err && err.stack ? err.stack : err) + '</pre>';
      }
      console.error(err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 개발 중: 기존 SW를 모두 해제하고 캐시 비움 (한 번 강제 청소)
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const FORCE_VERSION = 'v8-clean';
    const lastClean = localStorage.getItem('gumon.swClean');
    if (lastClean !== FORCE_VERSION) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        return Promise.all(regs.map(r => r.unregister()));
      }).then(() => {
        if (window.caches) {
          return caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
        }
      }).then(() => {
        localStorage.setItem('gumon.swClean', FORCE_VERSION);
        console.log('[GUMON] SW + caches cleaned, reloading...');
        location.reload();
      }).catch(e => console.warn('[GUMON] clean failed:', e));
    } else {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch((e) => {
          console.warn('[GUMON] SW register failed:', e);
        });
      });
    }
  }
})();
