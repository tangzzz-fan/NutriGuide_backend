import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    UseGuards,
    Request,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserProfileService } from '../services/user-profile.service';
import {
    CreateUserProfileDto,
    UpdateUserProfileDto,
    UserProfileResponseDto,
} from '../dto/user-profile.dto';
import { ResponseDto } from '../../../common/dto/response.dto';

@ApiTags('User Profile')
@Controller('users/profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserProfileController {
    private readonly logger = new Logger(UserProfileController.name);

    constructor(private readonly userProfileService: UserProfileService) { }

    /**
     * Create user profile during onboarding
     * API-1.2.1: POST /users/profile/onboarding
     */
    @Post('onboarding')
    @ApiOperation({
        summary: 'Create user profile during onboarding',
        description: 'Create initial user profile with basic information, health status, lifestyle habits, and health goals',
    })
    @ApiBody({ type: CreateUserProfileDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User profile created successfully',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'User profile already exists',
    })
    async createProfile(
        @Request() req: any,
        @Body() createProfileDto: CreateUserProfileDto,
    ): Promise<ResponseDto<any>> {
        this.logger.log(`Creating profile for user: ${req.user.userId}`);

        const profile = await this.userProfileService.createProfile(
            req.user.userId,
            createProfileDto,
        );

        // Calculate additional metrics
        const bmr = this.userProfileService.calculateBMR(profile);
        const tdee = this.userProfileService.calculateTDEE(profile);
        const dailyCalories = this.userProfileService.getDailyCalorieRecommendation(profile);
        const macros = this.userProfileService.getMacronutrientRecommendations(profile);

        const responseData = {
            ...profile.toJSON(),
            bmr,
            tdee,
            dailyCalories,
            macros,
        };

        return new ResponseDto(
            HttpStatus.CREATED,
            'User profile created successfully',
            responseData,
        );
    }

    /**
     * Get current user's profile
     * API-1.2.3: GET /users/profile
     */
    @Get()
    @ApiOperation({
        summary: 'Get current user profile',
        description: 'Retrieve complete user profile and preferences information',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User profile retrieved successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User profile not found',
    })
    async getProfile(
        @Request() req: any,
    ): Promise<ResponseDto<any>> {
        this.logger.log(`Getting profile for user: ${req.user.userId}`);

        const profile = await this.userProfileService.getProfileByUserId(req.user.userId);

        // Calculate additional metrics
        const bmr = this.userProfileService.calculateBMR(profile);
        const tdee = this.userProfileService.calculateTDEE(profile);
        const dailyCalories = this.userProfileService.getDailyCalorieRecommendation(profile);
        const macros = this.userProfileService.getMacronutrientRecommendations(profile);

        const responseData = {
            ...profile.toJSON(),
            bmr,
            tdee,
            dailyCalories,
            macros,
        };

        return new ResponseDto(
            HttpStatus.OK,
            'User profile retrieved successfully',
            responseData,
        );
    }

    /**
     * Update user profile
     */
    @Put()
    @ApiOperation({
        summary: 'Update user profile',
        description: 'Update user profile information',
    })
    @ApiBody({ type: UpdateUserProfileDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User profile updated successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User profile not found',
    })
    async updateProfile(
        @Request() req: any,
        @Body() updateProfileDto: UpdateUserProfileDto,
    ): Promise<ResponseDto<any>> {
        this.logger.log(`Updating profile for user: ${req.user.userId}`);

        const profile = await this.userProfileService.updateProfile(
            req.user.userId,
            updateProfileDto,
        );

        const responseData = profile.toJSON();

        return new ResponseDto(
            HttpStatus.OK,
            'User profile updated successfully',
            responseData,
        );
    }

    /**
     * Delete user profile
     */
    @Delete()
    @ApiOperation({
        summary: 'Delete user profile',
        description: 'Delete user profile (for account deletion)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User profile deleted successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User profile not found',
    })
    async deleteProfile(@Request() req: any): Promise<ResponseDto<null>> {
        this.logger.log(`Deleting profile for user: ${req.user.userId}`);

        await this.userProfileService.deleteProfile(req.user.userId);

        return new ResponseDto(
            HttpStatus.OK,
            'User profile deleted successfully',
            null,
        );
    }

    /**
     * Check if user has completed profile setup
     */
    @Get('status')
    @ApiOperation({
        summary: 'Check profile completion status',
        description: 'Check if user has completed profile setup',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Profile status retrieved successfully',
    })
    async getProfileStatus(@Request() req: any): Promise<ResponseDto<{ hasProfile: boolean }>> {
        this.logger.log(`Checking profile status for user: ${req.user.userId}`);

        const hasProfile = await this.userProfileService.hasProfile(req.user.userId);

        return new ResponseDto(
            HttpStatus.OK,
            'Profile status retrieved successfully',
            { hasProfile },
        );
    }
}