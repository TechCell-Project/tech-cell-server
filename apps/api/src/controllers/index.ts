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
import { OrdersManagementController } from './order-management.controller';
import { StatsController } from './stats.controller';
import { KpiController } from './kpi.controller';
import { PaymentController } from './payments.controller';

export const ListControllers = [
    AdminController,
    AuthController,
    ProfileController,
    ImagesController,
    ProductsController,
    CategoriesController,
    AttributesController,
    CartsController,
    AddressController,
    OrderController,
    OrdersManagementController,
    UsersController,
    // DiscountsController,
    NotificationsController,
    KpiController,
    StatsController,
    AppController,
    HealthController,
    PaymentController,
];
