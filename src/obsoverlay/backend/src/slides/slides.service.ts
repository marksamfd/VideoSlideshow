import {Injectable, MessageEvent, NotFoundException} from '@nestjs/common';
import {Subject, Observable} from 'rxjs';
import {CreateSlideDto} from "./dto/create-slide.dto";
import {SlideChangeDto} from "./dto/slide-change.dto";


@Injectable()
export class SlidesService {
    // A Subject acts as both an observer and an observable stream
    private notification$ = new Subject<MessageEvent>();
    private content: CreateSlideDto;
    private currentSlide: string;

    // Expose stream for the controller
    getNotificationStream(): Observable<MessageEvent> {
        return this.notification$.asObservable();
    }

    initSlideShow(slide: CreateSlideDto) {
        this.notification$.next({
            type: 'init',
            data: slide,
        });
        this.content = slide;
    }

    // Push new updates directly into the stream pipeline
    triggerSlideChange(slide: SlideChangeDto) {
        this.notification$.next({
            type: "slide",
            data: slide.slide,
        });
        this.currentSlide = slide.slide;
    }

    getContent() {
        if (this.content)
            return {...this.content, currentSlide: this.currentSlide};
        throw new NotFoundException();
    }
}
