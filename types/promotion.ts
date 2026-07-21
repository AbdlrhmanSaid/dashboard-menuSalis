export interface Promotion {
  _id: string;
  title: string;
  description?: string;
  banner?: {
    url: string;
    public_id: string;
  } | null;
  targetType: 'Product' | 'Menu' | 'Company';
  target: {
    _id: string;
    name: string;
    slug?: string; // for Company
  };
  discountType: 'Percentage' | 'Fixed Amount' | 'Fixed Price';
  discountValue: number;
  priority: number;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Expired';
  createdBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionRequest {
  title: string;
  description?: string;
  targetType: 'Product' | 'Menu' | 'Company';
  target: string; // ObjectId
  discountType: 'Percentage' | 'Fixed Amount' | 'Fixed Price';
  discountValue: number;
  priority?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  userName?: string;
  bannerFile?: File | null;
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {
  _id?: string;
}
