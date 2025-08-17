import { useEffect } from "react";

import SearchBar from "./components/SearchBar";
import { COLORS } from "../shared/colors";
import { FaPlus } from "react-icons/fa6";
import { useSearchBars, createEmptyBar } from "./hooks/useSearchBars";

export default function Popup() {
  useEffect(() => {
    const port = chrome.runtime.connect({ name: "popup" });

    return () => port.disconnect();
  }, []);

  const sendMessage = async (type: string, payload?: any) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      const res = await chrome.tabs.sendMessage(tab.id, { type, payload });
      return res;
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

    const cleared = bars.filter((b) => b.id !== id);
    updateBars(() => cleared);
  };

  const addBar = () => {
    if (bars.length < 5) {
      updateBars((prev) => [...prev, createEmptyBar(Date.now())]);
    }
  };

  return (
    <div className="bg-[#2b2b2b] p-3 rounded-lg min-w-[300px]">
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
      {bars.length < 5 && (
        <button
          onClick={addBar}
          className="w-full p-2.5 rounded-lg bg-[#4caf50] text-white cursor-pointer text-sm font-bold flex items-center justify-center gap-1 hover:bg-[#45a049]"
        >
          <FaPlus /> Add Search Bar
        </button>
      )}
    </div>
  );
}
