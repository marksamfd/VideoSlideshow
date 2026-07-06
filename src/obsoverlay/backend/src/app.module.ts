import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from 'path';
import {SlidesModule} from './slides/slides.module';

@Module({
    imports: [ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', 'client'),
        exclude: ["/api*wildcard"],

    }), SlidesModule,],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
