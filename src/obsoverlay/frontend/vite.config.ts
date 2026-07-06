//@ts-ignore
import {defineConfig} from "vite";
import {resolve} from "path";

export default defineConfig({
    // 1. Production Build Configuration
    build: {
        // Outputs the bundle directly into the backend's client folder
        outDir: resolve(__dirname, "../backend/client"),
        emptyOutDir: true, // Cleans the folder before building
    },

    // 2. Development Server Configuration
    server: {
        port: 5173, // Vite dev server port
        proxy: {
            // Forwards any request starting with /api to NestJS
            "/api": {
                target: "http://localhost:4040",
                changeOrigin: true,
                timeout: 0, // here

            },
        },
    },
});
