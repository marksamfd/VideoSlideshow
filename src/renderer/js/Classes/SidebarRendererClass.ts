export type SidebarRendererProps = {
  sidebarSlidesContainer: HTMLElement;
  onSlideClickfn?: (slideId: string) => void;
};

type SidebarSlide = {
  text?: string;
  videoFileName?: string;
  videoThumbnailFormat?: string;
};

class SidebarRenderer {
  container: HTMLElement;
  onSlideClick?: (slideId: string) => void;

  /**
   * Creates an instance of SidebarRenderer.
   * @param props - Sidebar renderer configuration.
   */
  constructor(props: SidebarRendererProps) {
    this.container = props.sidebarSlidesContainer;
    this.onSlideClick = props.onSlideClickfn;
    console.log(`${this.constructor.name} initialized `);
  }

  _attachEventListeners() {
    this.container.addEventListener("change", (e: Event) => {
      const target = e.target as HTMLElement | null;
      const slideId = target?.dataset?.slideId;
      if (slideId !== undefined) {
        this.onSlideClick?.(slideId);
      }
    });
  }

  #createSlideElement(slide: SidebarSlide, index: number): HTMLLabelElement {
    const label = document.createElement("label");
    label.className = "slide-item";
    label.dataset.slideId = String(index);

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "slides";
    radio.id = `s${index}`;
    radio.className = "visually-hidden";
    radio.dataset.slideId = String(index);

    const preview = document.createElement("div");
    preview.className = "slide-preview ratio-16x9 w-100";
    preview.style.height = "10rem";
    preview.dataset.slideId = String(index);

    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.innerText = "hide_image";
    preview.appendChild(icon);

    const num = document.createElement("span");
    num.className = "slide-number";
    num.innerText = String(index);
    preview.appendChild(num);

    const textPreview = document.createElement("div");
    textPreview.className = "slide-text-preview";
    textPreview.innerHTML = slide.text || "<em>Empty slide</em>";
    textPreview.dataset.slideId = String(index);

    const content = document.createElement("div");
    content.className = "slide-content";
    content.appendChild(textPreview);

    label.appendChild(radio);
    label.appendChild(preview);
    label.appendChild(content);

    return label;
  }

  #insertSlideElement(slideEl: HTMLLabelElement, index: number) {
    const beforeEl = this.container.children[index];
    this.container.insertBefore(slideEl, beforeEl || null);
    this.rerenderAllSlideNumbers();
    slideEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  setCurrentSlide(index: number) {
    const slideEl = this.container.children[index] as HTMLElement | undefined;
    if (!slideEl) return;

    Array.from(this.container.querySelectorAll('input[type="radio"]')).forEach(
      (radioBtn) => {
        (radioBtn as HTMLInputElement).checked = false;
      },
    );

    const radioBtn = slideEl.querySelector("input") as HTMLInputElement | null;
    if (!radioBtn) return;

    radioBtn.checked = true;
    slideEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  addSlideElement(slide: SidebarSlide, index: number, shouldSelect = false) {
    const slideEl = this.#createSlideElement(slide, index);
    this.#insertSlideElement(slideEl, index);
    if (shouldSelect) {
      this.setCurrentSlide(index);
    }
    if (slide.videoFileName) {
      this.rerenderSlideThumbnail(index, slide);
    }
  }

  removeSlideElement(index: number, activeSlideIndex: number) {
    console.log("Sidebar before removal", [...this.container.children]);
    const toRemove = this.container.children[index];
    if (!toRemove) return;

    this.container.removeChild(toRemove);
    this.rerenderAllSlideNumbers();

    const activeInput = this.container.children[activeSlideIndex]?.querySelector(
      "input",
    ) as HTMLInputElement | null;
    if (activeInput) {
      activeInput.checked = true;
    }
  }

  rerenderSlideElementText(index: number, text: string) {
    const textPreview = this.container.children[index]?.querySelector(
      ".slide-text-preview",
    ) as HTMLElement | null;
    if (textPreview) {
      textPreview.innerText = text;
    }
  }

  rerenderSlideThumbnail(index: number, slide: SidebarSlide | null | undefined) {
    const preview = this.container.children[index]?.querySelector(
      ".slide-preview",
    ) as HTMLElement | null;
    if (preview && slide?.videoFileName && slide?.videoThumbnailFormat) {
      preview.style.backgroundImage = `url('media://local/${slide.videoFileName}.${slide.videoThumbnailFormat}')`;
    }

    const icon = this.container.children[index]?.querySelector(
      ".material-symbols-outlined",
    ) as HTMLElement | null;
    if (icon) {
      icon.innerText = "";
    }
  }

  rerenderAllSlideNumbers() {
    Array.from(this.container.children).forEach((slideEl, i) => {
      const slidePreview = slideEl.querySelector(".slide-preview") as
        | HTMLElement
        | null;
      if (slidePreview) slidePreview.dataset.slideId = String(i);

      const slideTextPreview = slideEl.querySelector(".slide-text-preview") as
        | HTMLElement
        | null;
      if (slideTextPreview) slideTextPreview.dataset.slideId = String(i);

      const radioBtn = slideEl.querySelector("input") as HTMLInputElement | null;
      if (radioBtn) radioBtn.dataset.slideId = String(i);

      const numberSpan = slideEl.querySelector(".slide-number") as
        | HTMLElement
        | null;
      if (numberSpan) numberSpan.innerText = String(i + 1);
    });
  }

  clear() {
    this.container.innerHTML = "";
  }
}

export default SidebarRenderer;
