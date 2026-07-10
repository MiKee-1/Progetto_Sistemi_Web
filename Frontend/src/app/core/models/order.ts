import { Product } from './product';
import { User } from './user';

export interface Customer {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
}

export interface Address {
    street: string | null;
    city: string | null;
    zip: string | null;
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: string;
    quantity: number;
    unitPrice: number;
    createdAt: string;
    updatedAt: string;
    product?: Product;
}

export interface Order {
    id?: number;
    customer: Customer;
    address: Address;
    items?: Product[];
    orderItems?: OrderItem[];
    total: number;
    userId?: number;
    // Presente solo negli ordini non-guest (il backend lo aggiunge in as_json)
    user?: User;
    createdAt: string;
    updatedAt?: string;
}