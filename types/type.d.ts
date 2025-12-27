import { TextInputProps, TouchableOpacityProps } from 'react-native';

// Doctor types based on Prisma schema
export interface Doctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNumber: string;
  profileImageUrl?: string;
  hourlyRate: number;
  rating: number;
  serviceRadius: number;
  isAvailable: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

// Patient/User types based on Prisma schema  
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  cpf?: string;
  address?: string;
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Consultation types based on Prisma schema
export interface Consultation {
  consultationId: string;
  patientId: string;
  doctorId?: string;
  status: string;
  complaint?: string;
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  totalPrice?: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  patient?: User;
  doctor?: Doctor;
}

// Map marker data for doctors
declare interface DoctorMarkerData {
  latitude: number;
  longitude: number;
  id: string;
  title: string;
  profileImageUrl?: string;
  specialty: string;
  rating: number;
  firstName: string;
  lastName: string;
  hourlyRate: number;
  isAvailable: boolean;
  estimatedArrival?: number;
}

declare interface MapProps {
  destinationLatitude?: number;
  destinationLongitude?: number;
  onDoctorTimesCalculated?: (doctorsWithTimes: DoctorMarkerData[]) => void;
  selectedDoctor?: string | null;
  onMapReady?: () => void;
}

// Legacy Ride type - will be replaced by Consultation
declare interface Ride {
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  ride_time: number;
  fare_price: number;
  payment_status: string;
  driver_id: number;
  user_email: string;
  created_at: string;
  driver: {
    first_name: string;
    last_name: string;
    car_seats: number;
  };
}

declare interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success' | 'light';
  textVariant?: 'primary' | 'default' | 'secondary' | 'danger' | 'success';
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  className?: string;
}

declare interface GoogleInputProps {
  icon?: string;
  initialLocation?: string;
  containerStyle?: string;
  textInputBackgroundColor?: string;
  handlePress: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

declare interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}

// Updated for consultation payment
declare interface ConsultationPaymentProps {
  fullName: string;
  email: string;
  amount: string;
  doctorId: string;
  estimatedDuration: number;
}

declare interface LocationStore {
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

// Updated store for doctors
declare interface DoctorStore {
  doctors: DoctorMarkerData[];
  selectedDoctor: string | null;
  setSelectedDoctor: (doctorId: string) => void;
  setDoctors: (doctors: DoctorMarkerData[]) => void;
  clearSelectedDoctor: () => void;
}

declare interface DoctorCardProps {
  item: DoctorMarkerData;
  selected: string | null;
  setSelected: () => void;
}

// Medical Record types
declare interface MedicalRecord {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Chat/Message types
declare interface Message {
  id: string;
  consultationId: string;
  senderId: string;
  senderType: 'patient' | 'doctor';
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

// Rating types
declare interface Rating {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy types for backward compatibility
declare interface Driver {
  driver_id: number;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  car_image_url: string;
  car_seats: number;
  rating: number;
}

declare interface MarkerData {
  latitude: number;
  longitude: number;
  id: number;
  title: string;
  profile_image_url: string;
  car_image_url: string;
  car_seats: number;
  rating: number;
  first_name: string;
  last_name: string;
  time?: number;
  price?: string;
}

declare interface DriverStore {
  drivers: MarkerData[];
  selectedDriver: number | null;
  setSelectedDriver: (driverId: number) => void;
  setDrivers: (drivers: MarkerData[]) => void;
  clearSelectedDriver: () => void;
}

declare interface DriverCardProps {
  item: MarkerData;
  selected: number;
  setSelected: () => void;
}

declare interface PaymentProps {
  fullName: string;
  email: string;
  amount: string;
  driverId: number;
  rideTime: number;
}