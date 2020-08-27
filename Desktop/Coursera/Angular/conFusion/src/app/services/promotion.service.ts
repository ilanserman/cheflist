import { Injectable } from '@angular/core';
import { Promotion } from '../shared/promotion';
import { PROMOTIONS } from '../shared/promotions';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {

  constructor() { }

  getPromotions(): Promotion[] {
    return PROMOTIONS;
  }

  getPromotion(id: String): Promise<Promotion> {
    return new Promise(resolve => {
      setTimeout(()=>resolve(PROMOTIONS.filter(promo => {promo.id === id})[0]),2000);
    });
  }

  getFeaturedPromotion(): Promise<Promotion> {
    return new Promise(resolve => {
      setTimeout(()=>resolve(PROMOTIONS.filter(promo=>promo.featured)[0]),2000);
    });
  }

}