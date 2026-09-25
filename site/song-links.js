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
    .song-finder { max-width: 820px; margin: 28px 0 42px; padding: 23px 26px; border: 1px solid rgba(236,232,223,.27); }
    .song-finder label { display: block; margin-bottom: 10px; color: #d5c49a; font: 12px/1.5 var(--sans, sans-serif); letter-spacing: .13em; }
    .song-finder input { width: 100%; min-height: 46px; padding: 9px 13px; border: 1px solid rgba(236,232,223,.3); border-radius: 0; outline-offset: 3px; background: #1b2d41; color: #ece8df; font: 14px/1.5 var(--sans, sans-serif); }
    .song-finder input::placeholder { color: #a5b4b8; }
    .song-finder-note, .song-finder-status { margin: 11px 0 0; color: #b7c3c4; font: 12px/1.65 var(--sans, sans-serif); }
    .song-finder-results:empty { display: none; }
    .song-finder-results { display: grid; margin: 15px 0 0; padding: 0; list-style: none; }
    .song-finder-results li { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 7px 15px; padding: 14px 0; border-top: 1px solid rgba(236,232,223,.14); color: #ece8df; overflow-wrap: anywhere; }
    .song-result-title { width: fit-content; font: 400 18px/1.45 var(--serif, serif); }
    .song-result-external { align-self: center; color: #b7c3c4; font: 12px/1.5 var(--sans, sans-serif); white-space: nowrap; }
    .song-result-contexts { display: flex; grid-column: 1 / -1; flex-wrap: wrap; gap: 7px; }
    .song-result-contexts button { min-height: 35px; padding: 6px 10px; border: 1px solid rgba(185,154,100,.4); color: #d5c49a; background: transparent; cursor: pointer; font: 12px/1.4 var(--sans, sans-serif); }
    .song-result-contexts button:hover, .song-result-contexts button:focus-visible { color: #101c2c; background: #d5c49a; }
    .song-finder-more { width: 100%; min-height: 44px; margin-top: 12px; padding: 9px 14px; border: 1px solid rgba(185,154,100,.5); color: #d5c49a; background: transparent; cursor: pointer; font: 13px/1.5 var(--sans, sans-serif); }
    .song-finder-more[hidden] { display: none; }
    @media (max-width: 600px) { .song-finder { padding: 18px; } .song-finder input { font-size: 16px; } .song-result-title { font-size: 17px; } .song-result-contexts button { min-height: 42px; } }
  `;
  document.head.append(style);

  const titles = new Map();
  function addTitle(raw, type, label = "", target = null) {
    for (const part of String(raw).split(/[／/+＋]/)) {
      const title = songTitle(part);
      if (!title || title.length > 80) continue;
      const key = title.toLocaleLowerCase();
      if (!titles.has(key)) titles.set(key, { title, albums: new Map(), archive: null, performances: 0, usages: 0 });
      const entry = titles.get(key);
      if (type === "album") entry.albums.set(label, target);
      if (type === "archive" && !entry.archive) entry.archive = target;
      if (type === "performance") entry.performances += 1;
      if (type === "usage") entry.usages += 1;
    }
  }

  music.querySelectorAll(".album-detail").forEach(album => {
    const albumName = album.querySelector(".album-title")?.textContent.trim() || "专辑";
    album.querySelectorAll(".track-list li").forEach(node => {
      const text = [...node.childNodes].find(child => child.nodeType === Node.TEXT_NODE && child.nodeValue.trim())?.nodeValue;
      if (text) addTitle(text, "album", albumName, album);
    });
  });
  music.querySelectorAll(".music-record ol li, .archive-lines strong, .stage-song-list li")
    .forEach(node => {
      if (node.textContent) addTitle(node.textContent, "archive", "", node);
    });
  const fanData = window.LI_JIAN_FAN_MUSIC_DATA;
  if (fanData) {
    fanData.performances.forEach(item => item.songs.forEach(title => addTitle(title, "performance")));
    fanData.usages.forEach(item => addTitle(item.song, "usage"));
  }

  const finder = document.createElement("div");
  finder.className = "song-finder";
  finder.innerHTML = `<label for="song-finder-input">SONG INDEX / 找一首歌</label>
    <input id="song-finder-input" type="search" placeholder="输入曲名，例如：风吹麦浪" autocomplete="off">
    <p class="song-finder-note">搜索本站的专辑、现场歌单和影视使用记录。点分类查看站内资料；点歌名前往 QQ 音乐搜索，版本及可播放情况以平台为准。</p>
    <p class="song-finder-status" role="status" aria-live="polite"></p>
    <ul class="song-finder-results"></ul>
    <button class="song-finder-more" type="button" hidden>显示更多曲目</button>`;
  music.querySelector(".section-intro").after(finder);

  const input = finder.querySelector("input");
  const status = finder.querySelector(".song-finder-status");
  const results = finder.querySelector(".song-finder-results");
  const more = finder.querySelector(".song-finder-more");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visibleCount = 20;

  function showRecord(target) {
    let details = target.closest("details");
    while (details && music.contains(details)) {
      details.open = true;
      details = details.parentElement.closest("details");
    }
    target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }

  function contextButton(label, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", action);
    return button;
  }

  function render() {
    const needle = input.value.trim().toLocaleLowerCase();
    results.replaceChildren();
    if (!needle) { status.textContent = ""; more.hidden = true; return; }
    const matches = [...titles.values()].filter(entry => entry.title.toLocaleLowerCase().includes(needle))
      .sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
    status.textContent = matches.length
      ? `找到 ${matches.length} 首相关曲目 · 显示 ${Math.min(visibleCount, matches.length)} 首`
      : "本站资料中暂无匹配曲目";
    matches.slice(0, visibleCount).forEach(entry => {
      const item = document.createElement("li");
      const title = songLink(entry.title);
      title.classList.add("song-result-title");
      const hint = songLink(entry.title, "QQ 音乐 ↗");
      hint.classList.add("song-result-external");
      const contexts = document.createElement("div");
      contexts.className = "song-result-contexts";
      if (entry.albums.size) {
        const [albumName, album] = entry.albums.entries().next().value;
        contexts.append(contextButton(`专辑 · ${albumName}${entry.albums.size > 1 ? ` 等 ${entry.albums.size} 张` : ""}`, () => showRecord(album)));
      }
      if (entry.archive) contexts.append(contextButton("作品记录", () => showRecord(entry.archive)));
      if (entry.performances) contexts.append(contextButton(`现场 · ${entry.performances} 条`, () => window.LI_JIAN_FAN_MUSIC_OPEN?.("performances", entry.title)));
      if (entry.usages) contexts.append(contextButton(`影视及机构 · ${entry.usages} 条`, () => window.LI_JIAN_FAN_MUSIC_OPEN?.("usages", entry.title)));
      item.append(title, hint, contexts);
      results.append(item);
    });
    more.hidden = matches.length <= visibleCount;
    more.textContent = `显示更多曲目（还剩 ${Math.max(0, matches.length - visibleCount)} 首）`;
  }
  input.addEventListener("input", () => { visibleCount = 20; render(); });
  more.addEventListener("click", () => { visibleCount += 20; render(); });

  function decorate(root) {
    const nodes = [];
    if (root.matches?.(selector)) nodes.push(root);
    nodes.push(...root.querySelectorAll(selector));
    nodes.forEach(node => {
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

  decorate(document);
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) decorate(node);
    }));
  });
  observer.observe(music, { childList: true, subtree: true });
  const tourCards = document.querySelector("#city-stops");
  if (tourCards) observer.observe(tourCards, { childList: true, subtree: true });
})();
