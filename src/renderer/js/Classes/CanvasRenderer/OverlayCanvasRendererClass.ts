import Konva from "konva";
import CanvasRenderer from "./CanvasRendererClass";

export default class OverlayCanvasRenderer extends CanvasRenderer {
    protected anim: Konva.Animation;
    private textToSpacingRatio = 0.75

    override createBackgroundElement() {
        // create green image bitmap for background
        const greenImage = new Image();
        greenImage.src =
            "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='transparent'/%3E%3C/svg%3E";
        greenImage.style.width = "100%";
        greenImage.style.height = "100%";
        return greenImage;
    }

    override setCanvasToVideo() {
        this.anim.start();
    }

    override _attachEventListeners(): void {
    }

    override renderTextPosition(position: { x: number; y: number }) {
        return 0
    }

    constructor(parameters: Konva.StageConfig) {
        super(parameters);
        this.textLayer.draggable(false);
        this.textLayer.width(this.width())
        this.simpleText.width(this.width())

        this.textLayer.y(this.height() * this.textToSpacingRatio)

        this.anim = new Konva.Animation(function () {
            // do nothing, animation just need to update the layer
        }, this.baseLayer);

        this.anim.start();
    }
}
