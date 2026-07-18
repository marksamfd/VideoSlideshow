import WorkingFile from "./workingFile";
import {join} from "path";
import {fork, ChildProcess} from "child_process";
import {app} from "electron";

export type messageType = {
    messageType: "init" | "slide";
    message: string | { sepby: string; mode: string; content: string };
};

export type ServerMessageType = {
    status: string;
    port: number;
    ip: string;
    url: string;
}
export default class GreenOverlay {
    host = "http://localhost:4040";
    headers = {
        "Content-Type": "application/json",
    };
    nestServerProcess: ChildProcess | undefined;
    private serverStarted: boolean = false;
    private onServerStarted: (server: ServerMessageType) => void;

    constructor(private file: WorkingFile, onServerStarted: (server: ServerMessageType) => void) {
        this.onServerStarted = onServerStarted;
        // const serverPath = join(
        //     __dirname,
        //     "..",
        //     "obsoverlay",
        //     "backend",
        //     "dist",
        //     "main.js",
        // );


        const isDev = !app.isPackaged;

        const serverPath = isDev
            ? join(app.getAppPath(), "src", "obsoverlay", "backend", "dist", "main.js")
            : join(process.resourcesPath, "backend-server", "dist", "main.js");

        console.log(serverPath);

        // Fork the process to run the NestJS server in the background
        this.nestServerProcess = fork(serverPath, [], {
            // stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
            silent: true // Redirects stdout/stderr to streams we can read in Electronss
        });
        this.nestServerProcess?.on("message", (message) => {
            console.log("Message from NestJS server:", message);
            // @ts-ignore
            if (message?.status === "running") {
                let rcvdMessage = message as ServerMessageType
                this.onServerStarted(rcvdMessage);
                this.host = `http://${rcvdMessage.ip}:${rcvdMessage.port}`;
                this.serverStarted = true
                this.init()
            }
        });

        this.nestServerProcess?.on("error", (error) => {
            console.log("Error in NestJS server process:", error);
            this.serverStarted = false
        });
        // Capture and print runtime exceptions thrown by NestJS
        this.nestServerProcess?.stderr?.on('data', (data) => {
            console.log(`🚨 NestJS Backend Error: ${data.toString()}`);
        });

        this.nestServerProcess?.on('exit', (code, signal) => {
            console.log(`NestJS process exited with code ${code} and signal ${signal}`);
        });
    }

    get isServerStarted() {
        return this.serverStarted
    }

    init(params = this.file.toObject()) {
        if (this.serverStarted)
            fetch(`${this.host}/api/slides/init`, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(params),
            })
                .then((e) => e.json())
                .then(console.log)
                .catch((e) => console.error(e));
    }

    changeSlide(slide: string) {
        if (this.isServerStarted)
            fetch(`${this.host}/api/slides/trigger`, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify({slide}),
            })
                .then((e) => e.json())
                .then(console.log)
                .catch((e) => console.error(e));
    }
}
