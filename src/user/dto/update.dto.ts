import { PartialType, IntersectionType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { CreateAdminDto } from './create-admin.dto';
import { CreateTeacherDto } from './create-teacher.dto';

class AdminAndTeacher extends IntersectionType(
  CreateAdminDto,
  CreateTeacherDto,
) {}

export class UpdateDto extends PartialType(
  IntersectionType(CreateStudentDto, AdminAndTeacher),
) {}
