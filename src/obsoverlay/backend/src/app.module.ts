import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {SlidesModule} from './slides/slides.module';
import {ApplicationConfig} from "@nestjs/core";

@Module({
    imports: [
        SlidesModule,],
    controllers: [AppController],
    providers: [AppService, {
        provide: ApplicationConfig,
        useFactory: () => {
            return new ApplicationConfig();
        },
    },],
})
export class AppModule {
}
