import {IsDateString, IsEnum, IsNumberString, IsOptional, IsString, Length, Matches} from "class-validator";
import {
    telephoneMustBeNumberStringError,
    userFirstAndLastNameRegexp,
    userFirstAndLastNamesFormatError,
    userFirstAndLastNamesLength,
    userFirstAndLastNamesLengthError,
    usernameFormatError,
    usernameLength,
    usernameLengthError,
    usernameRegexp,
} from "./messages";

import {$Enums} from "@prisma/client"

export default class CreateProfileDto {
    @IsNumberString(null, {
        message: telephoneMustBeNumberStringError,
    })
    telephone: string;

    @IsString()
    password: string;

    @IsString()
    @Length(2, 16, {
        message: userFirstAndLastNamesLengthError,
    })
    @Matches(userFirstAndLastNameRegexp, {
        message: userFirstAndLastNamesFormatError,
    })
    firstName: string;

    @IsString()
    @Length(...userFirstAndLastNamesLength, {
        message: userFirstAndLastNamesLengthError,
    })
    @Matches(userFirstAndLastNameRegexp, {
        message: userFirstAndLastNamesFormatError,
    })
    lastName: string;

    @IsOptional()
    @IsDateString({
        strict: true,
        strictSeparator: true
    })
    date?: string

    @IsEnum($Enums.Gender)
    gender: $Enums.Gender

    @IsOptional()
    @IsString()
    @Length(...usernameLength, {
        message: usernameLengthError,
    })
    @Matches(usernameRegexp, {
        message: usernameFormatError,
    })
    username?: string;
}
