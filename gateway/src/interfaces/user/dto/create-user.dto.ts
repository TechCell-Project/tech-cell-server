import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        uniqueItems: true,
        example: 'test1@giaang.com',
    })
    email: string;
    @ApiProperty({
        minLength: 8,
        example: 'test11',
    })
    password: string;
}
