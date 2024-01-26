import { IntersectionType, OmitType } from '@nestjs/swagger';
import { ListDataResponseDTO } from '~libs/common/dtos';
import { CartDTO } from '~libs/resource/carts/dtos';

export class GetCartResponseDTO extends IntersectionType(
    CartDTO,
    OmitType(ListDataResponseDTO, ['data']),
) {}
