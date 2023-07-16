import { IsString } from 'class-validator';

export class CreateUserRequestDto {
    @IsString()
    readonly username: string;
}
