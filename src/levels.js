window.HANZI_LEVELS = [
  {
    title: "\u627e\u51fa5\u4e2a\u5e38\u7528\u5b57",
    prompt: "\u70b9\u51fb\u7b14\u753b\u7ec4\u5408\u51fa\u85cf\u5728\u91cc\u9762\u7684\u5b57",
    strokes: [
      { id: "top", d: "M72 78 C126 64, 202 61, 252 75", width: 24 },
      { id: "mid", d: "M88 160 C132 151, 204 149, 242 161", width: 22 },
      { id: "bottom", d: "M52 259 C116 244, 215 242, 278 255", width: 26 },
      { id: "vert", d: "M159 76 C154 125, 154 198, 160 259", width: 24 }
    ],
    answers: [
      { char: "\u4e00", strokes: ["top"] },
      { char: "\u4e8c", strokes: ["top", "mid"] },
      { char: "\u4e09", strokes: ["top", "mid", "bottom"] },
      { char: "\u5341", strokes: ["mid", "vert"] },
      { char: "\u738b", strokes: ["top", "mid", "bottom", "vert"] }
    ]
  },
  {
    title: "\u770b\u61c2\u65b9\u5757\u91cc\u7684\u7ed3\u6784",
    prompt: "\u6709\u4e9b\u5b57\u85cf\u5728\u5c40\u90e8\u7ed3\u6784\u91cc\uff0c\u8bd5\u7740\u7ec4\u5408\u6a2a\u7ad6",
    strokes: [
      { id: "left", d: "M104 80 C102 133, 101 204, 106 258", width: 22 },
      { id: "top", d: "M108 82 C151 72, 205 72, 245 84", width: 22 },
      { id: "right", d: "M243 84 C238 132, 235 201, 240 257", width: 22 },
      { id: "bottom", d: "M107 258 C148 250, 203 249, 240 257", width: 22 },
      { id: "mid", d: "M109 169 C149 161, 202 160, 238 168", width: 20 }
    ],
    answers: [
      { char: "\u4e00", strokes: ["top"] },
      { char: "\u4e8c", strokes: ["top", "mid"] },
      { char: "\u53e3", strokes: ["left", "top", "right", "bottom"] },
      { char: "\u65e5", strokes: ["left", "top", "right", "bottom", "mid"] },
      { char: "\u4e28", strokes: ["left"] }
    ]
  },
  {
    title: "\u4ece\u6811\u5f62\u7b14\u753b\u91cc\u627e\u7b54\u6848",
    prompt: "\u8fd9\u4e00\u5173\u66f4\u50cf\u62c6\u5b57\uff0c\u9009\u4e2d\u7b14\u753b\u4f1a\u81ea\u52a8\u5224\u65ad",
    strokes: [
      { id: "h1", d: "M82 94 C127 82, 198 82, 242 96", width: 22 },
      { id: "v1", d: "M164 63 C159 116, 159 173, 164 224", width: 22 },
      { id: "h2", d: "M96 168 C139 158, 196 158, 232 170", width: 20 },
      { id: "leftSlash", d: "M142 223 C119 249, 94 269, 62 286", width: 22 },
      { id: "rightSlash", d: "M184 222 C208 250, 232 270, 264 286", width: 22 }
    ],
    answers: [
      { char: "\u4e00", strokes: ["h1"] },
      { char: "\u5341", strokes: ["h1", "v1"] },
      { char: "\u58eb", strokes: ["h1", "v1", "h2"] },
      { char: "\u6728", strokes: ["h1", "v1", "leftSlash", "rightSlash"] },
      { char: "\u672a", strokes: ["h1", "v1", "h2", "leftSlash", "rightSlash"] }
    ]
  },
  {
    title: "\u4ece\u4eba\u5b57\u5f62\u91cc\u627e\u5e38\u7528\u5b57",
    prompt: "\u4e0d\u53ea\u770b\u6574\u4f53\uff0c\u4e5f\u8981\u7559\u610f\u4e24\u4e09\u7b14\u7684\u5c0f\u7ec4\u5408",
    strokes: [
      { id: "slashLeft", d: "M163 60 C149 113, 118 186, 62 266", width: 24 },
      { id: "slashRight", d: "M165 62 C188 119, 226 197, 270 266", width: 24 },
      { id: "cross", d: "M106 174 C143 163, 193 164, 228 176", width: 20 },
      { id: "shortLeft", d: "M132 210 C118 226, 101 240, 82 252", width: 18 },
      { id: "shortRight", d: "M201 210 C218 226, 238 241, 258 252", width: 18 }
    ],
    answers: [
      { char: "\u4eba", strokes: ["slashLeft", "slashRight"] },
      { char: "\u516b", strokes: ["shortLeft", "shortRight"] },
      { char: "\u5927", strokes: ["slashLeft", "slashRight", "cross"] },
      { char: "\u6728", strokes: ["slashLeft", "slashRight", "cross", "shortLeft", "shortRight"] },
      { char: "\u4e00", strokes: ["cross"] }
    ]
  },
  {
    title: "\u6700\u540e\u4e00\u7ec4\u8bd5\u70bc",
    prompt: "\u627e\u5230\u5168\u90e8\u7b54\u6848\u540e\u63d0\u4ea4\uff0c\u7cfb\u7edf\u4f1a\u7edf\u8ba1\u603b\u5206",
    strokes: [
      { id: "roof", d: "M96 91 C145 78, 204 78, 251 92", width: 21 },
      { id: "leftWall", d: "M108 92 C103 133, 102 190, 107 242", width: 20 },
      { id: "rightWall", d: "M244 94 C239 134, 238 190, 243 242", width: 20 },
      { id: "floor", d: "M108 242 C146 234, 202 234, 244 243", width: 21 },
      { id: "centerV", d: "M176 90 C171 134, 171 201, 176 242", width: 18 },
      { id: "centerH", d: "M109 167 C147 159, 203 159, 240 168", width: 18 }
    ],
    answers: [
      { char: "\u4e00", strokes: ["roof"] },
      { char: "\u5341", strokes: ["centerH", "centerV"] },
      { char: "\u53e3", strokes: ["roof", "leftWall", "rightWall", "floor"] },
      { char: "\u7530", strokes: ["roof", "leftWall", "rightWall", "floor", "centerV", "centerH"] },
      { char: "\u65e5", strokes: ["roof", "leftWall", "rightWall", "floor", "centerH"] }
    ]
  }
];
