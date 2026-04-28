import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { AttendanceStatus } from 'src/generated/prisma/enums';

export class CreateAttendanceDto {
  @ApiProperty({ example: 'PRESENT | ABSENT | LATE' })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

  @ApiProperty({ example: 'Group`s UUID' })
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ example: 'Student`s UUID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: '2026-03-23T12:00:00.000Z' })
  @IsString()
  date?: string;
}
