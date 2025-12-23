import { Component, inject } from '@angular/core';
import { ProductCard } from '../product-card/product-card';
import { Product } from '../../../core/models/product';
import { ProductApi } from '../../../core/services/product-api';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, combineLatest, map, debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../../core/services/cart.service';
import { Router } from '@angular/router';

type Sort = 'priceAsc' | 'priceDesc' | 'dateAsc' | 'dateDesc';
const cmp = (s: Sort) => (a: Product, b: Product) =>
  s === 'priceAsc' ? a.price - b.price :
    s === 'priceDesc' ? b.price - a.price :
      s === 'dateAsc' ? a.createdAt.localeCompare(b.createdAt) :
        b.createdAt.localeCompare(a.createdAt);

@Component({
  selector: 'app-product-page',
  imports: [ProductCard, FormsModule, MatPaginatorModule, MatFormFieldModule, MatInput, MatLabel, MatSelectModule, AsyncPipe, MatSnackBarModule],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage {
  private service = inject(ProductApi);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  protected readonly products$ = this.service.list();


  private filters$ = new BehaviorSubject({
    title: '',
    sort: 'dateDesc' as Sort,
    priceMin: '0',
    priceMax: '10000',
  })

  title$ = this.filters$.pipe(
    map(f => f.title),
    debounceTime(200),
    distinctUntilChanged(),
    startWith(this.filters$.value.title)
  );

  filteredProducts$ = combineLatest([
    this.products$,
    this.filters$,
    this.title$
  ]).pipe(
    map(([products, filters, title]) => products.filter(product => {
      const matchesTitle =
        !title || product.title.toLowerCase().includes(title.toLowerCase());
      const matchesPriceMin =
        !filters.priceMin || product.price >= Number(filters.priceMin);
      const matchesPriceMax =
        !filters.priceMax || product.price <= Number(filters.priceMax);
      return matchesTitle && matchesPriceMin && matchesPriceMax;
    })
      .toSorted(cmp(filters.sort))
    )
  );

  page$ = new BehaviorSubject(1);
  pageSize = 10;
  paged$ = combineLatest([this.filteredProducts$, this.page$]).pipe(
    map(([items, page]) => {
      const start = (page - 1) * this.pageSize;
      const end = start + this.pageSize;
      return items.slice(start, end);
    })
  );
  updateTitle(title: string) {
    console.log('Filtri applicati:');
    this.filters$.next({ ...this.filters$.value, title: title });
  }

  updateMin(min: string) {
    console.log('Filtri applicati:');
    this.filters$.next({ ...this.filters$.value, priceMin: min });
  }

  updateMax(max: string) {
    console.log('Filtri applicati:');
    this.filters$.next({ ...this.filters$.value, priceMax: max });
  }

  onAddToCart(product: Product) {
    // Check stock availability
    if (!product.inStock || product.quantity === 0) {
      this.snackBar.open('This product is out of stock', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.cartService.addToCart(product.id).subscribe({
      next: () => {
        this.snackBar.open(`${product.title} added to cart`, 'View Cart', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        }).onAction().subscribe(() => {
          // Navigate to cart when "View Cart" is clicked
          this.router.navigate(['/cart']);
        });
      },
      error: (err) => {
        if (err.status === 401) {
          this.snackBar.open('Please login to add items to cart', 'Login', {
            duration: 5000
          }).onAction().subscribe(() => {
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: this.router.url }
            });
          });
        } else {
          this.snackBar.open(
            err.error?.error || 'Failed to add to cart',
            'Close',
            {
              duration: 3000,
              panelClass: ['error-snackbar']
            }
          );
        }
      }
    });
  }
  updateSort(sort: Sort) {
    this.filters$.next({ ...this.filters$.value, sort: sort });
  }
  onPage(e: PageEvent) {
    this.page$.next(e.pageIndex + 1);
  }

}

