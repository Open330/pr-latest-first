(() => {
  "use strict";

  const defaultSettings = {
    mode: "latest-first",
    showJumpControls: true,
  };
  const supportedModes = new Set(["latest-first", "start-at-bottom"]);
  const form = document.getElementById("options-form");
  const status = document.getElementById("save-status");
  const controlsToggle = document.getElementById("show-jump-controls");
  let statusTimeout;

  function normalizeSettings(storedSettings) {
    return {
      mode: supportedModes.has(storedSettings.mode)
        ? storedSettings.mode
        : defaultSettings.mode,
      showJumpControls: storedSettings.showJumpControls !== false,
    };
  }

  function setStatus(message) {
    window.clearTimeout(statusTimeout);
    status.textContent = message;

    if (!message) {
      return;
    }

    statusTimeout = window.setTimeout(() => {
      status.textContent = "";
    }, 1800);
  }

  function renderSettings(storedSettings) {
    const settings = normalizeSettings(storedSettings);
    const modeInput = form.elements.namedItem("mode");

    modeInput.value = settings.mode;
    controlsToggle.checked = settings.showJumpControls;
  }

  function readFormSettings() {
    return normalizeSettings({
      mode: form.elements.namedItem("mode").value,
      showJumpControls: controlsToggle.checked,
    });
  }

  function restoreOptions() {
    chrome.storage.sync.get(defaultSettings, (storedSettings) => {
      renderSettings(storedSettings);
    });
  }

  function saveOptions() {
    chrome.storage.sync.set(readFormSettings(), () => {
      setStatus("Saved");
    });
  }

  form.addEventListener("change", saveOptions);
  restoreOptions();
})();
