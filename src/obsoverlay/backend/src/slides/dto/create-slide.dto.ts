import {IsIn, IsString, IsNotEmpty, ValidateIf, IsObject} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateSlideDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    sepBy: string;

    @ApiProperty()

    @IsString()
    @IsNotEmpty()
    mode: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;
}