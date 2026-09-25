(() => {
  "use strict";

  const data = window.LI_JIAN_FAN_MUSIC_DATA;
  const music = document.querySelector("#music");
  if (!data || !music) return;

  const css = document.createElement("style");
  css.textContent = `
    .fan-music-archive { margin-top: clamp(58px, 8vw, 110px); padding-top: 34px; border-top: 1px solid rgba(236,232,223,.27); color: #ece8df; }
    .fan-music-head { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(200px, .6fr); gap: 36px; align-items: end; }
    .fan-music-kicker { color: #d5c49a; font: 12px/1.5 var(--sans, sans-serif); letter-spacing: .2em; }
    .fan-music-head h3 { margin: 12px 0 17px; font: 400 clamp(30px, 4.6vw, 56px)/1.15 var(--serif, serif); }
    .fan-music-head p { margin: 0; max-width: 680px; color: #b9c5c8; font: 15px/1.85 var(--sans, sans-serif); }
    .fan-music-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 0 0 4px; }
    .fan-music-stats span { display: grid; gap: 3px; color: #b2c0c2; font: 12px/1.5 var(--sans, sans-serif); letter-spacing: .08em; }
    .fan-music-stats strong { color: #d5c49a; font: 400 clamp(29px, 3.5vw, 44px)/1 var(--serif, serif); letter-spacing: 0; }
    .fan-music-tabs { display: flex; gap: 28px; margin-top: 36px; border-bottom: 1px solid rgba(236,232,223,.25); }
    .fan-music-tab { padding: 13px 0 15px; border: 0; border-bottom: 2px solid transparent; color: #aebbc0; background: transparent; cursor: pointer; text-align: left; font: 15px/1.5 var(--sans, sans-serif); }
    .fan-music-tab[aria-pressed="true"] { border-bottom-color: #b99a64; color: #f4f1e8; }
    .fan-music-filters { display: grid; grid-template-columns: minmax(175px, 1fr) minmax(175px, 1fr) minmax(220px, 1.7fr); gap: 14px; margin: 25px 0 12px; }
    .fan-music-filters label { display: grid; gap: 8px; color: #aebbc0; font: 12px/1.5 var(--sans, sans-serif); letter-spacing: .12em; }
    .fan-music-filters select, .fan-music-filters input { min-width: 0; min-height: 45px; padding: 9px 12px; border: 1px solid rgba(236,232,223,.25); border-radius: 0; color: #ece8df; background: #1b2d41; font: 14px/1.5 var(--sans, sans-serif); letter-spacing: 0; }
    .fan-music-filters input::placeholder { color: #98a9b1; }
    .fan-music-filters [hidden] { display: none; }
    .fan-music-count { margin: 17px 0 12px; color: #aebbc0; font: 12px/1.5 var(--sans, sans-serif); }
    .fan-music-list { display: grid; gap: 0; border-top: 1px solid rgba(236,232,223,.2); }
    .fan-performance { border-bottom: 1px solid rgba(236,232,223,.18); }
    .fan-performance summary { display: grid; grid-template-columns: 115px minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 21px 2px; list-style: none; cursor: pointer; }
    .fan-performance summary::-webkit-details-marker { display: none; }
    .fan-performance-date { color: #c7b68c; font: 14px/1.4 var(--serif, serif); white-space: nowrap; }
    .fan-performance-title { display: grid; gap: 4px; min-width: 0; color: #ece8df; font: 400 17px/1.4 var(--serif, serif); overflow-wrap: anywhere; }
    .fan-performance-title small { color: #aebbc0; font: 12px/1.4 var(--sans, sans-serif); letter-spacing: .08em; }
    .fan-performance-total { color: #aebbc0; font: 12px/1.4 var(--sans, sans-serif); white-space: nowrap; }
    .fan-performance-total::after { content: " +"; color: #d5c49a; }
    .fan-performance[open] .fan-performance-total::after { content: " −"; }
    .fan-performance-body { padding: 0 2px 28px 131px; }
    .fan-performance-place { margin: 0 0 15px; color: #c3ced0; font: 13px/1.7 var(--sans, sans-serif); }
    .fan-performance ol { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 24px; margin: 0; padding: 0; list-style: none; counter-reset: fan-song; }
    .fan-performance li { display: flex; gap: 11px; min-width: 0; color: #ece8df; font: 14px/1.6 var(--serif, serif); overflow-wrap: anywhere; }
    .fan-performance li::before { counter-increment: fan-song; content: counter(fan-song, decimal-leading-zero); color: #a99369; font: 12px/1.9 var(--sans, sans-serif); }
    .fan-song-name { min-width: 0; }
    .fan-song-tags { display: inline-flex; flex-wrap: wrap; gap: 4px; margin-left: 7px; vertical-align: middle; }
    .fan-song-tag { padding: 1px 4px; border: 1px solid rgba(185,154,100,.35); color: #d7c5a4; font: 11px/1.3 var(--sans, sans-serif); white-space: nowrap; }
    .fan-song-legend { margin: 0 0 16px; color: #9db0b8; font: 12px/1.6 var(--sans, sans-serif); }
    .fan-record-note { margin: 20px 0 0; color: #8fa2ab; font: 12px/1.6 var(--sans, sans-serif); }
    .fan-usage-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; padding-top: 18px; }
    .fan-usage-card { padding: 24px 25px; border: 1px solid rgba(236,232,223,.2); background: rgba(255,255,255,.025); }
    .fan-usage-card h4 { margin: 12px 0 7px; color: #f3eee4; font: 400 24px/1.25 var(--serif, serif); overflow-wrap: anywhere; }
    .fan-usage-card p { margin: 0; color: #c4cfd0; font: 15px/1.6 var(--sans, sans-serif); overflow-wrap: anywhere; }
    .fan-usage-kind { color: #c7b68c; font: 12px/1.5 var(--sans, sans-serif); letter-spacing: .12em; }
    .fan-usage-card dl { display: grid; grid-template-columns: 58px minmax(0,1fr); gap: 8px 13px; margin: 19px 0 0; padding-top: 16px; border-top: 1px solid rgba(236,232,223,.15); font: 12px/1.6 var(--sans, sans-serif); }
    .fan-usage-card dt { color: #99aab1; }
    .fan-usage-card dd { margin: 0; color: #e3e9e7; overflow-wrap: anywhere; }
    .fan-music-more { display: block; width: 100%; margin-top: 20px; padding: 14px; border: 1px solid rgba(185,154,100,.45); border-radius: 0; color: #d5c49a; background: transparent; cursor: pointer; font: 13px/1.5 var(--sans, sans-serif); }
    .fan-music-more[hidden] { display: none; }
    .fan-music-credit { margin: 27px 0 0; color: #aebbc0; font: 12px/1.8 var(--sans, sans-serif); }
    .fan-music-empty { margin: 26px 0; color: #b9c5c8; font: 14px/1.7 var(--sans, sans-serif); }
    @media (max-width: 860px) { .fan-music-head { grid-template-columns: 1fr; gap: 22px; } .fan-music-filters { grid-template-columns: repeat(2, minmax(0,1fr)); } .fan-music-search { grid-column: 1 / -1; } .fan-performance ol { grid-template-columns: repeat(2,minmax(0,1fr)); } }
    @media (max-width: 600px) {
      .fan-music-filters { grid-template-columns: 1fr; }
      .fan-music-search { grid-column: auto; }
      .fan-performance summary { grid-template-columns: 1fr auto; gap: 7px 12px; }
      .fan-performance-date { grid-column: 1 / -1; }
      .fan-performance-body { padding-left: 2px; }
      .fan-performance ol, .fan-usage-list { grid-template-columns: 1fr; }
      .fan-music-tabs { gap: 20px; }
      .fan-music-kicker,.fan-music-stats span,.fan-music-filters label,.fan-performance-title small,.fan-performance-total,.fan-song-legend,.fan-record-note,.fan-usage-kind,.fan-music-count,.fan-music-credit { font-size: 13px; line-height: 1.6; }
      .fan-music-filters select,.fan-music-filters input { font-size: 17px; }
      .fan-performance li { font-size: 15px; }
      .fan-song-tag { font-size: 12px; }
      .fan-usage-card dl { font-size: 13px; }
    }
  `;
  document.head.append(css);

  const archive = document.createElement("section");
  archive.className = "fan-music-archive";
  archive.setAttribute("aria-labelledby", "fan-music-title");
  archive.innerHTML = `
    <div class="fan-music-head">
      <div><span class="fan-music-kicker">FAN RESEARCH / 歌曲资料补编</span><h3 id="fan-music-title">歌曲的现场与去处</h3><p>按演出场次回看曲目，也可查看歌曲被影视、舞台和机构使用的整理记录。这里保留原表中的曲目名称、演出顺序与用途描述。</p></div>
      <div class="fan-music-stats"><span><strong>${data.performances.length}</strong>条演出记录</span><span><strong>${data.usages.length}</strong>条歌曲使用记录</span></div>
    </div>
    <div class="fan-music-tabs" aria-label="歌曲资料分类">
      <button type="button" class="fan-music-tab" aria-pressed="true" data-mode="performances">演出歌单</button>
      <button type="button" class="fan-music-tab" aria-pressed="false" data-mode="usages">影视与机构使用</button>
    </div>
    <div class="fan-music-filters">
      <label>类型<select class="fan-music-category"></select></label>
      <label class="fan-music-theme-wrap">巡演主题<select class="fan-music-theme"></select></label>
      <label class="fan-music-search">搜索<input class="fan-music-query" type="search" placeholder="搜索曲目、演出或作品" autocomplete="off"></label>
    </div>
    <p class="fan-music-count" role="status" aria-live="polite"></p>
    <div class="fan-music-list"></div>
    <button type="button" class="fan-music-more" hidden>查看更多记录</button>
  `;
  music.append(archive);

  const tabs = [...archive.querySelectorAll(".fan-music-tab")];
  const category = archive.querySelector(".fan-music-category");
  const theme = archive.querySelector(".fan-music-theme");
  const themeWrap = archive.querySelector(".fan-music-theme-wrap");
  const query = archive.querySelector(".fan-music-query");
  const count = archive.querySelector(".fan-music-count");
  const list = archive.querySelector(".fan-music-list");
  const more = archive.querySelector(".fan-music-more");
  let mode = "performances";
  let visibleCount = 24;

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== "") node.textContent = text;
    return node;
  }

  function options(select, values, allLabel) {
    select.replaceChildren();
    for (const [value, label] of [["", allLabel], ...values.map(value => [value, value])]) {
      const option = make("option", "", label);
      option.value = value;
      select.append(option);
    }
  }

  function setMode(next) {
    mode = next;
    visibleCount = 24;
    query.value = "";
    tabs.forEach(tab => tab.setAttribute("aria-pressed", String(tab.dataset.mode === mode)));
    const values = mode === "performances"
      ? ["巡回演唱会", "早期专场", "音乐节", "综艺节目", "电视晚会", "跨年舞台", "线上音乐会", "商业与特别演出"]
      : ["影视作品", "舞台作品", "机构与活动"];
    options(category, values, "全部类型");
    options(theme, ["看见李健", "不止是李健", "万物安生时", "万物安生时 Encore"], "全部巡演主题");
    themeWrap.hidden = mode !== "performances";
    render();
  }

  function renderPerformance(item) {
    const card = make("details", "fan-performance");
    const summary = make("summary");
    const date = make("time", "fan-performance-date", item.date ? item.date.replaceAll("-", ".") : "日期待核");
    if (item.date) date.dateTime = item.date;
    const title = make("span", "fan-performance-title", item.title);
    title.append(make("small", "", item.theme || item.category));
    const total = make("span", "fan-performance-total", `${item.songs.length} 条曲目`);
    summary.append(date, title, total);
    const body = make("div", "fan-performance-body");
    if (item.detail) body.append(make("p", "fan-performance-place", item.detail));
    if (item.songFlags) body.append(make("p", "fan-song-legend", "原表标记：变更＝与上一场曲目不同；本轮仅有＝仅见于本轮；首唱＝原表加粗标记。"));
    const songs = make("ol");
    item.songs.forEach((song, index) => {
      const row = make("li");
      const name = make("span", "fan-song-name", song);
      const flags = item.songFlags?.[index] || 0;
      if (flags) {
        const tags = make("span", "fan-song-tags");
        for (const [bit, label] of [[1, "变更"], [2, "本轮仅有"], [4, "首唱"]]) {
          if (flags & bit) tags.append(make("span", "fan-song-tag", label));
        }
        name.append(tags);
      }
      row.append(name);
      songs.append(row);
    });
    body.append(songs);
    if (item.reportedTotal) body.append(make("p", "fan-record-note", `收录曲目：${item.reportedTotal}`));
    card.append(summary, body);
    return card;
  }

  function renderUsage(item) {
    const card = make("article", "fan-usage-card");
    card.append(make("span", "fan-usage-kind", `${item.category} · ${item.medium}`));
    card.append(make("h4", "", item.song));
    card.append(make("p", "", item.project));
    const details = make("dl");
    for (const [label, value] of [["用途", item.purpose], ["缘由", item.basis], ["参与", item.contribution], ["时间", item.time]]) {
      if (value) details.append(make("dt", "", label), make("dd", "", value));
    }
    card.append(details);
    return card;
  }

  function render() {
    const source = mode === "performances" ? [...data.performances].reverse() : data.usages;
    const needle = query.value.trim().toLocaleLowerCase();
    const selectedCategory = category.value;
    const selectedTheme = theme.value;
    const filtered = source.filter(item => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (mode === "performances" && selectedTheme && item.theme !== selectedTheme) return false;
      if (!needle) return true;
      const text = mode === "performances"
        ? [item.title, item.detail, item.theme, item.date, ...item.songs].join(" ")
        : [item.song, item.project, item.medium, item.category, item.purpose, item.basis, item.contribution, item.time].join(" ");
      return text.toLocaleLowerCase().includes(needle);
    });
    count.textContent = `找到 ${filtered.length} 条${mode === "performances" ? "演出" : "歌曲使用"}记录`;
    list.className = mode === "performances" ? "fan-music-list" : "fan-music-list fan-usage-list";
    list.replaceChildren();
    if (!filtered.length) list.append(make("p", "fan-music-empty", "没有找到相符记录，请更换筛选条件。"));
    filtered.slice(0, visibleCount).forEach(item => list.append(mode === "performances" ? renderPerformance(item) : renderUsage(item)));
    more.hidden = filtered.length <= visibleCount;
    more.textContent = `查看更多记录（还剩 ${Math.max(0, filtered.length - visibleCount)} 条）`;
  }

  tabs.forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
  category.addEventListener("change", () => {
    visibleCount = 24;
    if (category.value && category.value !== "巡回演唱会") theme.value = "";
    themeWrap.hidden = mode !== "performances" || (category.value && category.value !== "巡回演唱会");
    render();
  });
  theme.addEventListener("change", () => { visibleCount = 24; render(); });
  query.addEventListener("input", () => { visibleCount = 24; render(); });
  more.addEventListener("click", () => { visibleCount += 24; render(); });
  setMode(mode);
  window.LI_JIAN_FAN_MUSIC_OPEN = (nextMode, title) => {
    setMode(nextMode);
    query.value = title;
    render();
    archive.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };
})();
