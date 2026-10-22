/* ============================================================
   V11 STAGE / component metadata
   All dimensions in millimetres, derived from the V11 assembly
   manifest and machining notes bundled with the source model.
   ============================================================ */

export const MODEL = {
  name: 'V11 不锈钢舞台',
  en: 'V11 STAINLESS STAGE',
  diameter: '241.82',
  height: '142.60',
  disc: '200',
  customTypes: 45,
  customPieces: 136,
  hardwareTypes: 10,
  hardwarePieces: 325,
  total: 461,
  material: '304 不锈钢',
  finish: '拉丝 / 香槟金 / 双面蓝膜'
};

export const GROUPS = [
  {
    id: 'base',
    index: '01',
    code: 'B01 · B02',
    name: '底座系统',
    en: 'BASE PLATFORM',
    count: 60,
    custom: 12,
    hardware: 48,
    accent: '#5fd8ff',
    anchor: [-0.095, 0.008, 0.048],
    tag: '结构',
    summary: '四块 2.0mm 底座板拼合成 Ø200mm 圆盘，底面以 8 片拼接板和 16 套 M2×6 紧固件锁合，是整个舞台的基准层。',
    specs: [
      ['外径', 'Ø215.6 mm'],
      ['板厚', '2.0 / 1.5 mm'],
      ['拼缝', '0.20 mm'],
      ['紧固', 'M2×6 × 16']
    ],
    detail: 'B01 四块板以 0.20mm 等宽拼缝就位，每道拼缝下方布置两片 B02，分别位于半径 40mm 与 80mm。先轻拧 16 套 M2×6，让拼缝均匀后再统一锁紧。',
    assembly: '底座拼合 → 底面拼接片 → 均匀锁紧',
    partCodes: ['B01', 'B02', 'H_M2x6_PAN', 'H_NUT_M2', 'H_WASHER_M2']
  },
  {
    id: 'columns',
    index: '02',
    code: 'C01 · C02 · M3',
    name: '边缘立柱',
    en: 'PERIMETER COLUMNS',
    count: 20,
    custom: 8,
    hardware: 12,
    accent: '#8ec9ff',
    anchor: [0.112, 0.091, -0.112],
    tag: '结构',
    summary: '四根 Ø5×Ø3.4×128mm 不锈钢管位于 Ø203.2mm 分度圆，M3×140 螺杆穿过柱管，将顶部骨架与底座连成整体。',
    specs: [
      ['柱管', 'Ø5 / Ø3.4 × 128'],
      ['分度圆', 'Ø203.2 mm'],
      ['螺杆', 'M3 × 140'],
      ['外露', '133.5 mm']
    ],
    detail: 'C01 脚座贯通攻 M3×0.5，螺杆旋入 4.5mm；柱管套在螺杆之外。顶部使用 M3 垫圈与螺母夹紧，四柱保持平行。',
    assembly: '脚座攻牙 → 穿入螺杆 → 套柱管 → 顶部夹紧',
    partCodes: ['C01', 'C02', 'H_STUD_M3_L140', 'H_NUT_M3', 'H_WASHER_M3']
  },
  {
    id: 'deck',
    index: '03',
    code: 'F01–F04 · B03',
    name: '地台面板',
    en: 'DECK PANELS',
    count: 36,
    custom: 12,
    hardware: 24,
    accent: '#6aa8ff',
    anchor: [0.082, 0.013, 0.034],
    tag: '结构',
    summary: '四块 1.5mm 四分之一面板错缝铺在底座上，由 8 个 4mm 隔套抬起，形成主要表演平面。',
    specs: [
      ['外径', 'Ø188 mm'],
      ['板厚', '1.5 mm'],
      ['隔套', '4 mm × 8'],
      ['紧固', 'M2×10 × 8']
    ],
    detail: '8 个 B03 隔套位于底座与面板之间，形成 4mm 空腔。M2×10 从面板上表面穿入，螺母在底座下方锁紧。',
    assembly: '放置隔套 → 四块面板就位 → 底部螺母锁紧',
    partCodes: ['F01', 'F02', 'F03', 'F04', 'B03', 'H_M2x10_PAN', 'H_NUT_M2', 'H_WASHER_M2']
  },
  {
    id: 'inlay',
    index: '04',
    code: 'F11–F14',
    name: '曲线装饰区',
    en: 'CURVED INLAYS',
    count: 28,
    custom: 4,
    hardware: 24,
    accent: '#f0c67d',
    anchor: [-0.077, 0.016, 0.071],
    tag: '装饰',
    summary: '0.8mm 香槟金曲线嵌片贴合在地台面板上表面，形成四段流动的轮廓线，同时避开地台支撑螺钉头。',
    specs: [
      ['板厚', '0.8 mm'],
      ['数量', '4 片'],
      ['紧固', 'M2×6 × 8'],
      ['避让', 'Ø4.4 mm']
    ],
    detail: '每块曲线装饰片使用两套 M2×6 固定。嵌片在支撑螺钉头经过的位置预留 Ø4.4mm 避让孔，贴面不高于面板轮廓。',
    assembly: '面板预装 → 曲线片贴合 → 底面螺母锁紧',
    partCodes: ['F11', 'F12', 'F13', 'F14', 'H_M2x6_PAN', 'H_NUT_M2', 'H_WASHER_M2']
  },
  {
    id: 'platform',
    index: '05',
    code: 'F05 · F06',
    name: '中央平台',
    en: 'CENTER STAGE',
    count: 13,
    custom: 4,
    hardware: 9,
    accent: '#f2ba66',
    anchor: [0.002, 0.019, 0.034],
    tag: '功能',
    summary: 'Ø62.6mm 香槟金中央圆台与圆屏严格同轴，通过 3 个 2mm 隔套抬升，3 套 M2×8 沉头螺钉从上表面齐平固定。',
    specs: [
      ['直径', 'Ø62.6 mm'],
      ['板厚', '1.5 mm'],
      ['隔套', '2 mm × 3'],
      ['沉头', '90° / 齐平']
    ],
    detail: '中央平台与中央圆屏共用 (0,0) 轴线。3 个 F06 隔套位于平台下方，M2×8 90° 沉头螺钉从上方穿入，顶面不允许凸出。',
    assembly: '隔套定位 → 平台落位 → 沉头螺钉齐平锁紧',
    partCodes: ['F05', 'F06', 'H_M2x8_CSK', 'H_NUT_M2', 'H_WASHER_M2']
  },
  {
    id: 'numerals',
    index: '06',
    code: 'N01–N13',
    name: '罗马数字',
    en: 'ROMAN NUMERALS',
    count: 108,
    custom: 36,
    hardware: 72,
    accent: '#ffd489',
    anchor: [0.0, 0.012, -0.118],
    tag: '装饰',
    summary: '十二组 1.0mm 香槟金罗马数字环绕底座外缘，每组含外圈弧段与连接臂。外廓直径达到 241.82mm。',
    specs: [
      ['板厚', '1.0 mm'],
      ['组数', '12 组'],
      ['安装半径', '96.3 mm'],
      ['紧固', 'M2×10 × 24']
    ],
    detail: 'N01–N12 对应 XII 至 XI，每件通过 2 个 3mm 隔套和 2 套 M2×10 固定。四个正方向预留柱管避让缺口。',
    assembly: '数字片就位 → 3mm 隔套 → 底座下方螺母锁紧',
    partCodes: ['N01', 'N02', 'N03', 'N04', 'N05', 'N06', 'N07', 'N08', 'N09', 'N10', 'N11', 'N12', 'N13', 'H_M2x10_PAN', 'H_NUT_M2', 'H_WASHER_M2']
  },
  {
    id: 'roof',
    index: '07',
    code: 'R01 · R02',
    name: '顶部骨架',
    en: 'ROOF FRAME',
    count: 88,
    custom: 16,
    hardware: 72,
    accent: '#78a9ff',
    anchor: [-0.079, 0.143, -0.053],
    tag: '结构',
    summary: '四块 1.5mm 板式骨架拼成三圈圆环与径向梁，12 片 R02 拼接片位于圆环上方，为 8 块双面屏提供悬挂槽位。',
    specs: [
      ['外径', 'Ø213.2 mm'],
      ['板厚', '1.5 mm'],
      ['圆环', '3 圈'],
      ['拼接片', '12 片']
    ],
    detail: '四块 R01 以 90° 拼接，每道拼缝在半径 41、68、101.6mm 各放一片 R02。24 套 M2×6 从上方穿入，螺母位于下方。',
    assembly: '四块 R01 拼接 → 12 片 R02 加强 → 统一锁紧',
    partCodes: ['R01', 'R02', 'H_M2x6_PAN', 'H_NUT_M2', 'H_WASHER_M2']
  },
  {
    id: 'screens',
    index: '08',
    code: 'P01–P11',
    name: '双面屏',
    en: 'DUAL-SIDED SCREENS',
    count: 56,
    custom: 32,
    hardware: 24,
    accent: '#3f9cff',
    anchor: [0.083, 0.105, 0.081],
    tag: '显示',
    summary: '8 块 1.0mm 双面屏按 45° 径向布置，不同高度形成错落轮廓。一体 T 形挂耳先上插，再外移 3.8mm 落座。',
    specs: [
      ['屏板', '1.0 mm'],
      ['数量', '8 块'],
      ['角度', '45° 等分'],
      ['外移', '3.8 mm']
    ],
    detail: '屏幕比最终位置向内 3.8mm 上插，T 头穿过顶部槽后向外推落座。P09 下止退片、P11 隔套和 P10 上压盖由一套 M2×8 同时夹紧。',
    assembly: '内收 3.8mm 上插 → 外推落座 → 止退片 / 压盖锁紧',
    partCodes: ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10', 'P11', 'H_M2x8_PAN', 'H_NUT_M2', 'H_WASHER_M2']
  },
  {
    id: 'drum',
    index: '09',
    code: 'D01–D05',
    name: '中央圆屏',
    en: 'CORE DRUM',
    count: 52,
    custom: 12,
    hardware: 40,
    accent: '#70e6ee',
    anchor: [0.0, 0.091, -0.003],
    tag: '显示',
    summary: 'Ø60mm 中央圆屏由两片 0.8mm 卷圆半壳、上端环和下端盘组成，8 根 M2 螺杆从顶部悬挂，内缘半径 31mm。',
    specs: [
      ['外径', 'Ø60 mm'],
      ['壳体', '0.8 mm 卷圆'],
      ['主体高', '44 mm'],
      ['悬挂', 'M2×65 × 8']
    ],
    detail: 'D01 两片半壳的上下插舌分别进入 D02 端环与 D03 端盘弧槽，两条竖缝各留 0.30mm。8 根螺杆配 11.5mm 隔套，上下螺母均匀夹紧。',
    assembly: '倒置骨架 → 穿螺杆 → 端环 / 卷圆壳 / 端盘 → 对称夹紧',
    partCodes: ['D01', 'D02', 'D03', 'D05', 'H_STUD_M2_L65', 'H_NUT_M2', 'H_WASHER_M2']
  }
];

