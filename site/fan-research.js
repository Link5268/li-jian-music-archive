(() => {
  const stage = document.getElementById("stage");
  if (!stage) return;

  const scans = [
    {
      title: "演出、访谈与文字刊登",
      image: "assets/fan-research-01.jpg",
      groups: [
        ["个人演唱会脉络", [
          "1998.05.25 · 清华大学毕业演唱会（粉丝统计所列日期；本站另一历史资料记录为 1998.06.10，待核对）",
          "2007 · 九大高校巡演",
          "2008.04.29 · “完美坚持”音乐派对",
          "2010 · “传奇”“音乐傲骨”演唱会，统计为 3 站",
          "2011 · “向往”音乐现场，统计为 10 场（本站历史场次索引已核录 9 场）",
          "2012 · “传奇依然”演唱会，统计为 2 站",
          "2013 · “李健拾光”专辑首唱会",
          "2014 · “传奇”演唱会，统计为 2 站",
          "2015—2016 · “看见李健”世界巡回演唱会",
          "2018 · “李健和他的朋友们”清华大学演唱会",
          "2018—2019 · “不止是李健”世界巡回演唱会",
          "2023—2025 · “万物安生时”世界巡回演唱会",
          "2026—2027 · “万物安生时”世界巡回演唱会 Encore"
        ]],
        ["访谈、讲座与对话（选录）", [
          "2010.05.25 · 清华大学“时代论坛”李健专场“吉他如何创造音乐传奇”演讲",
          "2007.05.09 · 《鲁豫有约》；2008.10.10 · 《明星私家事》",
          "2010.11.01 · 福建电视台《新视觉》；2011.02.19 · 《百年歌声》",
          "2012.03.11 · 海峡卫视《相约东南》；2012 · 《铿锵三人行》",
          "2013.03.16 · 《文化主题之夜》；2013.03.18 · 《音乐前线》；2013.10.19 · 《娱乐一级棒》",
          "2014.03.20 · 《艺术人生》",
          "2015 · 清华大学、电子科技大学、中国人民大学、哈尔滨工业大学四大高校健谈会",
          "2015.08.22 · 《音乐五四三》；2015.11.25 · 网易云音乐《超级面对面》",
          "2015.10.23 · MTV 头号人物专访",
          "2021.08.04 · 腾讯音乐《UNI TALK 由你说》",
          "2022 · 《环球时报》专访",
          "2025.03.26 · 网易云音乐访谈；《云上叻》EP34 访谈",
          "图中另列《每日文娱》《星月私房话》《银河面对面》《飞鱼秀》系列及金融博物馆读书会等对话线索"
        ]],
        ["撰文与采访刊登（选录）", [
          "2015.02.02 · 《中国新闻周刊》第 697 期《致父亲：在你离去的多年以后，我为你骄傲》",
          "2017 · 《三联生活周刊》第 26 期《立与不立皆辛苦》",
          "2022.07.21 · 《人民日报》第 20 版《好歌唱出我们心中所想》",
          "2015.04.22 · 《人民日报》第 12 版《读书的“无用”与“有用”》",
          "2012.03 · 《时尚芭莎》",
          "2015.05 · 《时尚 COSMO》专题",
          "2016 · 《人物》第 4 期专题",
          "2023.11 · 《港口 POPT》创刊号封面人物",
          "《中国校园》2010 年 7 月上封面；《数码精品世界》2010 年 11 月期封面人物；《金鹰报》2015.05.13",
          "《罗博报告》2015 年 6 月刊封面；《城市画报》2015.07.02；《中国企业家》2016.02.05",
          "《时尚健康》2012 年 2 月；《ELLE MEN 睿士》2021 年 4 月；《OK！精彩》2015 年",
          "《优品》2013.10.01；《联合报》2015.10.05；《环球人物》2017 年 1 月",
          "《流行歌曲》2010 年 1 月；《VISTA 看天下》2012.08.08；《吉他爱好者》2008 年第 18 期",
          "《法制晚报》2013.08.29；《芒果画报》2012 年 2 月；《第一财经周刊》2013.08.19",
          "2025 · 《时尚芭莎》Green BAZAAR 三月刊与《芭莎男士》五月刊封面人物故事"
        ]],
        ["社会荣誉（图中所列）", [
          "2010.07 · 南非旅游局授予“音乐酋长”",
          "2012.06 · 南方人物周刊“中国骄子青年领袖”",
          "2015.12.03 · 第 12 届年度先生盛典“年度先生”"
        ]]
      ]
    },
    {
      title: "荧屏、身份与合作",
      image: "assets/fan-research-02.jpg",
      groups: [
        ["品牌合作与公共身份（历史记录）", [
          "品牌合作：诺基亚 N9、小鸟音响、5100 矿泉水、沃尔沃 XC90",
          "图中记录的身份包括中国平安品牌大使、宝珀品牌挚友、微鲸首席艺术顾问，以及“世界地球日”中国大陆地区代言人",
          "图中记录的公益或文化身份包括国家海洋局海洋公益形象大使、全民阅读形象大使、中国野生动物保护公益形象大使",
          "图中另列联合国环境保护亲善大使、2011 年“京华慈善教育 1+1 行动”形象大使、2012 年中国俄罗斯旅游年形象大使与福田音协名誉主席；称谓与年份待原始机构资料核对",
          "以上仅为粉丝资料所列的历史合作与称谓，具体年份和任期仍需逐条核对"
        ]],
        ["综艺与节目（选录）", [
          "2013 · CCTV-1《开讲啦》演讲嘉宾",
          "2014 · 《中国正在听》明星听审、《Hi 歌》嘉宾",
          "2015 · 《全民电影》总决赛表演嘉宾、《我是歌手》第三季补位歌手、《天天向上》嘉宾",
          "2015 · 《中国好声音》第四季那英战队梦想导师",
          "2016 · 《我是歌手》第四季双年巅峰会",
          "2017 · 《歌手 2017》《快乐男声》节目记录",
          "2018 · 《小镇故事》《我想和你唱》第三季、《中国好声音》导师",
          "2020 · 《中国好声音》导师、《我们的歌》第二季",
          "2021 · 《经典咏流传》第四季、《一路唱响》；上海电视节“白玉兰绽放”颁奖典礼表演嘉宾",
          "2022 · 《声生不息·港乐季》；《为歌而赞 2》点评嘉宾；《这 Young 的夏天》嘉宾",
          "2023 · 《百川高校声》嘉宾",
          "2024 · 《天赐的声音 5》第三期飞行嘉宾"
        ]],
        ["专辑与音乐合作（图中所列）", [
          "《似水流年》：图中概括为包揽全曲作曲和编曲工作",
          "《为你而来》：图中概括为包揽全词曲创作和制作人工作；郑钧担任监制",
          "《拾光》：图中列为古典精选集制作人",
          "《音乐傲骨》《李健》：图中列出与金牌大风等合作",
          "图中还列出与毛不易、盛可以、缪杰、罗卫华、钟立风、左小祖咒、王海涛、李爱、杨雪霏等人的合作线索；具体曲目与分工待逐条核对"
        ]]
      ]
    },
    {
      title: "音乐成就与传播",
      image: "assets/fan-research-03.jpg",
      groups: [
        ["音乐奖项（选录）", [
          "2006 · 专辑《为你而来》列入全球华语音乐榜中榜内地最佳创作歌手记录",
          "2010 · 专辑《音乐傲骨》与 MusicRadio 中国 TOP 榜相关奖项",
          "2010.12 · 第八届东南劲爆音乐颁奖典礼多项奖项",
          "2011.03 · 第 18 届东方风云榜年度盛典，内地最佳男歌手、最佳专辑相关记录",
          "2012 · 专辑《依然》及歌曲《心升明月》相关年度奖项",
          "2012.04 · MusicRadio 中国 TOP 排行榜：最佳歌手、最佳唱片及年度金曲相关记录",
          "2012.08 · 第 11 届 CCTV-MTV 音乐盛典年度最佳男歌手相关记录",
          "2012.12 · 中国歌曲排行榜年度最佳内地男歌手、最佳专辑制作人及年度金曲相关记录",
          "2014 · 专辑《拾光》入围第 25 届台湾金曲奖相关项目",
          "2014.03 · QQ 音乐年度盛典内地男歌手与跨界专辑相关记录",
          "2015 · 专辑《拾光》与《李健》相关销售和榜单记录",
          "2015.12 · 第 16 届华语音乐传媒大奖最佳国语男歌手相关记录",
          "2016 · 全球流行音乐年度盛典年度最佳制作人、年度最佳专辑等记录",
          "2016 · 《深海之寻》《李健》获第 27 届台湾金曲奖相关提名；图片特别注明提名并非获奖"
        ]],
        ["作品传播与社会使用", [
          "《传奇》《风吹麦浪》《贝加尔湖畔》在图中被列为广泛传播和被翻唱的作品",
          "《贝加尔湖畔》在图中提及与贝加尔湖旅游路线的联系",
          "《深海之寻》在图中列为世界海洋日、全国海洋公益宣传歌曲",
          "《心升明月》在图中列为 2012 年旅游卫视宣传曲"
        ]],
        ["热门翻唱的粉丝统计快照", [
          "《父亲写的散文诗》：图中标注三平台收藏约 758 万+",
          "《当你老了》：图中标注三平台收藏约 374 万+",
          "《在水一方》：图中标注三平台收藏约 208 万+",
          "《袖手旁观》：图中标注三平台收藏约 279 万+",
          "《十点半的地铁》：图中标注三平台收藏约 150 万+",
          "以上数字为原图截至 2026.07.04 的个人统计快照，口径与实时数据未独立核验"
        ]]
      ]
    },
    {
      title: "公共活动与影像作品",
      image: "assets/fan-research-04.jpg",
      groups: [
        ["主要社会活动（选录）", [
          "2004.03.22 · 参与录制公益主题组歌《不要让未来恨我》",
          "2005.04 · 参加北京音乐台大型植树公益活动",
          "2005.06 · 在北京盲人学校给孩子们上音乐课",
          "2008.05.16 · 参加深圳卫视抗震救灾募捐晚会，并参与公益歌曲《我们心在一起》录制",
          "2010.04 · 参与“与大树在一起”植树活动",
          "2010.06 · 参与《生命之盾》主题活动",
          "2011.07 · 参与“明月行动·关爱非洲”环保公益活动",
          "2015.06.08 · 参与“中美蓝色海洋”公益宣传活动",
          "2016.07.13 · 参与盲童音乐夏令营",
          "2018.04 · 参与“三村平安工程村教”与“家乡与世界”主题活动",
          "2020.04.02 · 参与全国“爱鸟周”主题宣传活动"
        ]],
        ["MV 与短片作品（按图中日期）", [
          "2009.11.30《故乡山川》；2010.06《好望角》",
          "2013.03.25《凌晨两点》；2013.08.17《向往》；2013.09.13《异乡人》",
          "2015.07.17《假如爱有天意》；2015.09.08《美若黎明》；2015.10.28《深海之寻》",
          "2016《爱的人一辈子看看看不完》微电影；2016.10.26《你一言我一语》",
          "2017.09.04《完美坚持》；2017.12.26《雾中列车》",
          "2018.05.01《山歌好比春江水》；2018.07.02《懂得》；2018.07.20《故乡》",
          "2019.10《我在黑龙江等你》；2019.12.09《一念一生》",
          "2021.07.20《深町小夜曲》；2022.04.16《好歌献给你》"
        ]]
      ]
    }
  ];

  const style = document.createElement("style");
  style.textContent = `
    .fan-research { margin-top: clamp(60px,8vw,110px); padding-top: clamp(40px,5vw,70px); border-top: 1px solid rgba(16,28,44,.23); }
    .fan-research-head { display: flex; align-items: end; justify-content: space-between; gap: 28px; margin-bottom: 18px; }
    .fan-research-head h3 { margin: 12px 0 0; font: 400 clamp(29px,4vw,49px)/1.15 var(--serif); }
    .fan-research-head span:last-child { color: #758187; font-size: 11px; letter-spacing: .08em; }
    .fan-research-intro { max-width: 860px; margin: 0 0 32px; color: #586672; font: 13px/1.85 var(--sans); }
    .fan-research-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; }
    .fan-research-fold { min-width: 0; border: 1px solid rgba(16,28,44,.19); background: rgba(255,255,255,.28); }
    .fan-research-fold > summary { display: flex; justify-content: space-between; gap: 15px; padding: 22px; cursor: pointer; list-style: none; }
    .fan-research-fold > summary::-webkit-details-marker { display: none; }
    .fan-research-fold > summary strong { font: 400 clamp(18px,2vw,24px)/1.25 var(--serif); }
    .fan-research-fold > summary span { flex: 0 0 auto; color: #8c7954; font-size: 13px; }
    .fan-research-fold[open] > summary span { transform: rotate(45deg); }
    .fan-research-body { padding: 0 22px 24px; }
    .fan-research-body h4 { margin: 24px 0 8px; color: #23374b; font: 400 19px/1.3 var(--serif); }
    .fan-research-body h4:first-child { margin-top: 0; }
    .fan-research-body ul { margin: 0; padding-left: 20px; color: #54636f; font: 12px/1.8 var(--sans); }
    .fan-research-body li { padding: 4px 0; }
    .fan-research-scan { display: block; margin-top: 24px; color: #75613d; font-size: 12px; text-underline-offset: 3px; }
    .fan-research-scan img { max-height: 380px; width: auto; margin: 12px auto 0; border: 1px solid rgba(16,28,44,.2); object-fit: contain; }
    .fan-research-foot { margin: 23px 0 0; color: #64717a; font-size: 11px; line-height: 1.8; }
    @media (max-width: 760px) { .fan-research-grid { grid-template-columns: 1fr; } .fan-research-head { align-items: start; flex-direction: column; gap: 8px; } }
  `;
  document.head.append(style);

  const wrap = document.createElement("section");
  wrap.className = "fan-research";
  wrap.id = "fan-research";
  wrap.setAttribute("aria-labelledby", "fan-research-title");
  wrap.innerHTML = `<div class="fan-research-head"><div><span class="section-kicker">FAN RESEARCH / 资料补编</span><h3 id="fan-research-title">资料里的另一面</h3></div><span>4 张原始统计图 · 2026.07.04 截止</span></div><p class="fan-research-intro">将演出、访谈、合作、音乐荣誉、公共活动与影像作品分门别类。条目依据水流润万生老师的粉丝个人统计图转录；选录清晰可辨的内容，并保留原图供核对。它们是线索，不作为官方公告；不同资料的日期或场次数目有出入时分别注明。</p><div class="fan-research-grid"></div><p class="fan-research-foot">数据支持与原图制作：水流润万生老师。原图标注“数据统计截至 2026.07.04”。统计可能不完整，部分条目仍待原始节目、主办方或刊物核实。</p>`;
  const grid = wrap.querySelector(".fan-research-grid");
  scans.forEach((scan, index) => {
    const fold = document.createElement("details");
    fold.className = "fan-research-fold";
    const summary = document.createElement("summary");
    summary.innerHTML = `<strong>${String(index + 1).padStart(2, "0")} / ${scan.title}</strong><span aria-hidden="true">＋</span>`;
    const body = document.createElement("div");
    body.className = "fan-research-body";
    scan.groups.forEach(([heading, items]) => {
      const title = document.createElement("h4");
      title.textContent = heading;
      const list = document.createElement("ul");
      items.forEach((entry) => {
        const item = document.createElement("li");
        item.textContent = entry;
        list.append(item);
      });
      body.append(title, list);
    });
    const source = document.createElement("a");
    source.className = "fan-research-scan";
    source.href = scan.image;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent = "查看第 " + (index + 1) + " 张原始统计图 ↗";
    const image = document.createElement("img");
    image.src = scan.image;
    image.alt = scan.title + "：水流润万生老师的粉丝个人统计原图";
    image.loading = "lazy";
    image.decoding = "async";
    source.append(image);
    body.append(source);
    fold.append(summary, body);
    grid.append(fold);
  });
  stage.append(wrap);
})();
