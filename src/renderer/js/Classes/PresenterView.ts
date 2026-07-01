import {PresenterCanvasRenderer} from "./CanvasRenderer/PresenterCanvasRendererClass";
import BaseViewport, {BaseViewportProps} from "./BaseViewport";
import SidebarRenderer, {SidebarRendererProps} from "./SidebarRendererClass";
import LyricRenderer, {LyricRendererConfig} from "./LyricRenderer";

type PresenterViewportProps = SidebarRendererProps & BaseViewportProps & LyricRendererConfig

class PresenterView extends BaseViewport {
    sidebar: SidebarRenderer;

    constructor(props: PresenterViewportProps) {
        super(props);
        this.initializeViewport();
        this.slides.setCurrent(0);
        this.sidebar = new SidebarRenderer({
            sidebarSlidesContainer: props.sidebarSlidesContainer,
            onSlideClickfn: this.onSlideClicked.bind(this),
        });
        this.lyricRenderer = new LyricRenderer({
            lyricsContainer: props.lyricsContainer,
            onLyricClickCallback: this.onLyricClicked.bind(this),
        })
    }

    onSlideClicked(slideNumber: number | string) {
        this.slides.setCurrent(Number(slideNumber));
    }

    onLyricChange() {
        super.onLyricChange();
        this.lyricRenderer?.heighlightLyric(this.lyrics.getCurrentLyricIdx());

    }

    onLyricClicked(lyricIdx: number) {
        if (lyricIdx === undefined || lyricIdx === null) return;
        this.lyrics.setCurrent(lyricIdx);
        this.canvas.rendertext(this.lyrics.getCurrentLyric());
        this.lyricRenderer?.heighlightLyric(lyricIdx);
    }

    onSlideChange() {
        super.onSlideChange();
        this.lyricRenderer?.renderLyricsPreview(this.lyrics.getAllLyrics());
        this.lyricRenderer?.heighlightLyric(this.lyrics.getCurrentLyricIdx());
    }

    createCanvasRenderer(props: BaseViewportProps) {
        return new PresenterCanvasRenderer({
            container: props.container,
            width: (props.height * 16) / 9,
            height: props.height,
        });
    }
}

export default PresenterView;
