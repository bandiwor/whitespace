import { IsInt, IsOptional, Min, IsString } from 'class-validator';

export default class SearchChatsDto {
    @IsOptional()
    @IsString()
    query?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    skip?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    take?: number;
}
