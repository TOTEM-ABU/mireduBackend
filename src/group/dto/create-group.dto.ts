import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { CourseType } from 'src/generated/prisma/enums';

export class CreateGroupDto {
  @ApiProperty({ example: 'Group-007' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Math group!' })
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Math | English' })
  @IsEnum(CourseType)
  @IsNotEmpty()
  courseType: CourseType;

  @ApiProperty({ example: 550000 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: '1,3,5' })
  @IsString()
  @IsOptional()
  days?: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({ example: '16:00' })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({ example: 'Teacher`s UUID' })
  @IsUUID()
  @IsOptional()
  teacherId?: string;
}
