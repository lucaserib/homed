export type ConsultationStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  image?: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNumber: string;
  bio?: string;
  hourlyRate: number;
  serviceRadius: number;
  isAvailable: boolean;
  availability?: DayAvailability[];
  profileImage?: string;
  documents?: string[];
  todayConsultations?: number;
  monthEarnings?: number;
  rating?: number;
  notifications?: number;
  clerkid?: string;
  // Nome completo calculado para exibição
  get name(): string;
}

export interface DayAvailability {
  day: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

export interface ConsultationDetails {
  consultationId: string;
  patientId: string;
  doctorId: string;
  patient: Patient;
  doctor?: Doctor;
  status: ConsultationStatus;
  originAddress: string;
  destinationAddress?: string;
  complaint: string;
  scheduledTime?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  totalPrice?: number;
  paymentStatus?: PaymentStatus;
  distance?: number;
  distanceUnit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  patientHistory?: string;
  allergies?: string;
  medications?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  id: string;
  consultationId: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  participants: {
    id: string;
    name: string;
    image?: string;
  }[];
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
}
