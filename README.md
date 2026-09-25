# 李健 · 音乐与时间档案馆

非官方网站 / Unofficial Fan Archive。一个围绕音乐、时间、巡演和影像的个人收藏网站。

## 内容与功能

- 人物履历、时间线、公开访谈与人物札记
- 专辑曲目、单曲、合作作品、节目与荣誉记录
- 粉丝整理的演出歌单与歌曲用于影视、舞台、机构项目的记录，可按类型和关键词检索
- 四张巡演主题视觉、城市地图、场次筛选、同城多场及歌单
- 「万物安生时」前 26 场按场次排序的摄影档案
- 「文字」栏目的 30 页李健文字图文阅读室，支持主题跳转、选页、逐页浏览和放大原图
- 页面资料来源和素材说明统一收录在底部「出处与收藏」

## 技术与目录

当前版本是 **HTML + CSS + 原生 JavaScript 的静态网站**，不需要 Next.js 或安装构建依赖。音乐档案数据随网页静态发布；留言功能另由 Supabase 保存和审核。

```text
site/
  index.html                 # 页面、样式、交互与档案数据
  fan-music.js               # 音乐资料筛选与展示
  fan-research.js            # 粉丝整理资料展示
  song-links.js              # 曲目检索与 QQ 音乐搜索链接
  writings-reader.js         # 文字阅读室的翻页与主题导航
  guestbook.js               # 留言功能
  assets/                    # 网页用的压缩图片、MP3、地图与许可证
    fan-music-data.js        # 水流润万生老师提供的数据整理结果
.github/workflows/pages.yml  # GitHub Pages 发布
source-media/                 # 原始图片与 FLAC，不进入 Pages 部署包
scripts/optimize_images.py    # 从原始图片生成 WebP（需要 Pillow）
README.md
LICENSE                     # 原创代码 MIT 许可
THIRD_PARTY_NOTICES.md       # 内容与素材的独立许可说明
CONTRIBUTING.md              # 补充资料与修改方法
.gitignore
```

## 本地查看

直接打开 site/index.html。若已安装 Python，也可在项目根目录执行：

```sh
python -m http.server 8000 --directory site
```

然后访问 http://localhost:8000 。字体使用外部字体服务，离线时使用系统后备字体。

## 上传到 GitHub

1. 创建名为 li-jian-music-archive 的仓库，默认分支使用 main。
2. 将本目录内的文件和文件夹上传到仓库根目录，保留 .github/workflows/pages.yml；不要只上传 ZIP。
3. 使用命令行时，可在本目录执行以下命令，并替换仓库地址：

```sh
git init
git add .
git commit -m "Initial archive release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/li-jian-music-archive.git
git push -u origin main
```

## GitHub Pages 上线

仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。
在 Actions 中运行 Deploy GitHub Pages（Run workflow），后续推送 main 自动更新。
成功后的网址显示在 Pages 设置与工作流部署结果中，通常形如：
https://YOUR_USERNAME.github.io/li-jian-music-archive/

官方说明：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

此项目使用相对资源路径，适用于上述子目录网址。网站无需原 Sites 平台配置；本包未包含 .git 历史、.openai 配置或访问凭据。

## 修改内容

在 site/index.html 中搜索章节 id（about、music、tour、time、stage、notebook、moments、words、archive）。
巡演数据搜索 tourRecords、tourSetlists；地图点位使用经纬度，与地图的投影计算保持一致，不以目测随意移动城市。

音乐页新增的粉丝统计数据保存在 `site/assets/fan-music-data.js`，展示与筛选逻辑在 `site/fan-music.js`。更新时保留底部「出处与收藏」中的“水流润万生老师”署名，并区分粉丝统计与已核实的官方发行资料。修改后通过 GitHub Desktop 提交并推送到 `main`；本仓库的 GitHub Actions 会自动重新发布网站。
曲目检索和 QQ 音乐外链由 `site/song-links.js` 生成。检索结果合并显示歌曲所在的专辑、现场歌单和影视使用记录，可跳到对应资料并继续查看更多曲目。QQ 音乐外链指向搜索结果，供访客选择版本，不代表本站核实了特定录音的上架或可播放状态。
影像页使用 `site/assets/wanwu-live-01.jpg` 至 `wanwu-live-26.jpg`，分别对应巡演清单的第 1—26 场；增补或替换时应核对城市与日期。旧影像已从网页移除，保留的人物肖像展示在「人物札记」。
文字阅读室的 30 张原图位于 `site/assets/writings/01.jpg` 至 `30.jpg`，页面顺序与文件编号一致；主题跳转位置在 `site/writings-reader.js` 中维护。图中文字识别可能有误，编辑时请以原图核对。所有来源链接和素材说明集中放在 `site/index.html` 底部的 `archive` 章节。
网页使用 `site/assets/backgroundmusic.mp3` 播放背景音乐；原始 FLAC 留在 `source-media/backgroundmusic.flac`。更换音乐时请替换网页 MP3，并核对页面与 `THIRD_PARTY_NOTICES.md` 中的曲目信息。原图留在 `source-media/images/`，网页显示的 WebP 可用 `scripts/optimize_images.py` 重新生成。
新增条目注明来源、事件日期、发布日期；没有资料的字段留空。不要把推测的新专辑、传闻或节目上传日写成发行事实。

## 许可

原创页面代码采用 MIT。**照片、标志、录音、第三方文字与地图数据不因代码开源而统一变为 MIT**，详见 THIRD_PARTY_NOTICES.md。
本包包含当前网站图片以便复现页面；未核实公开再分发范围的用户提供素材已单独列出，仓库维护者应按自己的授权范围决定是否保留。可删除对应图片并更新页面引用。

资料快照：2026-09-24。档案不声称穷尽所有公开信息，与李健本人、工作室及唱片公司无官方隶属关系。
