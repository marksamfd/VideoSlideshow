"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlidesService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let SlidesService = class SlidesService {
    notification$ = new rxjs_1.Subject();
    content;
    currentSlide;
    getNotificationStream() {
        return this.notification$.asObservable();
    }
    initSlideShow(slide) {
        this.notification$.next({
            type: 'init',
            data: slide,
        });
        this.content = slide;
    }
    triggerSlideChange(slide) {
        this.notification$.next({
            type: "slide",
            data: slide.slide,
        });
        this.currentSlide = slide.slide;
    }
    getContent() {
        if (this.content)
            return { ...this.content, currentSlide: this.currentSlide };
        throw new common_1.NotFoundException();
    }
};
exports.SlidesService = SlidesService;
exports.SlidesService = SlidesService = __decorate([
    (0, common_1.Injectable)()
], SlidesService);
//# sourceMappingURL=slides.service.js.map