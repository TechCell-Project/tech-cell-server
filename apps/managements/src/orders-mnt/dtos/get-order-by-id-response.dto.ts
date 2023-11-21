import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { OrderSchemaDTO, ProductOrderSchemaDTO } from '~libs/resource/orders/dtos/order-schema.dto';
import { ProductVariationDTO, ProductDTO } from '~libs/resource/products/dtos/product.dto';

class ProductsOrder extends IntersectionType(
    ProductOrderSchemaDTO,
    ProductVariationDTO,
    PickType(ProductDTO, ['generalImages']),
) {}

export class GetOrderByIdResponseDTO extends OmitType(OrderSchemaDTO, ['products']) {
    @ApiProperty({ type: [ProductsOrder] })
    products: Array<ProductsOrder>;
}
