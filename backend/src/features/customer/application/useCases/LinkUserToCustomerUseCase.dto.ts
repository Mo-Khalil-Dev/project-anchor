export interface LinkUserToCustomerOutput {
    id: string;
    email: string;
    utilityType: string | null;
    postcode: string | null;
    utilityAccountNo: string | null;
    createdAt: Date;
}