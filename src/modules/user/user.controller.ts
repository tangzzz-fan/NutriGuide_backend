import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { ResponseDto, ErrorResponseDto } from '../../common/dto/response.dto';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a paginated list of all active users',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Field to sort by (default: createdAt)',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Sort order (default: desc)',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: PaginatedResponseDto<UserResponseDto>,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto
  ): Promise<ResponseDto<PaginatedResponseDto<UserResponseDto>>> {
    const result = await this.userService.findAll(paginationQuery);

    // Transform users to response DTOs
    const transformedData = {
      ...result,
      data: result.data.map((user) => user.toJSON() as UserResponseDto),
    };

    return new ResponseDto(HttpStatus.OK, 'Users retrieved successfully', transformedData);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Retrieve statistics about user accounts',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
  })
  async getStatistics(): Promise<ResponseDto<any>> {
    const statistics = await this.userService.getStatistics();

    return new ResponseDto(HttpStatus.OK, 'User statistics retrieved successfully', statistics);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID format',
    type: ErrorResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<ResponseDto<UserResponseDto>> {
    const user = await this.userService.findOne(id);

    return new ResponseDto(
      HttpStatus.OK,
      'User retrieved successfully',
      user.toJSON() as UserResponseDto
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information (excluding email, username, and password)',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or user ID format',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<ResponseDto<UserResponseDto>> {
    const user = await this.userService.update(id, updateUserDto);

    return new ResponseDto(
      HttpStatus.OK,
      'User updated successfully',
      user.toJSON() as UserResponseDto
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Soft delete a user (deactivate account)',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID format',
    type: ErrorResponseDto,
  })
  async remove(@Param('id') id: string): Promise<ResponseDto<{ id: string }>> {
    await this.userService.remove(id);

    return new ResponseDto(HttpStatus.OK, 'User deleted successfully', { id });
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'Restore user',
    description: 'Restore a deactivated user account',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'User restored successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID format',
    type: ErrorResponseDto,
  })
  async restore(@Param('id') id: string): Promise<ResponseDto<UserResponseDto>> {
    const user = await this.userService.restore(id);

    return new ResponseDto(
      HttpStatus.OK,
      'User restored successfully',
      user.toJSON() as UserResponseDto
    );
  }

  @Post(':id/verify-email')
  @ApiOperation({
    summary: 'Verify user email',
    description: 'Mark user email as verified',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID format',
    type: ErrorResponseDto,
  })
  async verifyEmail(@Param('id') id: string): Promise<ResponseDto<{ verified: boolean }>> {
    await this.userService.verifyEmail(id);

    return new ResponseDto(HttpStatus.OK, 'Email verified successfully', { verified: true });
  }
}
