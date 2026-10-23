(() => {
  const dialog = document.getElementById("stage-model-dialog");
  const frame = document.getElementById("stage-model-frame");
  const loading = document.getElementById("stage-model-loading");
  const closeButton = document.getElementById("stage-model-close");
  const newWindowLink = document.getElementById("stage-model-new-window");
  const triggers = document.querySelectorAll("[data-stage-model-open]");
  if (!dialog || !frame || !closeButton) return;

  let lastFocused = null;
  let hasLoaded = false;

  const pageRegions = [
    document.querySelector("main"),
    document.querySelector("footer"),
    document.querySelector(".topline")
  ].filter(Boolean);

  function openDialog() {
    lastFocused = document.activeElement;
    dialog.hidden = false;
    dialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("stage-model-open");
    pageRegions.forEach((region) => { region.inert = true; });

    if (!hasLoaded) {
      loading.classList.remove("is-hidden");
      frame.src = frame.dataset.src;
      hasLoaded = true;
    }

    window.setTimeout(() => closeButton.focus({ preventScroll: true }), 20);
  }

  function closeDialog() {
    dialog.hidden = true;
    dialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("stage-model-open");
    pageRegions.forEach((region) => { region.inert = false; });
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus({ preventScroll: true });
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", openDialog);
  });

  closeButton.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  frame.addEventListener("load", () => {
    loading.classList.add("is-hidden");
  });

  document.addEventListener("keydown", (event) => {
    if (dialog.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }

    if (event.key === "Tab") {
      const focusables = [closeButton, newWindowLink, frame].filter(Boolean);
      if (!focusables.length) return;
      const current = document.activeElement;
      if (event.shiftKey && (current === focusables[0] || !dialog.contains(current))) {
        event.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!event.shiftKey && current === focusables[focusables.length - 1]) {
        event.preventDefault();
        focusables[0].focus();
      }
    }
  });

  if (window.location.hash === "#stage-model") {
    window.setTimeout(openDialog, 500);
  }
})();
