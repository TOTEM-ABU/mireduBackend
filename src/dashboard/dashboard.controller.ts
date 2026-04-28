import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard, RoleGuard, Roles } from '../tools';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard, RoleGuard)
@Roles('ADMIN', 'TEACHER')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('charts')
  getChartData() {
    return this.dashboardService.getChartData();
  }

  @Get('recent')
  getRecentActions() {
    return this.dashboardService.getRecentActions();
  }
}
