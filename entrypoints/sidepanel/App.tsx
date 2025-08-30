import SearchBar from "./components/SearchBar";
import { COLORS } from "../shared/colors";
import { FaPlus } from "react-icons/fa6";
import { useSearchBars, createEmptyBar } from "./hooks/useSearchBars";

export default function SidePanelApp() {
  const sendMessage = async (type: string, payload?: any) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const res = await chrome.tabs.sendMessage(tab.id, { type, payload });
        return res;
      }
    } catch (error) {
      console.error("Message sending failed:", error);
      return null;
    }
  };

  const { bars, updateBars } = useSearchBars(sendMessage);

  const handleChange = async (id: number, value: string) => {
    const index = bars.findIndex((b) => b.id === id);
    const res = await sendMessage("SEARCH_TEXT", { id, keyword: value, index });
    if (res) {
      updateBars((prev) => prev.map((b) => (b.id === id ? { ...b, keyword: value, count: res ?? b.count } : b)));
    }
  };

  const handleNext = async (id: number) => {
    const index = bars.findIndex((b) => b.id === id);
    const res = await sendMessage("NEXT_MATCH", { id, index });
    if (res) {
      updateBars((prev) => prev.map((b) => (b.id === id ? { ...b, count: res } : b)));
    }
  };

  const handlePrev = async (id: number) => {
    const index = bars.findIndex((b) => b.id === id);
    const res = await sendMessage("PREV_MATCH", { id, index });
    if (res) {
      updateBars((prev) => prev.map((b) => (b.id === id ? { ...b, count: res } : b)));
    }
  };

  const handleClear = async (id: number) => {
    const index = bars.findIndex((b) => b.id === id);
    await sendMessage("SEARCH_TEXT", { id, keyword: "", index });

    if (bars.length === 1) {
      updateBars(() => [createEmptyBar(Date.now())]);
      return;
    }

    const newBars = bars.filter((b) => b.id !== id);
    // 削除後に新しい検索バーで再度検索(ハイライト色のズレ防止)
    newBars.forEach(async (b, index) => {
      await sendMessage("SEARCH_TEXT", { id: b.id, keyword: b.keyword, index });
    });

    updateBars(() => newBars);
  };

  const addBar = () => {
    if (bars.length < 5) {
      updateBars((prev) => [...prev, createEmptyBar(Date.now())]);
    }
  };

  const isMaxReached = bars.length >= 5;

  return (
    <div className="bg-[#2b2b2b] min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <h1 className="text-white text-lg font-bold mb-2">Multiple Search Extension</h1>
          <p className="text-gray-400 text-sm">Search for multiple terms simultaneously on the current page.</p>
        </div>

        <div className="space-y-3 mb-4">
          {bars.map((bar, index) => (
            <SearchBar
              key={bar.id}
              id={bar.id}
              keyword={bar.keyword}
              color={COLORS[index]}
              count={bar.count}
              onChange={handleChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onClear={handleClear}
            />
          ))}
        </div>

        <button
          onClick={addBar}
          disabled={isMaxReached}
          title={isMaxReached ? "Maximum 5 search bars allowed" : "Add new search bar"}
          className={`w-full p-3 rounded-lg text-white text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            isMaxReached
              ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
              : "bg-[#4caf50] cursor-pointer hover:bg-[#45a049]"
          }`}
        >
          <FaPlus /> Add Search Bar ({bars.length}/5)
        </button>

        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="text-gray-400 text-xs space-y-1">
            <div>• Each search term gets a different highlight color</div>
            <div>• Use ◀ ▶ buttons to navigate between matches</div>
            <div>• Click ✕ to clear a search</div>
            <div>• Maximum of 5 search bars allowed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
