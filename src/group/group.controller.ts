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
  Req,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard, RoleGuard, Roles } from 'src/tools';
import { RoleType } from 'src/generated/prisma/enums';
import { ApiQuery } from '@nestjs/swagger';
import { AddStudentsToGroupDto } from './dto/add-students-to-group.dto';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @UseGuards(AuthGuard)
  @Get('my-groups')
  findMyGroups(@Req() req: any) {
    return this.groupService.findMyGroups(req.user?.id);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  create(@Body() data: CreateGroupDto) {
    return this.groupService.createGroup(data);
  }

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('GetAllGroupsWithFilters')
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'courseType', required: false })
  @ApiQuery({ name: 'teacherId', required: false })
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
    @Query('courseType') courseType?: string,
    @Query('teacherId') teacherId?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.groupService.findAllGroup({
      name,
      courseType,
      teacherId,
      sortBy,
      sortOrder,
      page,
      limit,
    });
  }

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('addStudentToGroup')
  addStudentToGroup(@Body() data: AddStudentsToGroupDto) {
    console.log('Adding student to group request received:', data);
    return this.groupService.addStudentToGroup(data);
  }

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOneGroup(id);
  }

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.updateGroup(id, updateGroupDto);
  }

  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.removeGroup(id);
  }
}
