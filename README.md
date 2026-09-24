# 李健 · 音乐与时间档案馆

非官方网站 / Unofficial Fan Archive。一个围绕音乐、时间、巡演和影像的个人收藏网站。

## 内容与功能

- 人物履历、时间线、公开访谈与人物札记
- 专辑曲目、单曲、合作作品、节目与荣誉记录
- 粉丝整理的演出歌单与歌曲用于影视、舞台、机构项目的记录，可按类型和关键词检索
- 巡演主题、城市地图、场次筛选、同城多场及歌单
- 摄影档案与逐条资料来源

## 技术与目录

当前版本是 **HTML + CSS + 原生 JavaScript 的静态网站**，不需要 Next.js 或安装构建依赖。音乐档案数据随网页静态发布；留言功能另由 Supabase 保存和审核。

```text
site/
  index.html                 # 页面、样式、交互与档案数据
  fan-music.js               # 音乐资料筛选与展示
  guestbook.js               # 留言功能
  assets/                    # 图片、地图、地图原许可证
    fan-music-data.js        # 水流润万生老师提供的数据整理结果
.github/workflows/pages.yml  # GitHub Pages 发布
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

在 site/index.html 中搜索章节 id（about、music、tour、time、stage、notebook、moments、archive）。
巡演数据搜索 tourRecords、tourSetlists；地图点位使用经纬度，与地图的投影计算保持一致，不以目测随意移动城市。

音乐页新增的粉丝统计数据保存在 `site/assets/fan-music-data.js`，展示与筛选逻辑在 `site/fan-music.js`。更新时保留“水流润万生老师 · 数据支持”的署名，并区分粉丝统计与已核实的官方发行资料。修改后通过 GitHub Desktop 提交并推送到 `main`；本仓库的 GitHub Actions 会自动重新发布网站。
新增条目注明来源、事件日期、发布日期；没有资料的字段留空。不要把推测的新专辑、传闻或节目上传日写成发行事实。

## 许可

原创页面代码采用 MIT。**照片、标志、第三方文字与地图数据不因代码开源而统一变为 MIT**，详见 THIRD_PARTY_NOTICES.md。
本包包含当前网站图片以便复现页面；未核实公开再分发范围的用户提供素材已单独列出，仓库维护者应按自己的授权范围决定是否保留。可删除对应图片并更新页面引用。

资料快照：2026-09-24。档案不声称穷尽所有公开信息，与李健本人、工作室及唱片公司无官方隶属关系。
