import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CreateSlideDto } from "./dto/create-slide.dto";
import { SlideChangeDto } from "./dto/slide-change.dto";
export declare class SlidesService {
    private notification$;
    private content;
    private currentSlide;
    getNotificationStream(): Observable<MessageEvent>;
    initSlideShow(slide: CreateSlideDto): void;
    triggerSlideChange(slide: SlideChangeDto): void;
    getContent(): {
        currentSlide: string;
        sepBy: string;
        mode: string;
        content: string;
    };
}
