import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @Length(6, 8)
  @IsNotEmpty()
  newPassword: string;
}
