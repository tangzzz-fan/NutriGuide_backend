import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsEnum,
    IsOptional,
    IsNumber,
    Min,
    Max,
} from 'class-validator';

export class RecommendationFeedbackDto {
    @ApiProperty({
        description: 'ID of the recommended item',
        example: '507f1f77bcf86cd799439011',
    })
    @IsNotEmpty()
    @IsString()
    itemId: string;

    @ApiProperty({
        description: 'Type of the recommended item',
        enum: ['food', 'recipe', 'meal-plan'],
        example: 'food',
    })
    @IsEnum(['food', 'recipe', 'meal-plan'])
    itemType: 'food' | 'recipe' | 'meal-plan';

    @ApiProperty({
        description: 'Type of feedback action',
        enum: ['like', 'dislike', 'not-interested', 'saved', 'tried'],
        example: 'like',
    })
    @IsEnum(['like', 'dislike', 'not-interested', 'saved', 'tried'])
    action: 'like' | 'dislike' | 'not-interested' | 'saved' | 'tried';

    @ApiProperty({
        description: 'Rating score (1-5)',
        example: 4,
        required: false,
        minimum: 1,
        maximum: 5,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;

    @ApiProperty({
        description: 'Optional feedback comment',
        example: 'Great recommendation! I loved this recipe.',
        required: false,
    })
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiProperty({
        description: 'Recommendation context/reason',
        example: 'high-protein-breakfast',
        required: false,
    })
    @IsOptional()
    @IsString()
    context?: string;
} 