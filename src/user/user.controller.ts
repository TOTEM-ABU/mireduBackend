import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { VerifyOtpDto } from './dto/verify-otp';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Request } from 'express';
import { AuthGuard, RoleGuard, Roles } from 'src/tools';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateDto } from './dto/update.dto';
import { RoleType } from 'src/generated/prisma/enums';
import { ApiQuery } from '@nestjs/swagger';

@Controller('User')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Post('registerStudent')
  createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.UserService.registerStudent(createStudentDto);
  }

  @Post('registerTeacher')
  createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
    return this.UserService.registerTeacher(createTeacherDto);
  }

  @Post('registerAdmin')
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.UserService.registerAdmin(createAdminDto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.UserService.verifyOtp(dto);
  }

  @Post('resend-otp')
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.UserService.resendOtp(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.UserService.login(dto, req);
  }

  @Post('refresh-token')
  refreshAccessToken(@Body() dto: RefreshTokenDto) {
    return this.UserService.refreshAccessToken(dto);
  }

  @UseGuards(AuthGuard)
  @Patch('update-password')
  updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    return this.UserService.updatePassword(req['user'], dto);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Patch('update-me')
  updateMe(@Req() req: any, @Body() dto: UpdateDto) {
    return this.UserService.updateUser(req.user.id, req.user.role, dto);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete(':role/:id')
  async delete(@Param('id') id: string, @Param('role') role: string) {
    return this.UserService.deleteUser(id, role);
  }

  @UseGuards(AuthGuard)
  @Get('get-me')
  getMe(@Req() req: Request) {
    return this.UserService.getMe(req['user'].id, req['user'].role);
  }

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('GetAllStudentsWithFilters')
  @ApiQuery({ name: 'firstName', required: false })
  @ApiQuery({ name: 'lastName', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'phoneNumber', required: false })
  @ApiQuery({ name: 'parentsPhoneNumber', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'name'],
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAllStudents(
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string,
    @Query('email') email?: string,
    @Query('phoneNumber') phoneNumber?: string,
    @Query('parentsPhoneNumber') parentsPhoneNumber?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.UserService.findAllStudent({
      firstName,
      lastName,
      email,
      phoneNumber,
      parentsPhoneNumber,
      sortBy,
      sortOrder,
      page,
      limit,
    });
  }

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('GetAllTeachersWithFilters')
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'phoneNumber', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'name'],
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phoneNumber') phoneNumber?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.UserService.findAllTeacher({
      name,
      email,
      phoneNumber,
      sortBy,
      sortOrder,
      page,
      limit,
    });
  }
}
