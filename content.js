(() => {
  "use strict";

  const conversationPath = /^\/[^/]+\/[^/]+\/pull\/\d+\/?$/;
  const timelineItemSelector = ".js-discussion .js-timeline-item";
  const dateSelector = "relative-time[datetime], time[datetime]";
  const jumpControlsId = "pr-latest-first-jump-controls";
  const defaultSettings = {
    mode: "latest-first",
    showJumpControls: true,
  };
  const supportedModes = new Set(["latest-first", "start-at-bottom"]);
  const commentSelector = [
    ".js-comment",
    ".js-comment-container",
    ".timeline-comment",
    "[id^='issuecomment-']",
    "[id^='pullrequestreview-']",
  ].join(", ");

  const sourceOrder = new WeakMap();
  let settings = { ...defaultSettings };
  let settingsLoaded = false;
  let startedAtBottomKey = "";
  let nextSourceOrder = 0;
  let sortQueued = false;

  function isConversationPage() {
    return conversationPath.test(window.location.pathname);
  }

  function getSourceOrder(item) {
    if (!sourceOrder.has(item)) {
      sourceOrder.set(item, nextSourceOrder);
      nextSourceOrder += 1;
    }

    return sourceOrder.get(item);
  }

  function getLatestTimestamp(item) {
    let latestTimestamp = Number.NEGATIVE_INFINITY;

    for (const time of item.querySelectorAll(dateSelector)) {
      const timestamp = Date.parse(time.getAttribute("datetime"));

      if (Number.isFinite(timestamp) && timestamp > latestTimestamp) {
        latestTimestamp = timestamp;
      }
    }

    return latestTimestamp;
  }

  function getItemInfo(item) {
    return {
      item,
      isComment: Boolean(item.querySelector(commentSelector)),
      sourceOrder: getSourceOrder(item),
      timestamp: getLatestTimestamp(item),
    };
  }

  function compareItems(left, right) {
    if (left.isComment !== right.isComment) {
      return left.isComment ? -1 : 1;
    }

    if (!left.isComment) {
      return left.sourceOrder - right.sourceOrder;
    }

    if (left.timestamp !== right.timestamp) {
      return right.timestamp - left.timestamp;
    }

    return right.sourceOrder - left.sourceOrder;
  }

  function replaceItemOrder(parent, currentItems, sortedItems) {
    const orderChanged = sortedItems.some((item, index) => item !== currentItems[index]);

    if (!orderChanged) {
      return;
    }

    const anchor = document.createComment("github-pr-latest-comments-first");
    const fragment = document.createDocumentFragment();

    parent.insertBefore(anchor, currentItems[0]);

    for (const item of sortedItems) {
      fragment.appendChild(item);
    }

    anchor.replaceWith(fragment);
  }

  function reorderGroup(parent, items) {
    if (items.length < 2) {
      return;
    }

    const itemInfo = items.map(getItemInfo);

    if (settings.mode === "latest-first" && itemInfo.some((info) => info.isComment)) {
      itemInfo.sort(compareItems);
    } else {
      itemInfo.sort((left, right) => left.sourceOrder - right.sourceOrder);
    }

    replaceItemOrder(
      parent,
      items,
      itemInfo.map((info) => info.item),
    );
  }

  function getTimelineGroups() {
    const groups = new Map();

    for (const item of document.querySelectorAll(timelineItemSelector)) {
      const parent = item.parentElement;

      if (!parent) {
        continue;
      }

      if (!groups.has(parent)) {
        groups.set(parent, []);
      }

      groups.get(parent).push(item);
    }

    return groups;
  }

  function reorderTimelines() {
    if (!isConversationPage()) {
      return;
    }

    for (const [parent, items] of getTimelineGroups()) {
      reorderGroup(parent, items);
    }
  }

  function getPageBottom() {
    return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  }

  function scrollToEdge(edge, behavior = "smooth") {
    window.scrollTo({
      behavior,
      top: edge === "top" ? 0 : getPageBottom(),
    });
  }

  function getJumpIcon(edge) {
    if (edge === "top") {
      return `
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M5 3h14"></path>
          <path d="m18 13-6-6-6 6"></path>
          <path d="M12 7v14"></path>
        </svg>
      `;
    }

    return `
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 21h14"></path>
        <path d="m18 11-6 6-6-6"></path>
        <path d="M12 17V3"></path>
      </svg>
    `;
  }

  function createJumpButton(edge, label) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "pr-latest-first-jump-button";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.innerHTML = getJumpIcon(edge);
    button.addEventListener("click", () => scrollToEdge(edge));

    return button;
  }

  function createJumpControls() {
    const controls = document.createElement("nav");

    controls.id = jumpControlsId;
    controls.setAttribute("aria-label", "Pull request page jumps");
    controls.append(
      createJumpButton("top", "Go to top"),
      createJumpButton("bottom", "Go to bottom"),
    );

    return controls;
  }

  function syncJumpControls() {
    const controls = document.getElementById(jumpControlsId);

    if (!isConversationPage() || !settings.showJumpControls) {
      controls?.remove();
      return;
    }

    if (!controls && document.body) {
      document.body.appendChild(createJumpControls());
    }
  }

  function syncEntryPosition() {
    if (!isConversationPage() || settings.mode !== "start-at-bottom") {
      startedAtBottomKey = "";
      return;
    }

    const pageKey = window.location.pathname;

    if (startedAtBottomKey === pageKey) {
      return;
    }

    startedAtBottomKey = pageKey;
    scrollToEdge("bottom", "auto");
  }

  function syncPageEnhancements() {
    if (!settingsLoaded) {
      return;
    }

    reorderTimelines();
    syncJumpControls();
    syncEntryPosition();
  }

  function scheduleReorder() {
    if (sortQueued) {
      return;
    }

    sortQueued = true;
    window.requestAnimationFrame(() => {
      sortQueued = false;
      syncPageEnhancements();
    });
  }

  function normalizeSettings(storedSettings) {
    return {
      mode: supportedModes.has(storedSettings.mode)
        ? storedSettings.mode
        : defaultSettings.mode,
      showJumpControls: storedSettings.showJumpControls !== false,
    };
  }

  function loadSettings() {
    chrome.storage.sync.get(defaultSettings, (storedSettings) => {
      settings = normalizeSettings(storedSettings);
      settingsLoaded = true;
      scheduleReorder();
    });
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") {
      return;
    }

    const changedSettings = { ...settings };

    if (changes.mode) {
      changedSettings.mode = changes.mode.newValue;
    }

    if (changes.showJumpControls) {
      changedSettings.showJumpControls = changes.showJumpControls.newValue;
    }

    settings = normalizeSettings(changedSettings);
    startedAtBottomKey = "";
    scheduleReorder();
  });

  loadSettings();

  new MutationObserver(scheduleReorder).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
