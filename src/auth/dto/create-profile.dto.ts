import {$Enums} from "@prisma/client";
import {IsDateString, IsEnum, IsNumberString, IsOptional, IsString, Length, Matches} from "class-validator";
import {
    telephoneMustBeNumberStringError,
    userFirstAndLastNameRegexp,
    userFirstAndLastNamesLength,
    userFirstnameFormatError,
    userFirstnameLengthError, userLastnameFormatError, userLastnameLengthError,
    usernameFormatError,
    usernameLength,
    usernameLengthError,
    usernameRegexp,
} from "./messages";

export default class CreateProfileDto {
    @IsNumberString(null, {
        message: telephoneMustBeNumberStringError,
    })
    telephone: string;

    @IsString()
    password: string;

    @IsString()
    @Length(2, 16, {
        message: userFirstnameLengthError,
    })
    @Matches(userFirstAndLastNameRegexp, {
        message: userFirstnameFormatError,
    })
    firstName: string;

    @IsString()
    @Length(...userFirstAndLastNamesLength, {
        message: userLastnameLengthError,
    })
    @Matches(userFirstAndLastNameRegexp, {
        message: userLastnameFormatError,
    })
    lastName: string;

    @IsOptional()
    @IsDateString({
        strict: true,
        strictSeparator: true,
    })
    dateOfBirth?: string;

    @IsEnum($Enums.Gender)
    gender: $Enums.Gender;

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
