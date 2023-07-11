export * from './app.controller';
export * from './products.controller';
export * from './app.controller';

import { AppController } from './app.controller';
import { ProductsController } from './products.controller';
import { AuthController } from './auth.controller';
import { ManagementsController } from './managements.controller';
import { OrderController } from './order.controller';

export default [
    AppController,
    ProductsController,
    AuthController,
    ManagementsController,
    OrderController,
];
