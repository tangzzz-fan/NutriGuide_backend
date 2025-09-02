import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EcommerceService } from './ecommerce.service';
import { EcommerceController } from './ecommerce.controller';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
        ]),
    ],
    controllers: [EcommerceController],
    providers: [EcommerceService],
    exports: [EcommerceService],
})
export class EcommerceModule { }