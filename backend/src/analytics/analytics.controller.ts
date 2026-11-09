import { Controller, Get, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  getSummary() {
    return this.analyticsService.getSummary(0);
  }

  @Post('photo')
  recordPhoto() {
    this.analyticsService.incrementPhoto();
    return { ok: true };
  }
}

