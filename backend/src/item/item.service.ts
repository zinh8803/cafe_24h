import { Injectable } from '@nestjs/common';
import { CAFE_ITEMS, CafeItemDefinition } from '../common/cafe-world.config';

@Injectable()
export class ItemService {
  getAllItems(): CafeItemDefinition[] {
    return CAFE_ITEMS;
  }

  getDrinkById(drinkId: string): CafeItemDefinition | undefined {
    return CAFE_ITEMS.find((item) => item.id === drinkId && item.itemType === 'drink');
  }
}

