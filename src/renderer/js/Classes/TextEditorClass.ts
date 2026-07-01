export type TextEditorProps = {
    textAreaElement: HTMLTextAreaElement;
    fontSelectorElement: HTMLSelectElement;
    backgroundBtnElement: HTMLInputElement;
    onTextEditedFn: Function;
    onFontSelectedFn: Function;
    onBackgroundToggle: Function;
}

export default class TextEditorArea {
    private textArea: HTMLTextAreaElement;
    private fontSelector: HTMLSelectElement;
    private backgroundBtn: HTMLInputElement;
    private onTextEdited: Function;
    private onFontSelected: Function;
    private onBackgroundToggle: Function;

    constructor(props: TextEditorProps) {
        this.textArea = props.textAreaElement;
        this.fontSelector = props.fontSelectorElement;
        this.backgroundBtn = props.backgroundBtnElement;
        // this.boldBtn = props.boldBtn;
        // this.fontSizeField = props.fontSizeElement;
        this.onTextEdited = props.onTextEditedFn;
        this.onFontSelected = props.onFontSelectedFn;
        this.onBackgroundToggle = props.onBackgroundToggle;
        //@ts-ignore
        slideFiles.allFonts().then((fonts) => {
            //   console.log(fonts);
            this.initializeFontSelector(fonts);
        });
        console.log(this.textArea, this.fontSelector)
    }

    createFontOption(fontName: string) {
        let option = document.createElement("option");
        const regex = new RegExp(`\\bbold\\b`, "gi");
        fontName = fontName.replace(regex, "");
        option.text = `${fontName}           ابجد هوز`;
        option.value = fontName;
        option.style = `font-family: ${fontName}; padding:2px; font-size:18pt; `;
        return option;
    }

    initializeFontSelector(fonts: string[]) {
        fonts.forEach((font) => {
            this.fontSelector?.appendChild(this.createFontOption(font));
        });
    }

    _attachEventListeners() {
        console.log(this.textArea);
        this.textArea?.addEventListener("input", (e) => {
            //@ts-ignore
            this.onTextEdited?.(e.currentTarget.value);
        });
        this.fontSelector?.addEventListener("change", (e) => {
            //@ts-ignore
            const fontName = e.target.value;
            //@ts-ignore
            e.target.style = `font-family: ${fontName}; font-size: 16pt;`;
            this.onFontSelected?.(fontName);
        });
        this.backgroundBtn?.addEventListener("input", (e) => {
            //@ts-ignore
            console.log(e.target.value);
            //@ts-ignore
            this.onBackgroundToggle?.(e.target.value);
        });
    }

    setTextArea(text: string) {
        this.textArea.value = text;
    }

    renderBackgroundBtn(state: boolean) {
        this.backgroundBtn.checked = state;
    }

    setFontSelector(fontName: string) {
        this.fontSelector.value = fontName;
    }
}
