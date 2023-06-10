export * from './app.controller';
export * from './products.controller';

import { AppController } from './app.controller';
import { ProductsController } from './products.controller';
import { AuthController } from './auth.controller';

export default [AppController, ProductsController, AuthController];
