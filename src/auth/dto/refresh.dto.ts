import {IsString} from "class-validator";

export default class RefreshDto {
    @IsString()
    oldRefreshJwt: string
}