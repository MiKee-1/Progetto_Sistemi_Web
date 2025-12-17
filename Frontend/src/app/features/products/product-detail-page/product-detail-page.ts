import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap, map } from 'rxjs';
import { ProductApi } from '../../../core/services/product-api';
import { Product } from '../../../core/models/product';
import { NgIf, AsyncPipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  templateUrl: './product-detail-page.html',
  imports: [RouterModule, NgIf, AsyncPipe, CurrencyPipe, MatCardModule, MatButtonModule],
})

export class ProductDetailPage {
  private route = inject(ActivatedRoute);
  private svc = inject(ProductApi);
  readonly product$ = this.route.paramMap.pipe(
    map(params => params.get('id') as string),
    switchMap(id => this.svc.getById(id)),
  );
}