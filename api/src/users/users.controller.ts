import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '创建用户' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: '获取用户列表' })
  async findAll(@Request() req: any) {
    const role = req.user?.role;
    if (role !== 'ADMIN' && role !== 'MANAGER') {
      const all = await this.usersService.findAll();
      if ((all?.length ?? 0) > 1) {
        throw new ForbiddenException();
      }
      return { success: true, data: all };
    }
    const data = await this.usersService.findAll();
    return { success: true, data };
  }

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  async profileFirst(@Request() req: any) {
    const data = await this.usersService.findOne(req.user.userId);
    return { success: true, data };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: '获取用户详情' })
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    if (!data) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException('用户不存在');
    }
    return { success: true, data };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '更新用户' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const existing = await this.usersService.findOne(id);
    if (!existing) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException('用户不存在');
    }
    const data = await this.usersService.update(id, updateUserDto);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '删除用户' })
  async remove(@Param('id') id: string) {
    const existing = await this.usersService.findOne(id);
    if (!existing) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException('用户不存在');
    }
    const data = await this.usersService.remove(id);
    return { success: true, data };
  }


  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '更新用户（PUT别名）' })
  async updatePut(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const existing = await this.usersService.findOne(id);
    if (!existing) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException('用户不存在');
    }
    const data = await this.usersService.update(id, updateUserDto);
    return { success: true, data };
  }
}