/* ------------------------------------------------------------ */

const screenSpecs = [
  ['P01', 'E', '东', 0, 69.484],
  ['P02', 'NE', '东北', 45, 79.812],
  ['P03', 'N', '北', 90, 64.789],
  ['P04', 'NW', '西北', 135, 76.995],
  ['P05', 'W', '西', 180, 67.136],
  ['P06', 'SW', '西南', 225, 74.178],
  ['P07', 'S', '南', 270, 70.423],
  ['P08', 'SE', '东南', 315, 77.934]
];

const romanSpecs = [
  ['N01', 'XII'], ['N02', 'I'], ['N03', 'II'], ['N04', 'III'],
  ['N05', 'IV'], ['N06', 'V'], ['N07', 'VI'], ['N08', 'VII'],
  ['N09', 'VIII'], ['N10', 'IX'], ['N11', 'X'], ['N12', 'XI']
];

const customParts = {
  B01: {
    name: '底座四分之一板', en: 'BASE QUARTER', group: 'base', cat: 'structure', qty: 4,
    material: '304 不锈钢', form: '2.0 mm 板', process: '激光切割',
    position: 'Z 2.0–4.0 mm，四等分',
    desc: '四块 B01 拼成 Ø200mm 底座圆盘。外缘与脚座、罗马数字连接，拼缝控制为 0.20mm。'
  },
  B02: {
    name: '底座底面拼接片', en: 'BASE SPLICE', group: 'base', cat: 'structure', qty: 8,
    material: '304 不锈钢', form: '1.5 mm 板', process: '激光切割',
    position: '半径 40 / 80 mm，底面',
    desc: '每道底座拼缝下方两片，跨缝连接。每片以两套 M2×6、垫圈及螺母锁合。'
  },
  C01: {
    name: 'M3 内螺纹脚座', en: 'TAPPED FOOT', group: 'columns', cat: 'structure', qty: 4,
    material: '304 不锈钢', form: 'Ø12.4 × 6 mm', process: '车削 + M3×0.5 贯通攻牙',
    position: '底座四角，分度圆 Ø203.2',
    desc: '贯通攻 M3×0.5，螺杆旋入深度 4.5mm。实际底孔与攻牙由厂家按丝锥工艺确定。'
  },
  C02: {
    name: '舞台边缘立柱管', en: 'COLUMN TUBE', group: 'columns', cat: 'structure', qty: 4,
    material: '304 不锈钢管', form: 'Ø5 × Ø3.4 × 128 mm', process: '切管 + 端面加工',
    position: '四角，Z 8–136 mm',
    desc: 'M3×140 螺杆从柱管内部穿过，柱管位于底座与顶部骨架之间，形成无中心支撑的开放表演区。'
  },
  B03: {
    name: '地台 4mm 隔套', en: 'DECK SPACER', group: 'deck', cat: 'structure', qty: 8,
    material: '304 不锈钢管', form: 'L 4 mm', process: '切管 + 端面加工',
    position: '底座与地台面板之间',
    desc: '八个隔套把地台面板抬升 4mm，形成底面螺母操作空间与板缝层次。'
  },
  N13: {
    name: '罗马数字 3mm 隔套', en: 'NUMERAL SPACER', group: 'numerals', cat: 'structure', qty: 24,
    material: '304 不锈钢管', form: 'L 3 mm', process: '切管 + 端面加工',
    position: '数字片与底座之间',
    desc: '十二组数字各两件，让 1.0mm 数字片与底座间保留 3mm 间距。'
  },
  F06: {
    name: '中央平台 2mm 隔套', en: 'CENTER SPACER', group: 'platform', cat: 'structure', qty: 3,
    material: '304 不锈钢管', form: 'L 2 mm', process: '切管 + 端面加工',
    position: '中央平台下方，120° 分布',
    desc: '三点支撑中央平台，使 1.5mm 平台板与地台面板之间保留均匀间隙。'
  },
  D05: {
    name: '圆屏悬挂 11.5mm 隔套', en: 'DRUM SPACER', group: 'drum', cat: 'structure', qty: 8,
    material: '304 不锈钢管', form: 'Ø4 / Ø2.4 × 11.5 mm', process: '切管 + 端面加工',
    position: '圆屏顶部，8×45°',
    desc: '套在 M2×65 螺杆上，在顶部骨架与圆屏端环之间形成 11.5mm 悬挂间距。'
  },
  F05: {
    name: '中央圆形平台', en: 'CENTER PLATFORM', group: 'platform', cat: 'function', qty: 1,
    material: '304 不锈钢', form: 'Ø62.6 × 1.5 mm', process: '激光切割 + 香槟金表面',
    position: 'Z 15.5–17.0 mm，与圆屏同轴',
    desc: '舞台视觉中心。3 套 M2×8 90° 沉头螺钉从上表面固定，顶面必须齐平。'
  },
  R01: {
    name: '顶部骨架四分之一板', en: 'ROOF QUARTER', group: 'roof', cat: 'structure', qty: 4,
    material: '304 不锈钢', form: '1.5 mm 板', process: '激光切割',
    position: 'Z 136–137.5 mm，四等分',
    desc: '三圈圆环与径向梁一体切割，四块拼合成完整顶部骨架，为屏幕挂耳提供槽位。'
  },
  R02: {
    name: '顶部圆环拼接片', en: 'ROOF SPLICE', group: 'roof', cat: 'structure', qty: 12,
    material: '304 不锈钢', form: '1.5 mm 板', process: '激光切割',
    position: '半径 41 / 68 / 101.6 mm，上表面',
    desc: '每道 90° 拼缝三片，分别加强三圈圆环。拼接片位于圆环上方，螺母在下方。'
  },
  P09: {
    name: '屏幕下止退片', en: 'SCREEN LOCK', group: 'screens', cat: 'screen', qty: 8,
    material: '304 不锈钢', form: '1.0 mm 板', process: '激光切割',
    position: '屏幕 T 头内侧，间隙 0.30 mm',
    desc: '安装在 T 形挂耳内侧，限制屏幕向后退出。止退后仍保留 1.0mm 挂钩重叠。'
  },
  P10: {
    name: '挂屏上压盖', en: 'RETAINING CAP', group: 'screens', cat: 'screen', qty: 8,
    material: '304 不锈钢', form: '1.0 mm 板', process: '激光切割',
    position: 'T 头顶面上方，间隙 0.50 mm',
    desc: '压在 T 形头上方，限制屏幕上抬。与 P09、P11 共用一套 M2×8 紧固。'
  },
  P11: {
    name: '压盖 1.5mm 隔套', en: 'CAP COLLAR', group: 'screens', cat: 'screen', qty: 8,
    material: '304 不锈钢管', form: 'L 1.5 mm', process: '切管 + 端面加工',
    position: 'P09 与 P10 之间',
    desc: '精确控制下止退片与上压盖之间的夹紧高度，同时让一套螺钉完成双向限位。'
  },
  D01: {
    name: '中央圆屏卷圆半壳', en: 'ROLLED HALF SHELL', group: 'drum', cat: 'screen', qty: 2,
    material: '304 不锈钢', form: '0.8 mm 卷圆，R27.1 / R27.9', process: '激光切割 + 卷圆',
    position: '主体高 44 mm，上下各 4 插舌',
    desc: '两片半壳卷成 Ø60 圆屏，上下插舌伸入端环与端盘弧槽。两条竖缝各留 0.30mm。'
  },
  D02: {
    name: '圆屏上端环', en: 'DRUM TOP RING', group: 'drum', cat: 'screen', qty: 1,
    material: '304 不锈钢', form: 'Ø60 × 1.5 mm', process: '激光切割',
    position: 'Z 123–124.5 mm',
    desc: '上端环设有弧槽，承接 D01 上半部 4 个插舌，并通过 8 根 M2 螺杆悬挂。'
  },
  D03: {
    name: '圆屏下端盘', en: 'DRUM BOTTOM DISC', group: 'drum', cat: 'screen', qty: 1,
    material: '304 不锈钢', form: 'Ø60 × 1.5 mm', process: '激光切割',
    position: 'Z 77.5–79 mm',
    desc: '圆屏底部端盘，弧槽承接 D01 下半部插舌，与上端环共同保持卷圆壳圆度。'
  }
};

