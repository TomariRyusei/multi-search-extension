import { COLORS, FOCUSED_COLORS } from "../shared/colors";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    const textHighlighter = new TextHighlighter();

    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      const { id, keyword, index, scroll } = msg.payload || {};

      switch (msg.type) {
        case "SEARCH_TEXT":
          sendResponse(textHighlighter.highlightText(id, keyword, index, { scroll }));
          break;
        case "NEXT_MATCH":
          sendResponse(textHighlighter.moveToNext(id, index));
          break;
        case "PREV_MATCH":
          sendResponse(textHighlighter.moveToPrevious(id, index));
          break;
        case "RESET_ALL":
          textHighlighter.resetAll();
          sendResponse({ ok: true });
          break;
      }
    });
  },
});

interface SearchState {
  matches: HTMLElement[];
  currentIndex: number;
}

interface HighlightResult {
  current: number;
  total: number;
}

interface HighlightOptions {
  scroll?: boolean;
}

class TextHighlighter {
  private searches: Record<number, SearchState> = {};

  /**
   * テキストをハイライトし、検索状態を初期化する
   */
  public highlightText(id: number, keyword: string, index: number, opts?: HighlightOptions): HighlightResult {
    // 既存のハイライトを削除
    this.clearHighlights(id);

    // 検索状態を初期化
    this.searches[id] = { matches: [], currentIndex: 0 };

    if (!keyword) {
      return { current: 0, total: 0 };
    }

    // テキストを検索してハイライト
    const regex = new RegExp(`(${this.escapeRegExp(keyword)})`, "gi");
    this.walkAndHighlight(document.body, regex, id, index);

    // 最初のマッチにフォーカスを設定
    if (this.searches[id].matches.length > 0) {
      this.setFocus(id, index, 0);

      if (opts?.scroll !== false) {
        this.scrollToMatch(id, 0);
      }
    }

    return {
      current: this.searches[id].matches.length > 0 ? 1 : 0,
      total: this.searches[id].matches.length,
    };
  }

  /**
   * 次のマッチに移動
   */
  public moveToNext(id: number, index: number): HighlightResult {
    return this.move(id, index, 1);
  }

  /**
   * 前のマッチに移動
   */
  public moveToPrevious(id: number, index: number): HighlightResult {
    return this.move(id, index, -1);
  }

  /**
   * 指定方向にマッチを移動
   */
  private move(id: number, index: number, direction: 1 | -1): HighlightResult {
    const search = this.searches[id];
    if (!search || search.matches.length === 0) {
      return { current: 0, total: 0 };
    }

    // 現在のフォーカスを外す
    this.removeFocus(id, index, search.currentIndex);

    // 次のインデックスを計算
    search.currentIndex = (search.currentIndex + direction + search.matches.length) % search.matches.length;

    // 新しい要素にフォーカスを設定
    this.setFocus(id, index, search.currentIndex);
    this.scrollToMatch(id, search.currentIndex);

    return {
      current: search.currentIndex + 1,
      total: search.matches.length,
    };
  }

  /**
   * 全てのハイライトをリセット
   */
  public resetAll(): void {
    Object.keys(this.searches).forEach((key) => {
      const id = Number(key);
      this.clearHighlights(id);
      delete this.searches[id];
    });
  }

  /**
   * DOM要素を再帰的に探索してテキストをハイライト
   */
  private walkAndHighlight(node: Node, regex: RegExp, id: number, index: number): void {
    if (node.nodeType === Node.TEXT_NODE) {
      this.highlightTextNode(node, regex, id, index);
    } else if (node.nodeType === Node.ELEMENT_NODE && this.isProcessableElement(node as HTMLElement)) {
      const element = node as HTMLElement;
      if (this.isVisible(element)) {
        [...node.childNodes].forEach((child) => this.walkAndHighlight(child, regex, id, index));
      }
    }
  }

  /**
   * テキストノードをハイライト
   */
  private highlightTextNode(node: Node, regex: RegExp, id: number, index: number): void {
    const text = node.nodeValue || "";
    if (!regex.test(text)) return;

    const frag = document.createDocumentFragment();
    let lastIndex = 0;

    text.replace(regex, (match, _p1, offset) => {
      // マッチ前のテキスト
      const before = text.slice(lastIndex, offset);
      if (before) {
        frag.appendChild(document.createTextNode(before));
      }

      // マッチしたテキストをハイライト
      const mark = this.createHighlightElement(match, id, index);
      this.searches[id].matches.push(mark);
      frag.appendChild(mark);

      lastIndex = offset + match.length;
      return match;
    });

    // マッチ後のテキスト
    const after = text.slice(lastIndex);
    if (after) {
      frag.appendChild(document.createTextNode(after));
    }

    node.parentNode?.replaceChild(frag, node);
  }

  /**
   * ハイライト要素を作成
   */
  private createHighlightElement(text: string, id: number, index: number): HTMLElement {
    const mark = document.createElement("mark");
    mark.textContent = text;
    mark.className = `___highlight_${id}`;
    mark.style.backgroundColor = COLORS[index];
    return mark;
  }

  /**
   * 要素が処理可能かどうかを判定
   */
  private isProcessableElement(element: HTMLElement): boolean {
    const excludedTags = ["SCRIPT", "STYLE"];
    return !excludedTags.includes(element.nodeName);
  }

  /**
   * 要素が表示されているかどうかを判定
   */
  private isVisible(el: HTMLElement): boolean {
    const style = window.getComputedStyle(el);

    // display:none / visibility:hidden / opacity:0 は非表示とみなす
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

  /**
   * 指定されたIDのハイライトを削除
   */
  private clearHighlights(id: number): void {
    document.querySelectorAll(`mark.___highlight_${id}`).forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
        parent.normalize();
      }
    });
  }

  /**
   * 指定されたマッチにフォーカスを設定
   */
  private setFocus(id: number, index: number, matchIndex: number): void {
    const search = this.searches[id];
    if (search && search.matches[matchIndex]) {
      search.matches[matchIndex].style.backgroundColor = FOCUSED_COLORS[index];
    }
  }

  /**
   * 指定されたマッチからフォーカスを外す
   */
  private removeFocus(id: number, index: number, matchIndex: number): void {
    const search = this.searches[id];
    if (search && search.matches[matchIndex]) {
      search.matches[matchIndex].style.backgroundColor = COLORS[index];
    }
  }

  /**
   * 指定されたマッチまでスクロール
   */
  private scrollToMatch(id: number, matchIndex: number): void {
    const search = this.searches[id];
    if (search && search.matches[matchIndex]) {
      search.matches[matchIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  /**
   * 正規表現用の文字列をエスケープ
   */
  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
