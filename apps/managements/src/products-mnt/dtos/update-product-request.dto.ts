import { IntersectionType } from '@nestjs/swagger';
import { CreateProductRequestDTO } from './create-product-request.dto';
import { Types } from 'mongoose';

export class UpdateProductRequestDTO extends IntersectionType(CreateProductRequestDTO) {
    constructor(data: UpdateProductRequestDTO) {
        super(CreateProductRequestDTO);
        this.category = new Types.ObjectId(data?.category._id);
        this.description = data?.description;
        this.generalImages = data?.generalImages;
        this.descriptionImages = data?.descriptionImages;
        this.variations = data?.variations;
        this.name = data?.name;
        this.status = data?.status;
        this.variations = data?.variations;
        this.generalAttributes = data?.generalAttributes;
    }
}
