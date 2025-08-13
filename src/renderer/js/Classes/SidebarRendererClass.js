class SidebarRenderer {
  /**
   * Creates an instance of SidebarRenderer.
   * @param {HTMLElement} container - The DOM element that will contain the sidebar.
   */
  constructor(props = { container: undefined, onSlideClickfn: undefined }) {
    this.container = props.container;
    this.onSlideClick = props.onSlideClickfn;
    console.log(`${this.constructor.name} initialized `);
  }

  _attachEventListeners() {
    this.container.addEventListener("change", (e) => {
      this.onSlideClick?.(e.target.dataset.slideId);
    });
  }

  #createSlideElement(slide, index) {
    const label = document.createElement("label");
    label.className = "slide-item";
    label.slideId = index;

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "slides";
    radio.id = "s" + index;
    radio.className = "visually-hidden";
    radio.dataset.slideId = index;

    const preview = document.createElement("div");
    preview.className = "slide-preview ratio-16x9 w-100";
    preview.style.height = "10rem";
    preview.dataset.slideId = index;

    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.innerText = "hide_image";
    preview.appendChild(icon);

    const num = document.createElement("span");
    num.className = "slide-number";
    num.innerText = index;
    preview.appendChild(num);

    const textPreview = document.createElement("div");
    textPreview.className = "slide-text-preview";
    textPreview.innerHTML = slide.text || "<em>Empty slide</em>";
    textPreview.dataset.slideId = index;

    const content = document.createElement("div");
    content.className = "slide-content";
    content.appendChild(textPreview);

    label.appendChild(radio);
    label.appendChild(preview);
    label.appendChild(content);

    return label;
  }

  #insertSlideElement(slideEl, index) {
    const beforeEl = this.container.children[index];
    this.container.insertBefore(slideEl, beforeEl || null);
    slideEl.querySelector("input").checked = true;
    this.rerenderAllSlideNumbers();
    slideEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  addSlideElement(slide, index) {
    const slideEl = this.#createSlideElement(slide, index);
    this.#insertSlideElement(slideEl, index);
    if (slide.videoFileName) {
      this.rerenderSlideThumbnail(index, slide);
    }
  }

  removeSlideElement(index, activeSlideIndex) {
    console.log("Sidebar before removal", [...this.container.children]);
    this.container.removeChild(this.container.children[index]);
    this.rerenderAllSlideNumbers(); // ✅ update after removal
    this.container.children[activeSlideIndex].querySelector(
      "input"
    ).checked = true;
  }

  rerenderSlideElementText(index, text) {
    console.log(this.container.children[index]);
    this.container.children[index].querySelector(
      ".slide-text-preview"
    ).innerText = text;
  }

  rerenderSlideThumbnail(index, slide) {
    this.container.children[index].querySelector(
      ".slide-preview"
    ).style.backgroundImage = `url('media://${slide.videoFileName}.${slide.videoThumbnailFormat}')`;
    this.container.children[index].querySelector(
      ".material-symbols-outlined"
    ).innerText = ``;
  }

  rerenderAllSlideNumbers() {
    Array.from(this.container.children).forEach((slideEl, i) => {
      const slidePreview = slideEl.querySelector(".slide-preview");
      if (slidePreview) slidePreview.dataset.slideId = i;
      const slideTextPreview = slideEl.querySelector(".slide-text-preview");
      if (slideTextPreview) slideTextPreview.dataset.slideId = i;
      const radioBtn = slideEl.querySelector("input");
      if (radioBtn) radioBtn.dataset.slideId = i;
      const numberSpan = slideEl.querySelector(".slide-number");
      if (numberSpan) numberSpan.innerText = i + 1;
    });
  }

  clear() {
    this.container.innerHTML = "";
  }
}
export default SidebarRenderer;
