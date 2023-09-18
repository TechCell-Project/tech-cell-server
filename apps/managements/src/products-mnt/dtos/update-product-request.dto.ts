import { IntersectionType } from '@nestjs/swagger';
import { CreateProductRequestDTO } from './create-product-request.dto';

export class UpdateProductRequestDTO extends IntersectionType(CreateProductRequestDTO) {}
