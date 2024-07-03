import {IsNumberString, IsString} from "class-validator";
import {telephoneMustBeNumberStringError} from "./messages";

export default class LoginDto {
    @IsNumberString(null, {
        message: telephoneMustBeNumberStringError
    })
    telephone: string;

    @IsString()
    password: string
}