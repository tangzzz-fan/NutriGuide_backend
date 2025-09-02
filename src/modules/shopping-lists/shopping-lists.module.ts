import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingListsController } from './shopping-lists.controller';
import { ShoppingList, ShoppingListSchema } from './schemas/shopping-list.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ShoppingList.name, schema: ShoppingListSchema },
        ]),
    ],
    controllers: [ShoppingListsController],
    providers: [ShoppingListsService],
    exports: [ShoppingListsService],
})
export class ShoppingListsModule { }