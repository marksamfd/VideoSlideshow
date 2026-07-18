import {ServerMessageType} from "../OverlayUtils";

export {};

export type openedFileType = {

    sepBy: string, mode: string, filePath: string, present: boolean

}
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
            onSlideChange(param: (param: string) => void): void;
            toPresentation(param: string): void;
            startOverlay(): void;
            onOverlayStarted(param: (server: ServerMessageType) => void): void;
        };
        file: {
            openDialog(mode: "s" | "o"): Promise<string | null>;
            fileOpened(param: openedFileType): void;
            onPresentationDialog(param: () => void): void;
        }
    }
}
