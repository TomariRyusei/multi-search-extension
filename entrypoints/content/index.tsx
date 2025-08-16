import { COLORS, FOCUSED_COLORS } from "../shared/colors";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    type SearchState = {
      matches: HTMLElement[];
      currentIndex: number;
    };

    const searches: Record<number, SearchState> = {};

    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      const { id, keyword, index, scroll } = msg.payload || {};

      if (msg.type === "SEARCH_TEXT") {
        sendResponse(highlightText(id, keyword, index, { scroll }));
      }

      if (msg.type === "NEXT_MATCH") {
        sendResponse(moveToNext(id, index));
      }

      if (msg.type === "PREV_MATCH") {
        sendResponse(moveToPrev(id, index));
      }

      if (msg.type === "RESET_ALL") {
        resetAll();
        sendResponse({ ok: true });
      }
    });

    function highlightText(id: number, keyword: string, index: number, opts?: { scroll?: boolean }) {
      // 既存のハイライト削除
      document.querySelectorAll(`mark.___highlight_${id}`).forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ""), el);
          parent.normalize();
        }
      });

      searches[id] = { matches: [], currentIndex: 0 };

      if (!keyword) {
        return { current: 0, total: 0 };
      }

      const regex = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
      walk(document.body, regex, id, index);

      if (searches[id].matches.length > 0) {
        searches[id].matches[0].classList.add(`___active_${id}`);
        searches[id].matches[0].style.backgroundColor = FOCUSED_COLORS[index];

        if (opts?.scroll !== false) {
          searches[id].matches[0].scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      return { current: searches[id].matches.length > 0 ? 1 : 0, total: searches[id].matches.length };
    }

    function walk(node: Node, regex: RegExp, id: number, index: number) {
      if (node.nodeType === 3) {
        const text = node.nodeValue || "";
        if (regex.test(text)) {
          const frag = document.createDocumentFragment();
          let lastIndex = 0;
          text.replace(regex, (match, _p1, offset) => {
            const before = text.slice(lastIndex, offset);
            if (before) frag.appendChild(document.createTextNode(before));

            const mark = document.createElement("mark");
            mark.textContent = match;
            mark.className = `___highlight_${id}`;
            mark.style.backgroundColor = COLORS[index];
            searches[id].matches.push(mark);
            frag.appendChild(mark);

            lastIndex = offset + match.length;
            return match;
          });

          const after = text.slice(lastIndex);
          if (after) frag.appendChild(document.createTextNode(after));

          node.parentNode?.replaceChild(frag, node);
        }
      } else if (node.nodeType === 1 && node.nodeName !== "SCRIPT" && node.nodeName !== "STYLE") {
        const element = node as HTMLElement;
        if (!isVisible(element)) return;

        [...node.childNodes].forEach((child) => walk(child, regex, id, index));
      }
    }

    function moveToNext(id: number, index: number) {
      const state = searches[id];
      if (!state || state.matches.length === 0) return { current: 0, total: 0 };

      // フォーカス解除された要素の色を元に戻す
      if (state.matches[state.currentIndex]) {
        state.matches[state.currentIndex].classList.remove(`___active_${id}`);
        state.matches[state.currentIndex].style.backgroundColor = COLORS[index];
      }

      state.matches[state.currentIndex]?.classList.remove(`___active_${id}`);
      state.currentIndex = (state.currentIndex + 1) % state.matches.length;
      state.matches[state.currentIndex].classList.add(`___active_${id}`);
      state.matches[state.currentIndex].style.backgroundColor = FOCUSED_COLORS[index];
      state.matches[state.currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });

      return { current: state.currentIndex + 1, total: state.matches.length };
    }

    function moveToPrev(id: number, index: number) {
      const state = searches[id];
      if (!state || state.matches.length === 0) return { current: 0, total: 0 };

      // フォーカス解除された要素の色を元に戻す
      if (state.matches[state.currentIndex]) {
        state.matches[state.currentIndex].classList.remove(`___active_${id}`);
        state.matches[state.currentIndex].style.backgroundColor = COLORS[index];
      }

      state.matches[state.currentIndex]?.classList.remove(`___active_${id}`);
      state.currentIndex = (state.currentIndex - 1 + state.matches.length) % state.matches.length;
      state.matches[state.currentIndex].classList.add(`___active_${id}`);
      state.matches[state.currentIndex].style.backgroundColor = FOCUSED_COLORS[index];
      state.matches[state.currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });

      return { current: state.currentIndex + 1, total: state.matches.length };
    }

    function resetAll() {
      Object.keys(searches).forEach((key) => {
        const id = Number(key);
        document.querySelectorAll(`mark.___highlight_${id}`).forEach((el) => {
          const parent = el.parentNode;
          if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent || ""), el);
            parent.normalize();
          }
        });
        delete searches[id];
      });
    }

    function isVisible(el: HTMLElement) {
      // display:none / visibility:hidden / opacity:0 は非表示とみなす
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        return false;
      }

      // 要素が画面上に描画されていない場合も除外
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return false;
      }

      return true;
    }

    function escapeRegExp(str: string) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  },
});
