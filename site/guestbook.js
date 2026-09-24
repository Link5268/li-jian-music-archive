(() => {
  "use strict";

  const PROJECT_URL = "https://vopfllswgegjhwyvqbrd.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_eeJkJ4IuQbvVLLaSLt8a1w_szzgOMVu";
  const API_URL = `${PROJECT_URL}/rest/v1/guestbook_messages`;
  const wordsSection = document.querySelector("#words");
  if (!wordsSection) return;

  const style = document.createElement("style");
  style.textContent = `
    .guestbook { width: min(100%, 1080px); margin: 84px auto 0; text-align: left; }
    .guestbook-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding-bottom: 17px; border-bottom: 1px solid rgba(236,232,223,.24); }
    .guestbook-kicker { display: block; margin-bottom: 9px; color: #b99a64; font: 11px/1.5 var(--sans, sans-serif); letter-spacing: .22em; }
    .guestbook-heading h3 { margin: 0; color: #ece8df; font: 400 clamp(24px,3vw,38px)/1.3 var(--serif, serif); }
    .guestbook-hint { margin: 0; color: #aebbc3; font: 12px/1.6 var(--sans, sans-serif); }
    .guestbook-window { position: relative; overflow: hidden; margin-top: 26px; }
    .guestbook-window::before, .guestbook-window::after { position: absolute; top: 0; bottom: 0; z-index: 1; width: 38px; content: ""; pointer-events: none; }
    .guestbook-window::before { left: 0; background: linear-gradient(90deg,#101c2c,transparent); }
    .guestbook-window::after { right: 0; background: linear-gradient(270deg,#101c2c,transparent); }
    .guestbook-track { display: flex; width: max-content; gap: 20px; animation: guestbook-drift var(--guestbook-duration, 50s) linear infinite; }
    .guestbook-track.is-static { width: 100%; animation: none; }
    .guestbook-window:hover .guestbook-track, .guestbook-window:focus-within .guestbook-track, .guestbook-track.is-paused { animation-play-state: paused; }
    .guestbook-group { display: flex; gap: 20px; }
    .guestbook-card { box-sizing: border-box; display: flex; flex: 0 0 270px; flex-direction: column; min-height: 172px; padding: 22px 24px; border: 1px solid rgba(185,154,100,.28); background: rgba(255,255,255,.035); }
    .guestbook-card-head { display: flex; justify-content: space-between; gap: 15px; align-items: baseline; margin-bottom: 18px; }
    .guestbook-card-name { color: #d8c49b; font: 15px/1.4 var(--serif, serif); }
    .guestbook-card-date { flex: 0 0 auto; color: #91a1aa; font: 10px/1.4 var(--sans, sans-serif); }
    .guestbook-card-message { margin: 0; color: #ece8df; font: 15px/1.75 var(--serif, serif); overflow-wrap: anywhere; white-space: pre-wrap; }
    .guestbook-empty { width: 100%; padding: 28px 0; color: #aebbc3; text-align: center; font: 13px/1.7 var(--sans, sans-serif); }
    .guestbook-controls { display: flex; justify-content: flex-end; margin-top: 12px; }
    .guestbook-pause { padding: 7px 0; color: #cdbb96; border: 0; border-bottom: 1px solid rgba(205,187,150,.4); background: transparent; cursor: pointer; font: 11px/1.5 var(--sans, sans-serif); }
    .guestbook-form { display: grid; grid-template-columns: minmax(140px,1fr) minmax(220px,2.6fr) auto; gap: 12px; align-items: start; margin-top: 44px; }
    .guestbook-form label { display: grid; gap: 9px; color: #bdc8ca; font: 11px/1.5 var(--sans, sans-serif); letter-spacing: .12em; }
    .guestbook-form input, .guestbook-form textarea { box-sizing: border-box; width: 100%; min-height: 48px; padding: 13px 14px; border: 1px solid rgba(236,232,223,.3); border-radius: 0; outline: none; color: #ece8df; background: rgba(255,255,255,.04); font: 14px/1.5 var(--sans, sans-serif); letter-spacing: 0; }
    .guestbook-form textarea { height: 48px; resize: vertical; }
    .guestbook-form input:focus, .guestbook-form textarea:focus { border-color: #b99a64; }
    .guestbook-submit { align-self: end; min-height: 48px; padding: 0 22px; border: 1px solid #b99a64; border-radius: 0; color: #101c2c; background: #cdbb96; cursor: pointer; font: 12px/1.4 var(--sans, sans-serif); }
    .guestbook-submit:disabled { opacity: .55; cursor: wait; }
    .guestbook-status { min-height: 23px; margin: 10px 0 0; color: #d8c49b; font: 12px/1.7 var(--sans, sans-serif); }
    @keyframes guestbook-drift { to { transform: translateX(calc(-50% - 10px)); } }
    @media (max-width: 720px) {
      .guestbook { margin-top: 62px; }
      .guestbook-heading { display: block; }
      .guestbook-hint { margin-top: 9px; }
      .guestbook-form { grid-template-columns: 1fr; }
      .guestbook-submit { width: 100%; }
      .guestbook-card { flex-basis: 238px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .guestbook-window { overflow-x: auto; }
      .guestbook-window::before, .guestbook-window::after { display: none; }
      .guestbook-track { animation: none !important; }
      .guestbook-group[aria-hidden="true"] { display: none; }
    }
  `;
  document.head.append(style);

  const guestbook = document.createElement("div");
  guestbook.className = "guestbook";
  guestbook.innerHTML = `
    <div class="guestbook-heading">
      <div><span class="guestbook-kicker">VISITOR NOTES / 来访者留声</span><h3>留下你的短笺</h3></div>
      <p class="guestbook-hint">留言经审核后展示在这里</p>
    </div>
    <div class="guestbook-window" aria-label="已审核的访客留言">
      <div class="guestbook-track is-static" id="guestbook-track"><p class="guestbook-empty">正在读取留言…</p></div>
    </div>
    <div class="guestbook-controls"><button class="guestbook-pause" id="guestbook-pause" type="button" hidden>暂停滚动</button></div>
    <form class="guestbook-form" id="guestbook-form">
      <label>你的名字<input name="name" maxlength="30" required autocomplete="name" placeholder="怎么称呼你"></label>
      <label>你想说的话<textarea name="message" maxlength="500" required placeholder="写下一段听歌或看演出的记忆"></textarea></label>
      <button class="guestbook-submit" type="submit">提交留言 ↗</button>
    </form>
    <p class="guestbook-status" id="guestbook-status" role="status" aria-live="polite"></p>
  `;
  wordsSection.append(guestbook);

  const track = guestbook.querySelector("#guestbook-track");
  const pauseButton = guestbook.querySelector("#guestbook-pause");
  const status = guestbook.querySelector("#guestbook-status");
  const form = guestbook.querySelector("#guestbook-form");
  const submitButton = form.querySelector("button[type='submit']");

  function makeCard(item) {
    const card = document.createElement("article");
    card.className = "guestbook-card";
    const head = document.createElement("div");
    head.className = "guestbook-card-head";
    const name = document.createElement("strong");
    name.className = "guestbook-card-name";
    name.textContent = item.name;
    const date = document.createElement("time");
    date.className = "guestbook-card-date";
    date.dateTime = item.created_at;
    date.textContent = new Date(item.created_at).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
    const message = document.createElement("p");
    message.className = "guestbook-card-message";
    message.textContent = item.message;
    head.append(name, date);
    card.append(head, message);
    return card;
  }

  async function loadMessages() {
    try {
      const query = "?select=id,name,message,created_at&order=created_at.desc&limit=200";
      const response = await fetch(`${API_URL}${query}`, {
        headers: { apikey: PUBLISHABLE_KEY }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const messages = await response.json();
      track.replaceChildren();
      if (!messages.length) {
        const empty = document.createElement("p");
        empty.className = "guestbook-empty";
        empty.textContent = "还没有展示的留言，欢迎留下第一则短笺。";
        track.append(empty);
        return;
      }
      const firstGroup = document.createElement("div");
      firstGroup.className = "guestbook-group";
      messages.forEach((item) => firstGroup.append(makeCard(item)));
      track.append(firstGroup);
      if (messages.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const secondGroup = firstGroup.cloneNode(true);
        secondGroup.setAttribute("aria-hidden", "true");
        track.append(secondGroup);
        track.classList.remove("is-static");
        track.style.setProperty("--guestbook-duration", `${Math.max(28, messages.length * 8)}s`);
        pauseButton.hidden = false;
      }
    } catch {
      track.replaceChildren();
      const error = document.createElement("p");
      error.className = "guestbook-empty";
      error.textContent = "留言暂时无法读取，请稍后刷新页面。";
      track.append(error);
    }
  }

  pauseButton.addEventListener("click", () => {
    const paused = track.classList.toggle("is-paused");
    pauseButton.textContent = paused ? "继续滚动" : "暂停滚动";
    pauseButton.setAttribute("aria-pressed", String(paused));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const message = form.elements.message.value.trim();
    if (!name || !message || name.length > 30 || message.length > 500) {
      status.textContent = "请填写名字（最多 30 字）和留言（最多 500 字）。";
      return;
    }
    submitButton.disabled = true;
    status.textContent = "正在提交…";
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          apikey: PUBLISHABLE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({ name, message })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      status.textContent = "提交成功。审核通过后，留言会出现在这里。";
    } catch {
      status.textContent = "提交失败，请稍后重试。";
    } finally {
      submitButton.disabled = false;
    }
  });

  loadMessages();
})();
