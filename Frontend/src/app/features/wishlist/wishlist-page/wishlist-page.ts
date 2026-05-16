import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistItem } from '../../../core/models/wishlist';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.scss',
})
export class WishlistPage implements OnInit {
  protected wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = this.wishlistService.loading;
  error = this.wishlistService.error;
  items = this.wishlistService.items;
  itemCount = this.wishlistService.itemCount;
  isEmpty = this.wishlistService.isEmpty;

  ngOnInit(): void {
    this.wishlistService.loadWishlist();
  }

  removeItem(item: WishlistItem): void {
    this.wishlistService.removeItem(item.id).subscribe({
      next: () => this.showMessage('Prodotto rimosso dalla wishlist'),
      error: () => this.showMessage('Errore nella rimozione', true)
    });
  }

  moveToCart(item: WishlistItem): void {
    this.cartService.addToCart(item.productId).subscribe({
      next: () => {
        this.wishlistService.removeItem(item.id).subscribe();
        this.showMessage(`${item.product.title} aggiunto al carrello`);
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Errore durante l\'aggiunta al carrello', true);
      }
    });
  }

  clearWishlist(): void {
    if (confirm('Vuoi svuotare la wishlist?')) {
      this.wishlistService.clearWishlist().subscribe({
        next: () => this.showMessage('Wishlist svuotata'),
        error: () => this.showMessage('Errore durante il svuotamento', true)
      });
    }
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  private showMessage(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}
