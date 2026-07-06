"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlidesController = void 0;
const common_1 = require("@nestjs/common");
const slides_service_1 = require("./slides.service");
const rxjs_1 = require("rxjs");
const create_slide_dto_1 = require("./dto/create-slide.dto");
const slide_change_dto_1 = require("./dto/slide-change.dto");
let SlidesController = class SlidesController {
    slidesService;
    constructor(slidesService) {
        this.slidesService = slidesService;
    }
    streamNotifications() {
        return this.slidesService.getNotificationStream();
    }
    async initSlides(body) {
        console.log(body);
        this.slidesService.initSlideShow(body);
        console.log(body);
        return { status: 'Slide show initialized successfully' };
    }
    async emitAlert(body) {
        this.slidesService.triggerSlideChange(body);
        return { status: 'slide change triggered successfully' };
    }
    async getContent() {
        return this.slidesService.getContent();
    }
};
exports.SlidesController = SlidesController;
__decorate([
    (0, common_1.Sse)('live'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", rxjs_1.Observable)
], SlidesController.prototype, "streamNotifications", null);
__decorate([
    (0, common_1.Post)('init'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_slide_dto_1.CreateSlideDto]),
    __metadata("design:returntype", Promise)
], SlidesController.prototype, "initSlides", null);
__decorate([
    (0, common_1.Post)('trigger'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [slide_change_dto_1.SlideChangeDto]),
    __metadata("design:returntype", Promise)
], SlidesController.prototype, "emitAlert", null);
__decorate([
    (0, common_1.Get)("content"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlidesController.prototype, "getContent", null);
exports.SlidesController = SlidesController = __decorate([
    (0, common_1.Controller)('slides'),
    __metadata("design:paramtypes", [slides_service_1.SlidesService])
], SlidesController);
//# sourceMappingURL=slides.controller.js.map