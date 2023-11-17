import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { OrderSchemaDTO, ProductOrderSchemaDTO } from '~libs/resource/orders/dtos/order-schema.dto';
import { ProductVariationDTO } from '~libs/resource/products/dtos/product.dto';

class ProductsOrder extends IntersectionType(ProductOrderSchemaDTO, ProductVariationDTO) {}

export class GetOrderByIdResponseDTO extends OmitType(OrderSchemaDTO, ['products']) {
    @ApiProperty({ type: [ProductsOrder] })
    products: Array<ProductsOrder>;
}
