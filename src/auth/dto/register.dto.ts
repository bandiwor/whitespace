import {IsNumberString, IsString, IsStrongPassword} from "class-validator";
import {passwordStrengthError, telephoneMustBeNumberStringError} from "./messages";

export default class RegisterDto {
    @IsNumberString(null, {
        message: telephoneMustBeNumberStringError
    })
    telephone: string;

    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minNumbers: 0,
        minUppercase: 1,
        minLowercase: 0,
        minSymbols: 1
    }, {
        message: passwordStrengthError
    })
    password: string;
}
