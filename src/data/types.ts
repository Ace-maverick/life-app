export type UserRole = 'poster' | 'lifer' | 'admin' | 'callcenter';

export type VerificationStatus = 'none' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'suspended';

export type TaskStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Invoice Sent'
  | 'Paid'
  | 'Receipt Issued'
  | 'Dispute Open'
  | 'Dispute Resolved'
  | 'Cancelled';

export type Urgency = 'Today' | 'Scheduled' | 'Urgent';

export type TaskFrequency = 'one_time' | 'daily' | 'weekly';

export type PaymentMethod = 'telebirr' | 'cbe_birr' | 'bank';

export interface User {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: UserRole;
  profileImage?: string;
  rating: number;
  ratingCount: number;
  createdAt: string;
  // Poster-specific
  discountPoints?: number;
  loyaltyCycles?: number;
  city?: string;
  area?: string;
  // Lifer-specific
  workTypes?: string[];
  serviceSubcategories?: string[];
  serviceArea?: string;
  radius?: number;
  verificationStatus?: VerificationStatus;
  isOnline?: boolean;
  cancellationCount?: number;
  // Call center specific
  employeeTitle?: string;
  team?: string;
  shift?: string;
}

export interface TaskLocation {
  city: string;
  area: string;
  landmark: string;
}

export interface Task {
  id: string;
  posterId: string;
  liferId?: string;
  categoryId: string;
  subcategoryId: string;
  jobTypeId: string;
  title: string;
  description?: string;
  location: TaskLocation;
  urgency: Urgency;
  frequency?: TaskFrequency;
  basePrice: number;
  serviceCharge: number;
  tip: number;
  discountApplied: number;
  status: TaskStatus;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  invoicedAt?: string;
  paidAt?: string;
  receiptAt?: string;
  posterRating?: number;
  liferRating?: number;
  paymentMethod?: PaymentMethod;
  receiptId?: string;
  invoiceId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'task' | 'payment' | 'verification' | 'dispute' | 'system';
  relatedTaskId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  liferId: string;
  liferName: string;
  phone: string;
  city: string;
  serviceArea: string;
  workTypes: string[];
  radius: number;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface Dispute {
  id: string;
  taskId: string;
  raisedBy: string;
  raisedByRole: UserRole;
  summary: string;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Closed';
  outcome?: 'Poster claim accepted' | 'Lifer claim accepted' | 'Settled' | 'No action';
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}
