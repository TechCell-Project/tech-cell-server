import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAttributeDTO {
    @IsString()
    @IsNotEmpty()
    attributeId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
