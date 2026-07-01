export {};

declare global {
  interface Window {
    slideFiles?: {
      addSlideFiles?: (args: {
        imgBase64: string;
        videoFilePath: string;
        imgFileName: string;
        videoFileName: string;
      }) => Promise<any>;
    };
  }
}
