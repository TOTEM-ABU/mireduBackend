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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthGuard, RoleGuard, Roles } from 'src/tools';
import { RoleType } from 'src/generated/prisma/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  @ApiOperation({ summary: 'To’lov qabul qilish' })
  create(@Body() data: CreatePaymentDto) {
    return this.paymentService.create(data);
  }

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'paymentType', required: false })
  @ApiQuery({ name: 'studentId', required: false })
  findAll(@Query() query: any) {
    return this.paymentService.findAll(query);
  }

  @Roles(RoleType.ADMIN, RoleType.TEACHER, RoleType.STUDENT)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('student/:studentId')
  @ApiOperation({ summary: 'Bitta talabaning barcha to’lovlari' })
  findByStudent(@Param('studentId') studentId: string, @Query() query: any) {
    return this.paymentService.findByStudent(studentId, query);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdatePaymentDto) {
    return this.paymentService.update(+id, data);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
