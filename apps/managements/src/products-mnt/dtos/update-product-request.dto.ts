import { IntersectionType, PartialType } from '@nestjs/swagger';
import { AttributeDTO, CreateProductRequestDTO } from './create-product-request.dto';
import { Types } from 'mongoose';
import { sanitizeHtmlString } from '~libs/common/utils';

export class UpdateProductRequestDTO extends PartialType(CreateProductRequestDTO) {
    constructor(data: UpdateProductRequestDTO) {
        super(data);

        if (data?.name !== undefined && data?.name !== null) {
            this.name = data.name;
        }

        if (data?.description !== undefined && data?.description !== null) {
            this.description = sanitizeHtmlString(data.description);
        }

        if (data?.generalImages !== undefined && data?.generalImages !== null) {
            this.generalImages = data.generalImages;
        }

        if (data?.descriptionImages !== undefined && data?.descriptionImages !== null) {
            this.descriptionImages = data.descriptionImages;
        }

        if (data?.category !== undefined && data?.category !== null) {
            this.category = new Types.ObjectId(data.category._id);
        }

        if (data?.status !== undefined && data?.status !== null) {
            this.status = data.status;
        }

        if (data?.variations !== undefined && data?.variations !== null) {
            this.variations = data.variations.map((variation) => {
                const variant = {
                    status: variation?.status,
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
                    sku: variation.sku,
                };
                delete variant.sku;
                return variant;
            });
        }

        if (data?.generalAttributes !== undefined && data?.generalAttributes !== null) {
            this.generalAttributes = data.generalAttributes
                .map((attr): AttributeDTO => {
                    return {
                        k: attr.k.toLowerCase(),
                        v: attr.v,
                        ...(attr.u != null && attr.u != undefined ? { u: attr.u } : {}), // remove unit if null
                    };
                })
                .sort((a, b) => a.k.localeCompare(b.k));
        }
    }
}
