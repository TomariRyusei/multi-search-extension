export default defineBackground(() => {
  // アクションボタンクリック時にサイドパネルを開く
  chrome.action.onClicked.addListener((tab) => {
    if (!tab?.windowId) {
      console.warn("Invalid tab or windowId");
      return;
    }

    try {
      const windowId = tab.windowId;
      chrome.sidePanel.open({ windowId });
    } catch (error) {
      console.error("Failed to open side panel:", error);
    }
  });
});
