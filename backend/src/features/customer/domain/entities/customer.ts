export interface Customer {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  postcode?: string | null;
  utilityAccountNo?: string | null;
  utilityType?: string | null;
  monthlyBill?: number | null;
  arrears?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
