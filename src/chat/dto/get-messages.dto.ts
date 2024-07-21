import { IsInt, IsOptional, Min, IsString, IsUUID } from 'class-validator';

export default class GetMessagesDto {
    @IsString()
    @IsUUID()
    chatId: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    skip?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    take?: number;
}
