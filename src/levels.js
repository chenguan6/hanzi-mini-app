window.HANZI_LEVELS = [
  {
    title: "找出5个常用字",
    prompt: "点击文字中的笔画，找出隐藏其中的文字",
    strokes: [
      { id: "top", d: "M72 78 C126 64, 202 61, 252 75", width: 24 },
      { id: "mid", d: "M88 160 C132 151, 204 149, 242 161", width: 22 },
      { id: "bottom", d: "M52 259 C116 244, 215 242, 278 255", width: 26 },
      { id: "vert", d: "M159 76 C154 125, 154 198, 160 259", width: 24 }
    ],
    answers: [
      { char: "一", strokes: ["top"] },
      { char: "二", strokes: ["top", "mid"] },
      { char: "三", strokes: ["top", "mid", "bottom"] },
      { char: "十", strokes: ["mid", "vert"] },
      { char: "王", strokes: ["top", "mid", "bottom", "vert"] }
    ]
  },
  {
    title: "找出5个常用字",
    prompt: "有些字藏在局部结构里，试着组合横竖撇捺",
    strokes: [
      { id: "left", d: "M104 80 C102 133, 101 204, 106 258", width: 22 },
      { id: "top", d: "M108 82 C151 72, 205 72, 245 84", width: 22 },
      { id: "right", d: "M243 84 C238 132, 235 201, 240 257", width: 22 },
      { id: "bottom", d: "M107 258 C148 250, 203 249, 240 257", width: 22 },
      { id: "mid", d: "M109 169 C149 161, 202 160, 238 168", width: 20 }
    ],
    answers: [
      { char: "一", strokes: ["top"] },
      { char: "二", strokes: ["top", "mid"] },
      { char: "口", strokes: ["left", "top", "right", "bottom"] },
      { char: "日", strokes: ["left", "top", "right", "bottom", "mid"] },
      { char: "丨", strokes: ["left"] }
    ]
  },
  {
    title: "找出5个常用字",
    prompt: "这一关更像拆字，选中的笔画会自动判断答案",
    strokes: [
      { id: "h1", d: "M82 94 C127 82, 198 82, 242 96", width: 22 },
      { id: "v1", d: "M164 63 C159 116, 159 173, 164 224", width: 22 },
      { id: "h2", d: "M96 168 C139 158, 196 158, 232 170", width: 20 },
      { id: "leftSlash", d: "M142 223 C119 249, 94 269, 62 286", width: 22 },
      { id: "rightSlash", d: "M184 222 C208 250, 232 270, 264 286", width: 22 }
    ],
    answers: [
      { char: "一", strokes: ["h1"] },
      { char: "十", strokes: ["h1", "v1"] },
      { char: "士", strokes: ["h1", "v1", "h2"] },
      { char: "木", strokes: ["h1", "v1", "leftSlash", "rightSlash"] },
      { char: "未", strokes: ["h1", "v1", "h2", "leftSlash", "rightSlash"] }
    ]
  }
];