for (const [code, suffix, dir, angle, bottom] of screenSpecs) {
  customParts[code] = {
    name: `双面屏 ${dir}`, en: `SCREEN ${suffix}`, group: 'screens', cat: 'screen', qty: 1,
    material: '304 不锈钢 + 双面蓝膜', form: '1.0 mm 板 / 宽 33.8 mm', process: '激光切割 + 折弯挂耳',
    position: `${dir}向 ${angle}°，屏底 Z ${bottom.toFixed(3)} mm`,
    desc: `屏幕主体底部位于 Z ${bottom.toFixed(3)}mm，两个一体 T 形挂耳上插后外移 3.8mm 落座。蓝色展示面可双面使用。`
  };
}

for (const [code, roman] of romanSpecs) {
  customParts[code] = {
    name: `罗马数字 ${roman}`, en: `ROMAN ${roman}`, group: 'numerals', cat: 'decor', qty: 1,
    material: '304 不锈钢 + 香槟金', form: '1.0 mm 板', process: '激光切割',
    position: '外缘 96.3mm 半径，2×3mm 隔套',
    desc: `${roman} 含外圈弧段与连接臂一体切割。两套 M2×10 经 3mm 隔套固定，四个正方向预留柱管避让缺口。`
  };
}

for (let i = 1; i <= 4; i++) {
  customParts[`F0${i}`] = {
    name: `地台面板 F0${i}`, en: `DECK QUARTER 0${i}`, group: 'deck', cat: 'structure', qty: 1,
    material: '304 不锈钢', form: '1.5 mm 板', process: '激光切割',
    position: `第 ${i} 象限，Z 10.5–12 mm`,
    desc: '四分之一地台面板，与相邻面板错缝拼接。由 4mm 隔套支撑，两处 M2×10 固定。'
  };
  customParts[`F1${i}`] = {
    name: `曲线地台装饰区 F1${i}`, en: `CURVED INLAY 0${i}`, group: 'inlay', cat: 'decor', qty: 1,
    material: '304 不锈钢 + 香槟金', form: '0.8 mm 板', process: '激光切割',
    position: `第 ${i} 象限，地台面板上表面`,
    desc: '曲线装饰嵌片，两端各一套 M2×6 固定。在支撑螺钉头位置预留 Ø4.4mm 避让孔。'
  };
}

