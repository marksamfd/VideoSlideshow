import {Controller, Post, Body, Sse, MessageEvent, ValidationPipe, UsePipes, Get} from '@nestjs/common';
import {SlidesService} from './slides.service';
import {Observable} from "rxjs";
import {CreateSlideDto} from "./dto/create-slide.dto";
import {SlideChangeDto} from "./dto/slide-change.dto";

@Controller('slides')
export class SlidesController {
    constructor(private readonly slidesService: SlidesService) {
    }

    // 1. Client connects here to stay updated
    @Sse('live')
    streamNotifications(): Observable<MessageEvent> {
        return this.slidesService.getNotificationStream();
    }

    @Post('init')
    @UsePipes(new ValidationPipe({transform: true}))
    async initSlides(@Body() body: CreateSlideDto) {
        this.slidesService.initSlideShow(body);
        return {status: 'Slide show initialized successfully'};
    }

    // 2. Action route to broadcast events to connected clients
    @Post('trigger')
    @UsePipes(new ValidationPipe({transform: true}))
    async emitAlert(@Body() body: SlideChangeDto) {
        this.slidesService.triggerSlideChange(body);
        return {status: 'slide change triggered successfully'};

    }

    @Get("content")
    async getContent() {
        return this.slidesService.getContent();
    }
}
