export interface Product {
discountPercentage: number;
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    sale: boolean;
    thumbnail?: string;
    tags?: string[];
    quantity?: number;
    inStock?: boolean;
    createdAt: string;
}