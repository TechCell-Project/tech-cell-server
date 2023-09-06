import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductRequestDTO } from './create-product-request.dto';

export class UpdateProductRequestDTO extends PartialType(
    OmitType(CreateProductRequestDTO, ['variations']),
) {
    constructor(partial: Partial<UpdateProductRequestDTO>) {
        super();
        this.name = partial?.name;
        this.description = partial?.description;
        this.categories = partial?.categories;
        this.status = partial?.status;
        this.generalAttributes = partial?.generalAttributes;
    }
}
