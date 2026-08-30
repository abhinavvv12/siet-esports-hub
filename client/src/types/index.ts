export type Role = 'ADMIN' | 'COORDINATOR' | 'PARTICIPANT';
export type EventStatus = 'DRAFT' | 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type RegistrationStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type CertificateStatus = 'NOT_GENERATED' | 'GENERATED' | 'REVOKED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  profilePhoto?: string;
}

export interface Tournament {
  id: string;
  name: string;
  game: string;
  description?: string;
  bannerImage?: string;
  logo?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  venue?: string;
  entryFee?: string;
  maxTeams?: number;
  teamSize: number;
  prizePool?: string;
  status: EventStatus;
  registrationOpen: boolean;
  displayOrder: number;
  _count?: { registrations: number };
}

export interface Player {
  id: string;
  playerNumber: number;
  fullName: string;
  rollNumber: string;
  classSection: string;
  year: string;
  department: string;
  email?: string;
  mobile?: string;
  isLeader: boolean;
}

export interface Payment {
  id: string;
  status: PaymentStatus;
  amount?: number;
  method: string;
  verifiedAt?: string;
  notes?: string;
}

export interface Certificate {
  id: string;
  certificateId: string;
  status: CertificateStatus;
  issuedTo: string;
  playerId: string;
  generatedAt?: string;
}

export interface Registration {
  id: string;
  registrationCode: string;
  tournamentId: string;
  teamName: string;
  status: RegistrationStatus;
  rejectionReason?: string;
  teamLeaderEmail: string;
  teamLeaderMobile: string;
  submittedAt: string;
  approvedAt?: string;
  players: Player[];
  payment?: Payment;
  tournament?: { name: string; game: string; venue?: string };
  certificates?: Certificate[];
  _count?: { certificates: number };
}

export interface FacultyCoordinator {
  id: string;
  name: string;
  designation: string;
  department: string;
  email?: string;
  phone?: string;
  photo?: string;
  displayOrder: number;
}

export interface StudentCoordinator {
  id: string;
  name: string;
  department: string;
  year: string;
  role?: string;
  phone?: string;
  email?: string;
  photo?: string;
  displayOrder: number;
}

export interface Rule {
  id: string;
  ruleNumber: number;
  content: string;
  isActive: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  category?: string;
  isFeatured: boolean;
  displayOrder: number;
}

export interface Winner {
  id: string;
  tournamentId: string;
  game: string;
  position: 'FIRST' | 'SECOND' | 'THIRD' | 'MVP';
  teamName: string;
  players: string[];
  photo?: string;
  tournament?: { name: string };
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  image?: string;
  status: string;
  publishDate?: string;
  expiryDate?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRegistrations: number;
  pendingRegistrations: number;
  approvedTeams: number;
  rejectedRegistrations: number;
  bgmiTeams: number;
  freeFireTeams: number;
  totalPlayers: number;
  certificatesGenerated: number;
  recentRegistrations: Registration[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WebsiteContent {
  [key: string]: string;
}
