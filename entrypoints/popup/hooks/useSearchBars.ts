import { useEffect, useState } from "react";
import { storage } from "#imports";

export type Count = { current: number; total: number };
export type SearchBarData = { id: number; keyword: string; count: Count };

export const createEmptyBar = (id: number): SearchBarData => ({
  id,
  keyword: "",
  count: { current: 0, total: 0 },
});

export function useSearchBars(sendMessage: (type: string, payload?: any) => Promise<any>) {
  const [bars, setBars] = useState<SearchBarData[]>([createEmptyBar(1)]);

  useEffect(() => {
    (async () => {
      const stored = await storage.getItem<SearchBarData[]>("local:searchHistory");
      if (stored) {
        setBars(stored);

        // 復元時はスクロールなしでハイライト
        stored.forEach((bar, index) => {
          if (bar.keyword) {
            sendMessage("SEARCH_TEXT", {
              id: bar.id,
              keyword: bar.keyword,
              index,
              scroll: false,
            });
          }
        });
      }
    })();
  }, []);

  // 共通更新関数（state + storage）
  const updateBars = (updater: (prev: SearchBarData[]) => SearchBarData[]) => {
    setBars((prev) => {
      const next = updater(prev);
      storage.setItem("local:searchHistory", next);
      return next;
    });
  };

  return { bars, updateBars };
}
