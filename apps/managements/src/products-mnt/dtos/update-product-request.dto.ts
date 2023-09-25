import { IntersectionType } from '@nestjs/swagger';
import { AttributeDTO, CreateProductRequestDTO } from './create-product-request.dto';
import { Types } from 'mongoose';
import { sanitizeHtmlString } from '@app/common/utils';

export class UpdateProductRequestDTO extends IntersectionType(CreateProductRequestDTO) {
    constructor(data: UpdateProductRequestDTO) {
        super(data);

        this.name = data?.name;
        this.description = sanitizeHtmlString(data?.description);
        this.generalImages = data?.generalImages;
        this.descriptionImages = data?.descriptionImages;
        this.category = new Types.ObjectId(data?.category?._id);
        this.status = data?.status;
        this.variations = data?.variations.map((variation) => {
            return {
                price: variation.price,
                stock: variation.stock,
                images: variation.images,
                // Sorted allow alphabetical order
                attributes: variation.attributes
                    .map((attr): AttributeDTO => {
                        return {
                            k: attr?.k?.toLowerCase(),
                            v: attr?.v,
                            ...(attr.u != null && attr.u != undefined ? { u: attr.u } : {}), // remove unit if null
                        };
                    })
                    .sort((a, b) => a.k.localeCompare(b.k)),
            };
        });

        // Sorted allow alphabetical order
        this.generalAttributes = data?.generalAttributes
            ?.map((attr): AttributeDTO => {
                return {
                    k: attr.k.toLowerCase(),
                    v: attr.v,
                    ...(attr.u != null && attr.u != undefined ? { u: attr.u } : {}), // remove unit if null
                };
            })
            .sort((a, b) => a.k.localeCompare(b.k));
    }
}
