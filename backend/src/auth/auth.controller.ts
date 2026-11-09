import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('guest')
  loginGuest(
    @Body()
    body: {
      guestId?: string;
      nickname?: string;
      avatarId?: string;
      outfitId?: string;
      mood?: string;
    },
  ) {
    return this.authService.authenticateGuest(body);
  }
}

