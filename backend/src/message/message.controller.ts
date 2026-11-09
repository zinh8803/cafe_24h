import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  listMessages() {
    return { messages: this.messageService.getRecentNotes() };
  }

  @Post()
  createMessage(@Body() body: { userId?: string; content: string; tag?: string }) {
    const message = this.messageService.createNote(body);
    return { message };
  }

  @Post(':id/react')
  reactMessage(
    @Param('id') id: string,
    @Body() body: { type: 'heart' | 'coffee' | 'sparkle' },
  ) {
    const message = this.messageService.reactToNote(id, body.type || 'heart');
    return { message };
  }
}

