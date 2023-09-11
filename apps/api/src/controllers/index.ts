import { AppController } from './app.controller';
import { ProductsController } from './products.controller';
import { AuthController } from './auth.controller';
import { OrderController } from './order.controller';
import { UsersController } from './users.controller';
import { AttributesController } from './attributes.controller';
import { CategoriesController } from './categories.controller';
import { CartsController } from './carts.controller';
import { ImagesController } from './images.controller';

export default [
    AuthController,
    ImagesController,
    UsersController,
    ProductsController,
    CategoriesController,
    AttributesController,
    CartsController,
    OrderController,
    AppController,
];
