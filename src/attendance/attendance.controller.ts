import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AuthGuard, RoleGuard, Roles } from 'src/tools';
import { RoleType } from 'src/generated/prisma/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  @ApiOperation({ summary: 'Yangi davomat yaratish' })
  create(@Body() data: CreateAttendanceDto) {
    return this.attendanceService.create(data);
  }

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('bulk')
  bulkCreate(@Body() data: any) {
    return this.attendanceService.bulkCreate(data);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha davomatlarni filtr bilan olish' })
  @ApiQuery({ name: 'groupId', required: false })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'date', required: false, example: '2026-03-23' })
  @ApiQuery({ name: 'sortBy', required: false, example: 'date' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('groupId') groupId?: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('sortBy') sortBy: string = 'date',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.attendanceService.findAll({
      groupId,
      studentId,
      status,
      date,
      sortBy,
      sortOrder,
      page,
      limit,
    });
  }

  @Roles(RoleType.STUDENT)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('student/:studentId')
  @ApiOperation({
    summary: 'Konkret bitta talabaning barcha davomatlarini olish',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getStudentAttendance(
    @Param('studentId') studentId: string,
    @Query() query: any,
  ) {
    return this.attendanceService.findByStudent(studentId, query);
  }

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Davomatni tahrirlash' })
  update(@Param('id') id: string, @Body() data: UpdateAttendanceDto) {
    return this.attendanceService.update(+id, data);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Davomatni o’chirib tashlash' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}
