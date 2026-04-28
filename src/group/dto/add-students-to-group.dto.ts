import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AddStudentsToGroupDto {
  @ApiProperty({ example: 'Student`s UUID' })
  @IsString()
  studentId: string;

  @ApiProperty({ example: 'Group`s UUID' })
  @IsString()
  groupId: string;
}
