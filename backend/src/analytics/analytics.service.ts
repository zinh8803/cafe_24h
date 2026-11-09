import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  private totalDrinksServed = 48;
  private totalVisitsToday = 112;
  private totalPhotosCaptured = 27;

  incrementVisit() {
    this.totalVisitsToday += 1;
  }

  incrementDrink() {
    this.totalDrinksServed += 1;
  }

  incrementPhoto() {
    this.totalPhotosCaptured += 1;
  }

  getSummary(currentOnline: number) {
    return {
      currentOnline,
      totalDrinksServed: this.totalDrinksServed,
      totalVisitsToday: this.totalVisitsToday,
      totalPhotosCaptured: this.totalPhotosCaptured,
    };
  }
}

