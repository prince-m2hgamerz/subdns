export interface SubdomainWithRecords {
  id: string;
  name: string;
  domain: string;
  fullDomain: string;
  target: string | null;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  proxied: boolean;
  sslStatus: string | null;
  dnsStatus: string | null;
  isFavorite: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  dnsRecords: DnsRecordItem[];
}

export interface DnsRecordItem {
  id: string;
  type: "A" | "AAAA" | "CNAME" | "TXT" | "MX" | "SRV" | "CAA";
  name: string;
  value: string;
  ttl: number;
  proxied: boolean;
  priority: number | null;
  status: "ACTIVE" | "PENDING" | "FAILED";
  subdomainId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  ip: string | null;
  userAgent: string | null;
  metadata: any;
  userId: string | null;
  subdomainId: string | null;
  createdAt: Date;
}

export interface DashboardStats {
  totalSubdomains: number;
  activeSubdomains: number;
  totalDnsRecords: number;
  recentActivity: ActivityItem[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSubdomains: number;
  totalDnsRecords: number;
  dailySignups: { date: string; count: number }[];
  popularDomains: { name: string; count: number }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
