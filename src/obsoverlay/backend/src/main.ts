import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import * as os from "node:os";
import {join} from "path";
import {NestExpressApplication} from "@nestjs/platform-express";

function getLocalIP(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            // Skip internal (loopback) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1'; // Fallback to localhost
}

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
        .setTitle('Cats example')
        .setDescription('The cats API description')
        .setVersion('1.0')
        .addTag('cats')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    // Serve static files from the 'public' folder
    app.useStaticAssets(join(__dirname, 'public'));
    console.log(join(__dirname, 'public')  )
    const port = process.env.PORT ?? 4040
    await app.listen(port, "0.0.0.0");
    if (process.send) {
        process.send({
            status: 'running',
            port: port,
            ip: getLocalIP(),
            url: `http://${getLocalIP()}:${port}`
        });
    }
    console.log(`NestJS server is running on http://${getLocalIP()}:${port}`);
}

bootstrap();
