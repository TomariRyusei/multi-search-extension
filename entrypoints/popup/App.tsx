import { useState, useEffect, use } from "react";
import SearchBar from "./components/SearchBar";
import { COLORS } from "../shared/colors";
import { FaPlus } from "react-icons/fa6";

import { storage } from "#imports";

type Count = { current: number; total: number };

type SearchBarData = {
  id: number;
  keyword: string;
  count: Count;
};

export default function Popup() {
  const [bars, setBars] = useState<SearchBarData[]>([{ id: 1, keyword: "", count: { current: 0, total: 0 } }]);

  useEffect(() => {
    (async () => {
      const stored = await storage.getItem<SearchBarData[]>("local:searchHistory");
      if (stored) {
        setBars(stored);

        stored.forEach(async (bar, index) => {
          if (bar.keyword) {
            const res = await sendMessage("SEARCH_TEXT", {
              id: bar.id,
              keyword: bar.keyword,
              index,
              scroll: false,
            });

            if (res) {
              setBars((prev) => prev.map((b) => (b.id === bar.id ? { ...b, count: res } : b)));
            }
          }
        });
      } else {
        setBars([{ id: 1, keyword: "", count: { current: 0, total: 0 } }]);
      }
    })();
  }, []);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: "popup" });

    return () => {
      // 閉じられた時に接続を切る
      port.disconnect();
    };
  }, []);

  const sendMessage = async (type: string, payload?: any) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      const res = await chrome.tabs.sendMessage(tab.id, { type, payload });
      return res;
    }
  };

  const handleChange = async (id: number, value: string) => {
    setBars((prev) => prev.map((b) => (b.id === id ? { ...b, keyword: value } : b)));
    const index = bars.findIndex((b) => b.id === id);
    const res = await sendMessage("SEARCH_TEXT", { id, keyword: value, index });
    if (res) {
      setBars((prev) => prev.map((b) => (b.id === id ? { ...b, count: res } : b)));
    }

    storage.setItem(
      "local:searchHistory",
      bars.map((b) => (b.id === id ? { ...b, keyword: value, count: res ?? b.count } : b))
    );
  };

  const handleNext = async (id: number) => {
    const index = bars.findIndex((b) => b.id === id);
    const res = await sendMessage("NEXT_MATCH", { id, index });
    if (res) {
      setBars((prev) => prev.map((b) => (b.id === id ? { ...b, count: res } : b)));
    }
  };

  const handlePrev = async (id: number) => {
    const index = bars.findIndex((b) => b.id === id);
    const res = await sendMessage("PREV_MATCH", { id, index });
    if (res) {
      setBars((prev) => prev.map((b) => (b.id === id ? { ...b, count: res } : b)));
    }
  };

  const handleClear = async (id: number) => {
    const index = bars.findIndex((b) => b.id === id);
    await sendMessage("SEARCH_TEXT", { id, keyword: "", index });

    if (bars.length === 1) {
      setBars([{ id: 1, keyword: "", count: { current: 0, total: 0 } }]);
      return;
    }

    setBars((prev) => prev.filter((b) => b.id !== id));
  };

  const addBar = () => {
    if (bars.length < 5) {
      setBars((prev) => [...prev, { id: Date.now(), keyword: "", count: { current: 0, total: 0 } }]);
    }
  };

  return (
    <div style={{ background: "#2b2b2b", padding: "10px", borderRadius: "8px", minWidth: "300px" }}>
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
          style={{
            width: "100%",
            padding: "6px",
            border: "none",
            borderRadius: "8px",
            background: "#4caf50",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <FaPlus /> 検索バー追加
        </button>
      )}
    </div>
  );
}
