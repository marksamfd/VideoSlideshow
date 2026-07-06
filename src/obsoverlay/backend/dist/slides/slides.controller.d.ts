import { MessageEvent } from '@nestjs/common';
import { SlidesService } from './slides.service';
import { Observable } from "rxjs";
import { CreateSlideDto } from "./dto/create-slide.dto";
import { SlideChangeDto } from "./dto/slide-change.dto";
export declare class SlidesController {
    private readonly slidesService;
    constructor(slidesService: SlidesService);
    streamNotifications(): Observable<MessageEvent>;
    initSlides(body: CreateSlideDto): Promise<{
        status: string;
    }>;
    emitAlert(body: SlideChangeDto): Promise<{
        status: string;
    }>;
    getContent(): Promise<{
        currentSlide: string;
        sepBy: string;
        mode: string;
        content: string;
    }>;
}
