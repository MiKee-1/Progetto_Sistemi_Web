import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  create(order: Order): Observable<Order> {
    // Rails expects the data wrapped in an 'order' object
    return this.http.post<Order>(`${this.baseUrl}/orders`, { order });
  }
}
