export default class TextEditorArea {
  constructor(props) {
    this.textArea = props.textAreaElement;
    this.fontSelector = props.fontSelectorElement;
    this.backgroundBtn = props.backgroundBtnElemnt;
    // this.boldBtn = props.boldBtn;
    // this.fontSizeField = props.fontSizeElement;
    this.onTextEdited = props.onTextEditedFn;
    this.onFontSelected = props.onFontSelectedFn;
    this.onBackgroundToggle = props.onBackgroundToggle;
    slideFiles.allFonts().then((fonts) => {
      //   console.log(fonts);
      this.initializeFontSelector(fonts);
    });
  }

  createFontOption(fontName, face) {
    let option = document.createElement("option");
    const regex = new RegExp(`\\bbold\\b`, "gi");
    fontName = fontName.replace(regex, "");
    option.text = `${fontName}           ابجد هوز`;
    option.value = fontName;
    option.style = `font-family: ${fontName}; padding:2px; font-size:18pt; `;
    return option;
  }

  initializeFontSelector(fonts) {
    fonts.forEach((font) => {
      this.fontSelector.appendChild(this.createFontOption(font));
    });
  }
  _attachEventListeners() {
    console.log(this.textArea);
    this.textArea?.addEventListener("input", (e) => {
      this.onTextEdited?.(e.currentTarget.value);
    });
    this.fontSelector?.addEventListener("change", (e) => {
      const fontName = e.target.value;
      e.target.style = `font-family: ${fontName}; font-size: 16pt;`;
      this.onFontSelected?.(fontName);
    });
    this.backgroundBtn?.addEventListener("input", (e) => {
      console.log(e.target.value);
      this.onBackgroundToggle?.(e.target.value);
    });
  }

  setTextArea(text) {
    this.textArea.value = text;
  }
  renderBackgroundBtn(state) {
    this.backgroundBtn.checked = state;
  }
  setFontSelector(fontName) {
    this.fontSelector.value = fontName;
  }
}
