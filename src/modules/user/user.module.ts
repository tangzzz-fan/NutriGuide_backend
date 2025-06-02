import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserProfile, UserProfileSchema } from './schemas/user-profile.schema';
import { UserPreferences, UserPreferencesSchema } from './schemas/user-preferences.schema';
import { UserProfileService } from './services/user-profile.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserProfileController } from './controllers/user-profile.controller';
import { UserPreferencesController } from './controllers/user-preferences.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: UserProfile.name, schema: UserProfileSchema },
            { name: UserPreferences.name, schema: UserPreferencesSchema },
        ]),
    ],
    controllers: [
        UserController,
        UserProfileController,
        UserPreferencesController,
    ],
    providers: [
        UserService,
        UserProfileService,
        UserPreferencesService,
    ],
    exports: [
        UserService,
        UserProfileService,
        UserPreferencesService,
    ],
})
export class UserModule { }
