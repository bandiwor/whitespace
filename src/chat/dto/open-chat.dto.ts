import { IsString, IsUUID } from 'class-validator';

export default class OpenChatDto {
    @IsString()
    chatId: string;
}
