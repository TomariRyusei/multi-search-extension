export default defineBackground(() => {
  // chrome.runtime.onConnect.addListener((port) => {
  //   if (port.name === "popup") {
  //     port.onDisconnect.addListener(async () => {
  //       // ポップアップが閉じられた時に現在のタブに RESET_ALL を送信
  //       const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  //       if (tab?.id) {
  //         chrome.tabs.sendMessage(tab.id, { type: "RESET_ALL" });
  //       }
  //     });
  //   }
  // });

  console.log("Background script loaded");

  // アクションボタンクリック時にサイドパネルを開く
  chrome.action.onClicked.addListener((tab) => {
    console.log("Action button clicked");
    try {
      if (tab) {
        chrome.sidePanel.open({ windowId: tab.windowId });
      }
    } catch (error) {
      console.error("Failed to open side panel:", error);
    }
  });

  console.log("Action click listener registered");

  // タブが変更された時にサイドパネルの状態を維持
  // chrome.tabs.onActivated.addListener(async (activeInfo) => {
  //   try {
  //     await chrome.sidePanel.setOptions({
  //       tabId: activeInfo.tabId,
  //       enabled: true,
  //     });
  //   } catch (error) {
  //     console.error("Failed to set side panel options:", error);
  //   }
  // });

  // タブが更新された時もサイドパネルを有効に保つ
  // chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  //   if (changeInfo.status === "complete" && tab.url) {
  //     try {
  //       await chrome.sidePanel.setOptions({
  //         tabId: tabId,
  //         enabled: true,
  //       });
  //     } catch (error) {
  //       console.error("Failed to set side panel options on tab update:", error);
  //     }
  //   }
  // });
});
