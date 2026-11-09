import { Injectable } from '@nestjs/common';

export interface ReportRecord {
  id: string;
  reporterId: string;
  targetType: 'user' | 'chat' | 'anonymous_message';
  targetId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

@Injectable()
export class ModerationService {
  private readonly reports: ReportRecord[] = [];
  private readonly bannedPatterns = [
    /\b(sex|porn|casino|bet88|kubet|nhà cái|cờ bạc|lừa đảo)\b/gi,
    /\b\d{10,11}\b/g, // Mask phone numbers in anonymous board for privacy
  ];

  sanitizeContent(raw: string, maxLength = 160): string {
    let text = (raw || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
    for (const pattern of this.bannedPatterns) {
      text = text.replace(pattern, '***');
    }
    return text;
  }

  createReport(payload: {
    reporterId: string;
    targetType: 'user' | 'chat' | 'anonymous_message';
    targetId: string;
    reason: string;
  }): ReportRecord {
    const record: ReportRecord = {
      id: `rep_${Math.random().toString(36).slice(2, 10)}`,
      reporterId: payload.reporterId || 'anonymous',
      targetType: payload.targetType || 'chat',
      targetId: payload.targetId || 'unknown',
      reason: this.sanitizeContent(payload.reason || 'Vi phạm quy tắc cộng đồng', 200),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.reports.unshift(record);
    return record;
  }

  getReports(): ReportRecord[] {
    return this.reports.slice(0, 50);
  }
}

