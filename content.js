(() => {
  "use strict";

  const conversationPath = /^\/[^/]+\/[^/]+\/pull\/\d+\/?$/;
  const timelineItemSelector = ".js-discussion .js-timeline-item";
  const dateSelector = "relative-time[datetime], time[datetime]";
  const commentSelector = [
    ".js-comment",
    ".js-comment-container",
    ".timeline-comment",
    "[id^='issuecomment-']",
    "[id^='pullrequestreview-']",
  ].join(", ");

  const sourceOrder = new WeakMap();
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

    if (!itemInfo.some((info) => info.isComment)) {
      return;
    }

    itemInfo.sort(compareItems);
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

  function scheduleReorder() {
    if (sortQueued) {
      return;
    }

    sortQueued = true;
    window.requestAnimationFrame(() => {
      sortQueued = false;
      reorderTimelines();
    });
  }

  scheduleReorder();

  new MutationObserver(scheduleReorder).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
