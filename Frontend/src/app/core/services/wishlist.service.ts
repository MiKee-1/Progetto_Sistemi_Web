import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Wishlist, AddToWishlistRequest } from '../models/wishlist';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly baseUrl = 'http://localhost:3000/api';

  private wishlistSignal = signal<Wishlist | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  wishlist = this.wishlistSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  itemCount = computed(() => this.wishlistSignal()?.itemCount ?? 0);
  items = computed(() => this.wishlistSignal()?.items ?? []);
  isEmpty = computed(() => (this.wishlistSignal()?.items?.length ?? 0) === 0);

  constructor(private http: HttpClient, private authService: AuthService) {
    if (this.authService.isLoggedIn()) {
      this.loadWishlist();
    }
  }

  loadWishlist(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<Wishlist>(`${this.baseUrl}/wishlist`).pipe(
      tap(wishlist => {
        this.wishlistSignal.set(wishlist);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        if (error.status !== 401) {
          console.error('Failed to load wishlist:', error);
          this.errorSignal.set('Failed to load wishlist');
        }
        this.loadingSignal.set(false);
        return of(null);
      })
    ).subscribe();
  }

  addToWishlist(productId: string): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const request: AddToWishlistRequest = { product_id: productId };

    return this.http.post<any>(`${this.baseUrl}/wishlist/items`, request).pipe(
      tap(response => {
        this.wishlistSignal.set(response.wishlist);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Failed to add to wishlist:', error);
        this.errorSignal.set(error.error?.error || 'Failed to add item to wishlist');
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  removeItem(itemId: number): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<any>(`${this.baseUrl}/wishlist/items/${itemId}`).pipe(
      tap(response => {
        this.wishlistSignal.set(response.wishlist);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Failed to remove wishlist item:', error);
        this.errorSignal.set(error.error?.error || 'Failed to remove item');
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  clearWishlist(): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<any>(`${this.baseUrl}/wishlist`).pipe(
      tap(response => {
        this.wishlistSignal.set(response.wishlist);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Failed to clear wishlist:', error);
        this.errorSignal.set(error.error?.error || 'Failed to clear wishlist');
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  isInWishlist(productId: string): boolean {
    return this.items().some(item => item.productId === productId);
  }

  resetWishlist(): void {
    this.wishlistSignal.set(null);
    this.errorSignal.set(null);
  }
}
