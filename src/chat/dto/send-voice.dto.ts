import { IsNotEmpty, IsString } from "class-validator";

export class SendVoiceDto {
    @IsNotEmpty()
    @IsString()
    chatId: string;
}
