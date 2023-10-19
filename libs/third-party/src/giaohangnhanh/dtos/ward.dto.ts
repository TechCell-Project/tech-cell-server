import { IsEnum } from 'class-validator';
import { StatusEnum, SupportTypeEnum } from '../enums';
import { TGhnWard } from '../types';
import { ApiProperty } from '@nestjs/swagger';

export class GhnWardDTO {
    constructor(data: TGhnWard) {
        this.district_id = Number(data.DistrictID);
        this.ward_code = data.WardCode;
        this.ward_name = data.WardName;
        this.support_type = Number(data.SupportType);
        this.name_extension = data.NameExtension;
        this.can_update_cod = Boolean(data.CanUpdateCOD);
        this.status = Number(data.Status);
    }

    @ApiProperty({
        type: Number,
        example: 1490,
        description: 'Mã quận huyện',
    })
    district_id: number;

    @ApiProperty({
        type: String,
        example: '1A0807',
        description: 'Mã phường xã',
    })
    ward_code: string;

    @ApiProperty({
        type: String,
        example: 'Phường Mai Động',
        description: 'Tên phường xã',
    })
    ward_name: string;

    @ApiProperty({
        type: [String],
        description: 'Tên phường xã mở rộng',
        example: [
            'Phường Mai Động',
            'P.Mai Động',
            'P Mai Động',
            'Mai Động',
            'Mai Dong',
            'Phuong Mai Dong',
            'maidong',
        ],
    })
    name_extension: string[];

    @ApiProperty({
        type: Number,
        example: 1,
        description: 'Loại hỗ trợ',
        enum: SupportTypeEnum,
    })
    @IsEnum(SupportTypeEnum)
    support_type: number;

    @ApiProperty({
        type: Boolean,
        example: true,
        description: 'Có thể cập nhật COD',
    })
    can_update_cod: boolean;

    @ApiProperty({
        type: Number,
        example: 1,
        description: 'Trạng thái',
        enum: StatusEnum,
    })
    @IsEnum(StatusEnum)
    status: number;
}
