(() => {
  const reader = document.getElementById("writings-reader");
  if (!reader) return;

  const contents = reader.querySelector("#writings-contents");
  const search = reader.querySelector("#writings-search");
  const status = reader.querySelector("#writings-status");
  const expand = reader.querySelector("#writings-expand");
  const collapse = reader.querySelector("#writings-collapse");
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
      const chapterNode = make("details", "writings-chapter");
      chapterNode.id = chapterId;
      const chapterSummary = make("summary", "writings-chapter-summary");
      const chapterTitle = make("span", "writings-chapter-title", chapter.title);
      chapterTitle.setAttribute("role", "heading");
      chapterTitle.setAttribute("aria-level", "4");
      chapterSummary.append(
        make("span", "writings-chapter-number", String(chapterIndex + 1).padStart(2, "0")),
        chapterTitle,
        make("span", "writings-chapter-count", `${chapter.entries.length} 篇`),
        make("span", "writings-chapter-icon", "+")
      );
      chapterNode.append(chapterSummary);
      const chapterEntries = make("div", "writings-chapter-entries");
      chapterNode.append(chapterEntries);

      chapter.entries.forEach(item => {
        const details = make("details", "writings-entry");
        details.dataset.search = `${chapter.title} ${item.heading} ${item.paragraphs.join(" ")}`.toLocaleLowerCase();
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
        chapterEntries.append(details);
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
        if (query && chapterVisible) chapter.open = true;
        visible += chapterVisible;
      });
      status.textContent = query ? `找到 ${visible} / ${entries.length} 篇文字` : `共 ${entries.length} 篇文字 · 先展开主题，再选择篇目`;
    }
    search.addEventListener("input", filter);
    expand.addEventListener("click", () => {
      contents.querySelectorAll(".writings-chapter:not([hidden])").forEach(chapter => { chapter.open = true; });
      entries.filter(entry => !entry.hidden).forEach(entry => { entry.open = true; });
    });
    collapse.addEventListener("click", () => {
      entries.forEach(entry => { entry.open = false; });
      contents.querySelectorAll(".writings-chapter").forEach(chapter => { chapter.open = false; });
    });
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
