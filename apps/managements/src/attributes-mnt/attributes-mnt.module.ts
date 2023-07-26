import { RabbitMQModule, RabbitMQService, RedisCacheModule } from '@app/common';
import { AttributesModule } from '@app/resource';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AttributesMntController } from './attributes-mnt.controller';
import { AttributesMntService } from './attributes-mnt.service';

@Module({
    imports: [
        RabbitMQModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        AttributesModule,
        RedisCacheModule,
    ],
    controllers: [AttributesMntController],
    providers: [RabbitMQService, AttributesMntService],
})
export class AttributesMntModule {}
