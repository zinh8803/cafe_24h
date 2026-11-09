import { Body, Controller, Get, Post } from '@nestjs/common';
import { ModerationService } from './moderation.service';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('report')
  submitReport(
    @Body()
    body: {
      reporterId: string;
      targetType: 'user' | 'chat' | 'anonymous_message';
      targetId: string;
      reason: string;
    },
  ) {
    const report = this.moderationService.createReport(body);
    return { report };
  }

  @Get('reports')
  listReports() {
    return { reports: this.moderationService.getReports() };
  }
}

