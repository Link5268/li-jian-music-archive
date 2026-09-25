(() => {
  const reader = document.getElementById("writings-reader");
  if (!reader) return;

  const contents = reader.querySelector("#writings-contents");
  const topics = reader.querySelector("#writings-topics");
  const search = reader.querySelector("#writings-search");
  const status = reader.querySelector("#writings-status");
  const expand = reader.querySelector("#writings-expand");
  const collapse = reader.querySelector("#writings-collapse");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  };

  function parseMarkdown(source) {
    const chapters = [];
    let chapter = null;
    let entry = null;
    let series = "";

    for (const rawLine of source.replace(/\r\n/g, "\n").split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("# ")) continue;
      if (line.startsWith("## ")) {
        chapter = { title: line.slice(3), entries: [] };
        chapters.push(chapter);
        entry = null;
        series = "";
      } else if (line.startsWith("### ")) {
        if (!chapter) continue;
        const heading = line.slice(4);
        if (heading === "毛不易") {
          series = heading;
          entry = null;
        } else {
          series = "";
          entry = { heading, series, paragraphs: [] };
          chapter.entries.push(entry);
        }
      } else if (line.startsWith("#### ")) {
        if (!chapter) continue;
        entry = { heading: line.slice(5), series, paragraphs: [] };
        chapter.entries.push(entry);
      } else if (entry) {
        entry.paragraphs.push(line);
      }
    }
    return chapters;
  }

  function render(chapters) {
    let entryCount = 0;
    chapters.forEach((chapter, chapterIndex) => {
      const chapterId = `writings-chapter-${chapterIndex + 1}`;
      const chapterNode = make("section", "writings-chapter");
      chapterNode.id = chapterId;
      chapterNode.append(make("span", "writings-chapter-number", String(chapterIndex + 1).padStart(2, "0")));
      chapterNode.append(make("h4", "writings-chapter-title", chapter.title));
      chapterNode.append(make("p", "writings-chapter-count", `${chapter.entries.length} 篇文字`));

      const topic = make("button", "", chapter.title);
      topic.type = "button";
      topic.addEventListener("click", () => {
        chapterNode.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      });
      topics.append(topic);

      chapter.entries.forEach((item, index) => {
        const details = make("details", "writings-entry");
        details.dataset.search = `${chapter.title} ${item.heading} ${item.paragraphs.join(" ")}`.toLocaleLowerCase();
        if (chapterIndex === 0 && index === 0) details.open = true;
        const summary = make("summary", "writings-entry-summary");
        const title = make("span", "writings-entry-title", item.heading);
        const number = make("span", "writings-entry-number", String(++entryCount).padStart(2, "0"));
        summary.append(number, title, make("span", "writings-entry-icon", "+"));
        details.append(summary);
        const body = make("div", "writings-entry-body");
        if (item.series) body.append(make("span", "writings-series", item.series));
        item.paragraphs.forEach(paragraph => {
          body.append(make("p", paragraph === "〇" ? "writings-divider" : "", paragraph));
        });
        details.append(body);
        chapterNode.append(details);
      });
      contents.append(chapterNode);
    });

    const entries = [...contents.querySelectorAll(".writings-entry")];
    function filter() {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      contents.querySelectorAll(".writings-chapter").forEach(chapter => {
        let chapterVisible = 0;
        chapter.querySelectorAll(".writings-entry").forEach(entry => {
          const matches = !query || entry.dataset.search.includes(query);
          entry.hidden = !matches;
          if (matches) chapterVisible += 1;
        });
        chapter.hidden = chapterVisible === 0;
        visible += chapterVisible;
      });
      status.textContent = query ? `找到 ${visible} / ${entries.length} 篇文字` : `共 ${entries.length} 篇文字 · 选择标题展开阅读`;
    }
    search.addEventListener("input", filter);
    expand.addEventListener("click", () => entries.filter(entry => !entry.hidden).forEach(entry => { entry.open = true; }));
    collapse.addEventListener("click", () => entries.forEach(entry => { entry.open = false; }));
    filter();
  }

  fetch("content/li-jian-writings.md")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(text => render(parseMarkdown(text)))
    .catch(() => {
      status.textContent = "正文暂时无法载入，请刷新页面后重试。";
    });
})();
