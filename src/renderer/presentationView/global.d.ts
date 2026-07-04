export {};
declare global {
    interface Window {
        comm: {
            onInitSlideshow?: (
                cb: (data: {
                    sepBy: string | number;
                    mode: string;
                    content: string;
                }) => void
            ) => void;
            onPresenterMessage?: (
                cb: (data: { type: string; data: string }) => void
            ) => void;
            onNextSlide?: (cb: () => void) => void;
            onPreviousSlide?: (cb: () => void) => void;
            onSlideChange(param: (param: string) => void): void;
            toPresentation(param: string): void;
        };
    }
}