const hardwareParts = {
  H_M2x6_PAN: {
    name: 'M2×6 盘头螺钉', en: 'M2 × 6 PAN HEAD', group: 'hardware', cat: 'fastener', qty: 48,
    material: '不锈钢', form: 'M2 × 6，头径 ≤4 mm', process: '采购标准件',
    position: '底座拼接 / 曲线装饰 / 顶部骨架',
    desc: '盘头高度不超过 1.6mm。用于 B01/B02、F11–F14 和 R01/R02 的连接。'
  },
  H_M2x8_PAN: {
    name: 'M2×8 盘头螺钉', en: 'M2 × 8 PAN HEAD', group: 'hardware', cat: 'fastener', qty: 8,
    material: '不锈钢', form: 'M2 × 8，头径 ≤4 mm', process: '采购标准件',
    position: '八块双面屏止退组件',
    desc: '一套螺钉同时穿过 P10 压盖、P11 隔套与 P09 止退片，下方配垫圈与螺母。'
  },
  H_M2x10_PAN: {
    name: 'M2×10 盘头螺钉', en: 'M2 × 10 PAN HEAD', group: 'hardware', cat: 'fastener', qty: 32,
    material: '不锈钢', form: 'M2 × 10，头径 ≤4 mm', process: '采购标准件',
    position: '地台面板 8 + 罗马数字 24',
    desc: '地台面板穿过 B03 隔套固定；罗马数字穿过 N13 隔套固定，螺母均在底座下方。'
  },
  H_M2x8_CSK: {
    name: 'M2×8 90° 沉头螺钉', en: 'M2 × 8 COUNTERSUNK', group: 'hardware', cat: 'fastener', qty: 3,
    material: '不锈钢', form: 'M2 × 8，90° / 头径 ≤4 mm', process: '采购标准件',
    position: '中央平台，120° 分布',
    desc: '沉头与平台上表面齐平。沉孔顶径 4mm，按实际采购螺钉配作。'
  },
  H_NUT_M2: {
    name: 'M2 六角螺母', en: 'M2 HEX NUT', group: 'hardware', cat: 'fastener', qty: 107,
    material: '不锈钢', form: 'M2 标准六角', process: '采购标准件',
    position: '全舞台 M2 连接处',
    desc: '共 107 件。地台、数字、底座等位置的螺母多位于底座下方，便于开放操作。'
  },
  H_NUT_M3: {
    name: 'M3 六角螺母', en: 'M3 HEX NUT', group: 'hardware', cat: 'fastener', qty: 4,
    material: '不锈钢', form: 'M3 标准六角', process: '采购标准件',
    position: '四根立柱顶部',
    desc: '与 M3 垫圈配合，夹紧顶部骨架，完成四柱最终锁紧。'
  },
  H_WASHER_M2: {
    name: 'M2 垫圈', en: 'M2 WASHER', group: 'hardware', cat: 'fastener', qty: 107,
    material: '不锈钢', form: '5 / 2.4 / 0.3 mm', process: '采购标准件',
    position: '全舞台 M2 连接处',
    desc: '外径 5mm、内径 2.4mm、厚 0.3mm，与 M2 螺母成对使用。'
  },
  H_WASHER_M3: {
    name: 'M3 垫圈', en: 'M3 WASHER', group: 'hardware', cat: 'fastener', qty: 4,
    material: '不锈钢', form: '7 / 3.4 / 0.5 mm', process: '采购标准件',
    position: '四根立柱顶部',
    desc: '外径 7mm、内径 3.4mm、厚 0.5mm，位于立柱顶部螺母下方。'
  },
  H_STUD_M3_L140: {
    name: 'M3 双头螺杆', en: 'M3 STUD L140', group: 'hardware', cat: 'fastener', qty: 4,
    material: '不锈钢', form: 'M3 × 140 mm', process: '采购 / 切断 + 倒钝',
    position: '四根立柱内部',
    desc: '旋入 C01 脚座 4.5mm，底座上表面以上名义外露 133.5mm。切口需倒钝。'
  },
  H_STUD_M2_L65: {
    name: 'M2 双头螺杆', en: 'M2 STUD L65', group: 'hardware', cat: 'fastener', qty: 8,
    material: '不锈钢', form: 'M2 × 0.4 × 65 mm', process: '采购 / 切断 + 倒钝',
    position: '中央圆屏顶部，8×45°',
    desc: '穿过顶部骨架与圆屏端环，配 D05 隔套和上下螺母垫圈，均匀夹紧。'
  }
};

export const PART_TYPES = { ...customParts, ...hardwareParts };

export const PART_ORDER = [
  ...['B01', 'B02', 'C01', 'C02', 'B03', 'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'N13', 'D05'],
  ...romanSpecs.map(([code]) => code),
  ...screenSpecs.map(([code]) => code),
  ...['P09', 'P10', 'P11'],
  ...['R01', 'R02', 'D01', 'D02', 'D03', 'F11', 'F12', 'F13', 'F14'],
  ...Object.keys(hardwareParts)
];

export const CATEGORY_LABELS = {
  all: '全部',
  structure: '结构',
  screen: '显示',
  decor: '装饰',
  fastener: '紧固件',
  function: '功能'
};
