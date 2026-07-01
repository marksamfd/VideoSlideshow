export interface LyricRendererConfig {
  lyricsContainer: HTMLUListElement;
  onLyricClickCallback?: (lyricIdx: number) => void;
}
export default class LyricRenderer {
  container: HTMLUListElement;
  onLyricClick: (lyricIdx: number) => void;
  constructor(parameters: LyricRendererConfig) {
    this.container = parameters.lyricsContainer;
    this.onLyricClick = parameters.onLyricClickCallback;
  }

  _attachEventListeners() {
    this.container.addEventListener("click", (e) => {
      const target = e.target as HTMLLIElement | null;
      console.log(target);
      const lyricIdx = target?.dataset.lyricIdx
        ? Number(target.dataset.lyricIdx)
        : undefined;
      this.onLyricClick?.(lyricIdx);
      this.heighlightLyric(lyricIdx);
    });
  }

  createLyricsPreview(lyricsLines: string[]) {
    return lyricsLines.map((line, i) => {
      let liEl = document.createElement("li");
      liEl.textContent = line;
      liEl.dataset.lyricIdx = String(i);
      liEl.dir = "rtl";
      return liEl;
    });
  }

  renderLyricsPreview(lyricsLines: string[]) {
    let lyricsElements = this.createLyricsPreview(lyricsLines);
    this.container.replaceChildren(...lyricsElements);
  }

  heighlightLyric(idx: number) {
    this.container
      .querySelector(".active-text-slide")
      ?.classList.remove("active-text-slide");
    this.container.children[idx].classList.add("active-text-slide");
  }
}
