export default defineBackground(() => {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "popup") {
      port.onDisconnect.addListener(async () => {
        // ポップアップが閉じられた時に現在のタブに RESET_ALL を送信
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: "RESET_ALL" });
        }
      });
    }
  });
});
