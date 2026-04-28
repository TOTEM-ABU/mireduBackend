import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Aziz' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'aziz@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'https://example.com.png/', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}
