(() => {
  "use strict";

  const music = document.querySelector("#music");
  if (!music) return;

  const selector = [
    "#music .track-list li",
    "#music .music-record ol li",
    "#music .archive-lines strong",
    "#music .stage-song-list li",
    "#music .fan-song-name",
    "#music .fan-usage-card h4",
    "#tour .postmark-setlist li > span:not(.setlist-number)"
  ].join(", ");

  function songTitle(raw) {
    return raw.trim()
      .replace(/^[^·]{1,24} · /, "")
      .replace(/[《》]/g, "")
      .replace(/（&[^）]*）/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function searchUrl(title) {
    return `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(`李健 ${songTitle(title)}`)}`;
  }

  function songLink(title, label = title) {
    const link = document.createElement("a");
    link.className = "qq-song-link";
    link.href = searchUrl(title);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    link.setAttribute("aria-label", `在 QQ 音乐搜索《${songTitle(title)}》（新窗口）`);
    return link;
  }

  const style = document.createElement("style");
  style.textContent = `
    .qq-song-link { color: inherit; text-decoration: none; border-bottom: 1px solid rgba(185,154,100,.45); transition: color .2s ease, border-color .2s ease; }
    .qq-song-link:hover, .qq-song-link:focus-visible { color: #d5c49a; border-bottom-color: currentColor; }
    #tour .qq-song-link:hover, #tour .qq-song-link:focus-visible { color: #806238; }
    .song-finder { max-width: 760px; margin: 28px 0 42px; padding: 19px 22px; border: 1px solid rgba(236,232,223,.27); }
    .song-finder label { display: block; margin-bottom: 10px; color: #d5c49a; font: 11px/1.5 var(--sans, sans-serif); letter-spacing: .13em; }
    .song-finder input { width: 100%; min-height: 46px; padding: 9px 13px; border: 1px solid rgba(236,232,223,.3); border-radius: 0; outline-offset: 3px; background: #1b2d41; color: #ece8df; font: 14px/1.5 var(--sans, sans-serif); }
    .song-finder input::placeholder { color: #a5b4b8; }
    .song-finder-note, .song-finder-status { margin: 10px 0 0; color: #b7c3c4; font: 11px/1.6 var(--sans, sans-serif); }
    .song-finder-status:empty, .song-finder-results:empty { display: none; }
    .song-finder-results { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 0 22px; margin: 12px 0 0; padding: 0; list-style: none; }
    .song-finder-results li { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid rgba(236,232,223,.14); color: #ece8df; font: 13px/1.5 var(--serif, serif); overflow-wrap: anywhere; }
    .song-finder-results small { flex: 0 0 auto; color: #a5b4b8; font: 10px/1.5 var(--sans, sans-serif); }
    @media (max-width: 600px) { .song-finder { padding: 17px; } .song-finder-results { grid-template-columns: 1fr; } }
  `;
  document.head.append(style);

  const titles = new Map();
  function addTitle(raw) {
    for (const part of String(raw).split(/[／/+＋]/)) {
      const title = songTitle(part);
      if (title && title.length <= 80) titles.set(title.toLocaleLowerCase(), title);
    }
  }

  music.querySelectorAll(".track-list li, .music-record ol li, .archive-lines strong, .stage-song-list li")
    .forEach(node => {
      const text = node.matches(".track-list li")
        ? [...node.childNodes].find(child => child.nodeType === Node.TEXT_NODE && child.nodeValue.trim())?.nodeValue
        : node.textContent;
      if (text) addTitle(text);
    });
  const fanData = window.LI_JIAN_FAN_MUSIC_DATA;
  if (fanData) {
    fanData.performances.forEach(item => item.songs.forEach(addTitle));
    fanData.usages.forEach(item => addTitle(item.song));
  }

  const finder = document.createElement("div");
  finder.className = "song-finder";
  finder.innerHTML = `<label for="song-finder-input">SONG INDEX / 曲目检索</label>
    <input id="song-finder-input" type="search" placeholder="输入曲名，例如：风吹麦浪" autocomplete="off">
    <p class="song-finder-note">从本站曲目资料中查找；点击结果前往 QQ 音乐搜索。录音版本及可播放情况以 QQ 音乐为准。</p>
    <p class="song-finder-status" role="status" aria-live="polite"></p>
    <ul class="song-finder-results"></ul>`;
  music.querySelector(".section-intro").after(finder);

  const input = finder.querySelector("input");
  const status = finder.querySelector(".song-finder-status");
  const results = finder.querySelector(".song-finder-results");
  input.addEventListener("input", () => {
    const needle = input.value.trim().toLocaleLowerCase();
    results.replaceChildren();
    if (!needle) { status.textContent = ""; return; }
    const matches = [...titles.values()].filter(title => title.toLocaleLowerCase().includes(needle))
      .sort((a, b) => a.localeCompare(b, "zh-CN"));
    status.textContent = matches.length ? `找到 ${matches.length} 首相关曲目${matches.length > 20 ? "，显示前 20 首" : ""}` : "本站资料中暂无匹配曲目";
    matches.slice(0, 20).forEach(title => {
      const item = document.createElement("li");
      const hint = document.createElement("small");
      hint.textContent = "QQ 音乐 ↗";
      item.append(songLink(title), hint);
      results.append(item);
    });
  });

  function decorate() {
    document.querySelectorAll(selector).forEach(node => {
      if (node.dataset.qqLinked === "true") return;
      const textNode = [...node.childNodes].find(child => child.nodeType === Node.TEXT_NODE && child.nodeValue.trim());
      if (!textNode) return;
      const label = textNode.nodeValue.trim();
      const title = songTitle(label);
      if (!title) return;
      node.replaceChild(songLink(title, label), textNode);
      node.dataset.qqLinked = "true";
    });
  }

  decorate();
  const observer = new MutationObserver(decorate);
  observer.observe(music, { childList: true, subtree: true });
  const tourCards = document.querySelector("#city-stops");
  if (tourCards) observer.observe(tourCards, { childList: true, subtree: true });
})();
