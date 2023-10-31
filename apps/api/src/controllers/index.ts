import { AppController } from './app.controller';
import { ProductsController } from './products.controller';
import { AuthController } from './auth.controller';
import { OrderController } from './order.controller';
import { UsersController } from './users.controller';
import { AttributesController } from './attributes.controller';
import { CategoriesController } from './categories.controller';
import { CartsController } from './carts.controller';
import { ImagesController } from './images.controller';
import { AdminController } from './admin.controller';
import { ProfileController } from './profile.controller';
import { AddressController } from './address.controller';
import { NotificationsController } from './notifications.controller';
// import { DiscountsController } from './discounts.controller';
import { HealthController } from './health.controller';

export const ListControllers = [
    HealthController,
    AdminController,
    AuthController,
    ProfileController,
    ImagesController,
    UsersController,
    ProductsController,
    CategoriesController,
    AttributesController,
    CartsController,
    AddressController,
    OrderController,
    // DiscountsController,
    NotificationsController,
    AppController,
];
