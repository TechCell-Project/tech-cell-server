import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCategoryDTO {
    @IsString()
    @IsNotEmpty()
    description: string;
}
