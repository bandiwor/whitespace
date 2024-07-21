import { IsInt, IsOptional, Min } from 'class-validator';

export default class GetChatsDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    skip?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    take?: number;
}
