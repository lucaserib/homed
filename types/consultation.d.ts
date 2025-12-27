import { Consultation, Doctor } from './type';

export interface ConsultationDetails extends Consultation {
  estimatedArrivalTime?: number;
  distance?: number;
}

export interface DoctorWithDistance extends Doctor {
  distance: number;
  estimatedArrivalTime: number;
}

export type ConsultationStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';
