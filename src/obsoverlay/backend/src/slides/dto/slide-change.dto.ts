import {IsNotEmpty, IsString} from "class-validator";

export class SlideChangeDto {
    @IsString()
    @IsNotEmpty()
    slide: string;
}