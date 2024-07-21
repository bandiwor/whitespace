import {IsNotEmpty, IsString} from "class-validator";

export default class JoinChatDto {
    @IsString()
    @IsNotEmpty()
    chatId: string;
}