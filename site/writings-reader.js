(() => {
  const reader = document.getElementById("writings-reader");
  if (!reader) return;

  const topics = [
    { start: 1, label: "合唱与音乐" },
    { start: 4, label: "书与画" },
    { start: 6, label: "同行的人" },
    { start: 10, label: "诗歌与阅读" },
    { start: 16, label: "文字与唱片" },
    { start: 22, label: "歌曲与寄语" },
    { start: 26, label: "毛不易" },
    { start: 29, label: "电影与影像" }
  ];
  const total = 30;
  const topicButtons = reader.querySelector("#writings-topics");
  const pageSelect = reader.querySelector("#writings-page-select");
  const title = reader.querySelector("#writings-page-title");
  const pageLink = reader.querySelector("#writings-page-link");
  const pageImage = reader.querySelector("#writings-page-image");
  const counter = reader.querySelector("#writings-counter");
  const previous = reader.querySelector("#writings-prev");
  const next = reader.querySelector("#writings-next");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let page = 1;

  const pad = number => String(number).padStart(2, "0");
  const imagePath = number => `assets/writings/${pad(number)}.jpg`;
  const topicAt = number => [...topics].reverse().find(topic => topic.start <= number) || topics[0];

  for (let number = 1; number <= total; number += 1) {
    const option = document.createElement("option");
    option.value = String(number);
    option.textContent = `${pad(number)} / ${topicAt(number).label}`;
    pageSelect.append(option);
  }

  for (const topic of topics) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.start = String(topic.start);
    button.textContent = topic.label;
    button.addEventListener("click", () => showPage(topic.start, true));
    topicButtons.append(button);
  }

  function showPage(number, scrollToPage = false) {
    page = Math.min(total, Math.max(1, Number(number) || 1));
    const topic = topicAt(page);
    const source = imagePath(page);
    pageImage.src = source;
    pageImage.alt = `李健文字整理图，第 ${page} 页，${topic.label}。点开可放大阅读原图。`;
    pageLink.href = source;
    pageLink.setAttribute("aria-label", `放大阅读第 ${page} 页原图`);
    title.textContent = `${topic.label} · 第 ${pad(page)} 页`;
    counter.textContent = `${pad(page)} / ${total}`;
    pageSelect.value = String(page);
    previous.disabled = page === 1;
    next.disabled = page === total;
    topicButtons.querySelectorAll("button").forEach(button => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.start) === topic.start));
    });
    if (page < total) {
      const preload = new Image();
      preload.src = imagePath(page + 1);
    }
    if (scrollToPage) {
      pageLink.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    }
  }

  pageSelect.addEventListener("change", () => showPage(pageSelect.value, true));
  previous.addEventListener("click", () => showPage(page - 1, true));
  next.addEventListener("click", () => showPage(page + 1, true));
  showPage(1);
})();
