import { IsEnum } from 'class-validator';
import { SupportTypeEnum, StatusEnum } from '../enums';
import { ApiProperty } from '@nestjs/swagger';
import { GhnDistrict } from 'giaohangnhanh';

export class GhnDistrictDTO {
    constructor(data: GhnDistrict) {
        this.district_id = Number(data.DistrictID);
        this.district_name = data.DistrictName;
        this.support_type = Number(data.SupportType);
        this.name_extension = data.NameExtension;
        this.can_update_cod = Boolean(data.CanUpdateCOD);
        this.status = Number(data.Status);
    }

    @ApiProperty({
        example: 201,
        description: 'Mã tỉnh thành',
        type: Number,
    })
    province_id: number;

    @ApiProperty({
        example: 1490,
        description: 'Mã quận huyện',
        type: Number,
    })
    district_id: number;

    @ApiProperty({
        example: 'Quận Hoàng Mai',
        description: 'Tên quận huyện',
        type: String,
    })
    district_name: string;

    @ApiProperty({
        example: 1,
        description: 'Loại hỗ trợ',
        type: Number,
        enum: SupportTypeEnum,
    })
    @IsEnum(SupportTypeEnum)
    support_type: number;

    @ApiProperty({
        example: [
            'Quận Hoàng Mai',
            'Q.Hoàng Mai',
            'Q Hoàng Mai',
            'Hoàng Mai',
            'Hoang Mai',
            'Quan Hoang Mai',
            'hoangmai',
        ],
        description: 'Tên quận huyện mở rộng',
        type: [String],
    })
    name_extension: string[];

    @ApiProperty({
        example: true,
        description: 'Có thể cập nhật COD',
        type: Boolean,
    })
    can_update_cod: boolean;

    @ApiProperty({
        example: 1,
        description: 'Trạng thái',
        type: Number,
        enum: StatusEnum,
    })
    @IsEnum(StatusEnum)
    @ApiProperty({
        example: 1,
        description: 'Trạng thái',
        type: Number,
        enum: StatusEnum,
    })
    status: number;
}
