import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaymentStatus, PaymentType } from 'src/generated/prisma/enums';

export class CreatePaymentDto {
  @ApiProperty({ example: 500000 })
  @IsInt()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'CASH | CARD' })
  @IsEnum(PaymentType)
  @IsNotEmpty()
  paymentType: PaymentType;

  @ApiProperty({ example: 'PAID | UNPAID | PENDING' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ example: 'Student`s UUID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: '2026-03-23T12:00:00.000Z', required: false })
  @IsOptional()
  @IsString()
  date?: string;
}

export class UpdatePaymentDto extends CreatePaymentDto {}
