import {IsInt, Min, MinLength} from "class-validator";

export default class OpenPrivateChatDto {
    @IsInt()
    @Min(1)
    targetProfileId: number
}