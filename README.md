# 汉字寻踪

一个零依赖的汉字拆笔画小游戏原型，可直接作为 Telegram Mini App 的前端页面使用。

## 本地运行

```powershell
python -m http.server 5173 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:5173/
```

## 怎么接 Telegram Bot

1. 把本项目部署到支持 HTTPS 的静态站点。
2. 在 BotFather 里给 bot 设置 Web App / Menu Button。
3. URL 填部署后的 HTTPS 地址。
4. 用户从 Telegram 打开后，页面会自动调用 `Telegram.WebApp.ready()` 和 `expand()`。

## 关卡配置

关卡数据在 `src/levels.js`：

- `strokes`：每一笔的 SVG 路径。
- `answers`：答案字和需要选中的笔画 ID。
- `title` / `prompt`：关卡文案。

后续可以把 `levels.js` 换成接口返回，排行榜、用户分数、复活道具等再接后端。
