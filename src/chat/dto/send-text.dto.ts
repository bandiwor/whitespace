import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { MessageType } from "@prisma/client";

export class SendTextDto {
    @IsString()
    @IsNotEmpty()
    chatId: string;

    @IsString()
    @IsNotEmpty()
    content: string
}
