import { IsNotEmpty, IsString, IsLowercase, Matches, IsOptional } from 'class-validator';

export class CreateAttributeDTO {
    @IsString()
    @IsNotEmpty()
    @IsLowercase()
    @Matches(/^[a-z_]*[a-z][a-z_]*$/, {
        message: 'Label must only contain lowercase letters and optional underscores',
    })
    label: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;
}
