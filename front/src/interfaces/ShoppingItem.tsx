export interface ShoppingItem {
  _id: string;
  name: string;
  quantity: number;
  category?: string;
  unit?: string;
  isPurchased: boolean;
  itemGroupId: string | null;
}
