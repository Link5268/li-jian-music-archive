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
    .guestbook-window { position: relative; overflow-x: auto; overflow-y: hidden; margin-top: 26px; padding-bottom: 10px; overscroll-behavior-x: contain; scroll-behavior: auto; scrollbar-color: rgba(205,187,150,.6) rgba(255,255,255,.08); scrollbar-width: thin; cursor: grab; }
    .guestbook-window:focus-visible { outline: 1px solid rgba(205,187,150,.65); outline-offset: 4px; }
    .guestbook-window.is-dragging { cursor: grabbing; user-select: none; }
    .guestbook-track, .guestbook-track.is-static { display: flex; align-items: start; width: max-content; gap: 16px; }
    .guestbook-group { display: grid; grid-auto-flow: column; grid-template-rows: repeat(2, minmax(172px, auto)); grid-auto-columns: 270px; gap: 16px; }
    .guestbook-card { box-sizing: border-box; display: flex; min-width: 0; flex-direction: column; min-height: 172px; padding: 22px 24px; border: 1px solid rgba(185,154,100,.28); background: rgba(255,255,255,.035); }
    .guestbook-card-head { display: flex; justify-content: space-between; gap: 15px; align-items: baseline; margin-bottom: 18px; }
    .guestbook-card-name { color: #d8c49b; font: 15px/1.4 var(--serif, serif); }
    .guestbook-card-date { flex: 0 0 auto; color: #91a1aa; font: 10px/1.4 var(--sans, sans-serif); }
    .guestbook-card-message { margin: 0; color: #ece8df; font: 15px/1.75 var(--serif, serif); overflow-wrap: anywhere; white-space: pre-wrap; }
    .guestbook-empty { width: 100%; padding: 28px 0; color: #aebbc3; text-align: center; font: 13px/1.7 var(--sans, sans-serif); }
    .guestbook-form { display: grid; grid-template-columns: minmax(140px,1fr) minmax(220px,2.6fr) auto; gap: 12px; align-items: start; margin-top: 44px; }
    .guestbook-form label { display: grid; gap: 9px; color: #bdc8ca; font: 11px/1.5 var(--sans, sans-serif); letter-spacing: .12em; }
    .guestbook-form input, .guestbook-form textarea { box-sizing: border-box; width: 100%; min-height: 48px; padding: 13px 14px; border: 1px solid rgba(236,232,223,.3); border-radius: 0; outline: none; color: #ece8df; background: rgba(255,255,255,.04); font: 14px/1.5 var(--sans, sans-serif); letter-spacing: 0; }
    .guestbook-form textarea { height: 48px; resize: vertical; }
    .guestbook-form input:focus, .guestbook-form textarea:focus { border-color: #b99a64; }
    .guestbook-submit { align-self: end; min-height: 48px; padding: 0 22px; border: 1px solid #b99a64; border-radius: 0; color: #101c2c; background: #cdbb96; cursor: pointer; font: 12px/1.4 var(--sans, sans-serif); }
    .guestbook-submit:disabled { opacity: .55; cursor: wait; }
    .guestbook-status { min-height: 23px; margin: 10px 0 0; color: #d8c49b; font: 12px/1.7 var(--sans, sans-serif); }
    @media (max-width: 720px) {
      .guestbook { margin-top: 62px; }
      .guestbook-heading { display: block; }
      .guestbook-hint { margin-top: 9px; }
      .guestbook-form { grid-template-columns: 1fr; }
      .guestbook-submit { width: 100%; }
      .guestbook-group { grid-auto-columns: min(78vw, 280px); }
      .guestbook-kicker,.guestbook-card-date,.guestbook-form label,.guestbook-status { font-size: 12px; }
      .guestbook-hint { font-size: 13px; }
      .guestbook-form input,.guestbook-form textarea { font-size: 16px; }
      .guestbook-submit { font-size: 14px; }
    }
    @media (max-width: 720px) {
      .guestbook-window::-webkit-scrollbar { height: 5px; }
      .guestbook-window::-webkit-scrollbar-thumb { border-radius: 5px; background: rgba(205,187,150,.6); }
      .guestbook-window::-webkit-scrollbar-track { background: rgba(255,255,255,.08); }
    }
    @media (prefers-reduced-motion: reduce) {
      .guestbook-window { scroll-behavior: auto; }
    }
  `;
  document.head.append(style);

  const guestbook = document.createElement("div");
  guestbook.className = "guestbook";
  guestbook.innerHTML = `
    <div class="guestbook-heading">
      <div><span class="guestbook-kicker">VISITOR NOTES / 来访者留声</span><h3>留下你的短笺</h3></div>
      <p class="guestbook-hint">留言经审核后展示 · 自动缓慢滑动，悬停暂停后可拖动浏览</p>
    </div>
    <div class="guestbook-window" tabindex="0" aria-label="已审核的访客留言，可左右滑动查看更多">
      <div class="guestbook-track is-static" id="guestbook-track"><p class="guestbook-empty">正在读取留言…</p></div>
    </div>
    <form class="guestbook-form" id="guestbook-form">
      <label>你的名字<input name="name" maxlength="30" required autocomplete="name" placeholder="怎么称呼你"></label>
      <label>你想说的话<textarea name="message" maxlength="500" required placeholder="写下一段听歌或看演出的记忆"></textarea></label>
      <button class="guestbook-submit" type="submit">提交留言 ↗</button>
    </form>
    <p class="guestbook-status" id="guestbook-status" role="status" aria-live="polite"></p>
  `;
  wordsSection.append(guestbook);

  const track = guestbook.querySelector("#guestbook-track");
  const guestbookWindow = guestbook.querySelector(".guestbook-window");
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
      if (messages.length > 1) setupAutoplay(firstGroup);
    } catch {
      track.replaceChildren();
      const error = document.createElement("p");
      error.className = "guestbook-empty";
      error.textContent = "留言暂时无法读取，请稍后刷新页面。";
      track.append(error);
    }
  }

  function setupAutoplay(firstGroup) {
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let hovered = false;
    let focused = false;
    let interacting = false;
    let resumeAfter = 0;
    let dragStart = null;

    function configure() {
      cancelAnimationFrame(animationFrame);
      track.querySelectorAll("[data-guestbook-clone]").forEach((clone) => clone.remove());
      guestbookWindow.scrollLeft = 0;

      const groupWidth = firstGroup.getBoundingClientRect().width;
      if (reducedMotion.matches) return;

      const trackGap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const cycleWidth = groupWidth + trackGap;
      const copiesNeeded = Math.ceil((guestbookWindow.clientWidth + cycleWidth) / cycleWidth);
      for (let index = 0; index < copiesNeeded; index += 1) {
        const clone = firstGroup.cloneNode(true);
        clone.dataset.guestbookClone = "true";
        clone.setAttribute("aria-hidden", "true");
        track.append(clone);
      }

      let previousTime = 0;
      function animate(time) {
        if (!previousTime) previousTime = time;
        const elapsed = Math.min(time - previousTime, 50);
        previousTime = time;
        const isPaused = hovered || focused || interacting || time < resumeAfter || document.hidden;
        if (!isPaused) {
          guestbookWindow.scrollLeft += elapsed * 0.018;
          if (guestbookWindow.scrollLeft >= cycleWidth) {
            guestbookWindow.scrollLeft -= cycleWidth;
          }
        }
        animationFrame = requestAnimationFrame(animate);
      }
      animationFrame = requestAnimationFrame(animate);
    }

    guestbookWindow.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") hovered = true;
    });
    guestbookWindow.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") hovered = false;
    });
    guestbookWindow.addEventListener("pointerdown", (event) => {
      interacting = true;
      if (event.pointerType === "mouse" && event.button === 0) {
        dragStart = { x: event.clientX, scrollLeft: guestbookWindow.scrollLeft };
        guestbookWindow.setPointerCapture(event.pointerId);
      }
    });
    guestbookWindow.addEventListener("pointermove", (event) => {
      if (!dragStart) return;
      const distance = event.clientX - dragStart.x;
      if (Math.abs(distance) > 3) guestbookWindow.classList.add("is-dragging");
      if (guestbookWindow.classList.contains("is-dragging")) {
        guestbookWindow.scrollLeft = dragStart.scrollLeft - distance;
      }
    });
    const finishInteraction = () => {
      interacting = false;
      dragStart = null;
      guestbookWindow.classList.remove("is-dragging");
      resumeAfter = performance.now() + 1800;
    };
    guestbookWindow.addEventListener("pointerup", finishInteraction);
    guestbookWindow.addEventListener("pointercancel", finishInteraction);
    guestbookWindow.addEventListener("wheel", () => {
      resumeAfter = performance.now() + 1800;
    }, { passive: true });
    guestbookWindow.addEventListener("focusin", () => {
      focused = true;
    });
    guestbookWindow.addEventListener("focusout", (event) => {
      if (!guestbookWindow.contains(event.relatedTarget)) focused = false;
    });

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(configure);
      observer.observe(guestbookWindow);
      observer.observe(firstGroup);
    } else {
      window.addEventListener("resize", configure);
    }
    reducedMotion.addEventListener?.("change", configure);
    configure();
  }

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
