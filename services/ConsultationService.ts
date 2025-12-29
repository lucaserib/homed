import { fetchAPI } from '../lib/fetch';

interface CreateConsultationDto {
  patientId: string;
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
  complaint?: string;
}

interface AcceptConsultationDto {
  doctorId: string;
  doctorLatitude: number;
  doctorLongitude: number;
}

interface UpdateDoctorLocationDto {
  doctorId: string;
  latitude: number;
  longitude: number;
}

export class ConsultationService {
  static async createConsultation(data: CreateConsultationDto) {
    return fetchAPI('/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getPendingConsultations(latitude?: number, longitude?: number, radius?: number) {
    const params = new URLSearchParams();
    if (latitude) params.append('latitude', latitude.toString());
    if (longitude) params.append('longitude', longitude.toString());
    if (radius) params.append('radius', radius.toString());

    const queryString = params.toString();
    return fetchAPI(`/consultations/pending${queryString ? `?${queryString}` : ''}`);
  }

  static async getPatientConsultations(patientId: string, status?: string) {
    const url = status
      ? `/consultations/patient/${patientId}?status=${status}`
      : `/consultations/patient/${patientId}`;
    return fetchAPI(url);
  }

  static async getDoctorConsultations(doctorId: string, status?: string) {
    const url = status
      ? `/consultations/doctor/${doctorId}?status=${status}`
      : `/consultations/doctor/${doctorId}`;
    return fetchAPI(url);
  }

  static async getConsultationDetails(consultationId: string) {
    return fetchAPI(`/consultations/${consultationId}`);
  }

  static async acceptConsultation(consultationId: string, data: AcceptConsultationDto) {
    return fetchAPI(`/consultations/${consultationId}/accept`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async declineConsultation(consultationId: string, doctorId: string) {
    return fetchAPI(`/consultations/${consultationId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ doctorId }),
    });
  }

  static async startConsultation(consultationId: string) {
    return fetchAPI(`/consultations/${consultationId}/start`, {
      method: 'POST',
    });
  }

  static async completeConsultation(consultationId: string) {
    return fetchAPI(`/consultations/${consultationId}/complete`, {
      method: 'POST',
    });
  }

  static async updateDoctorLocation(data: UpdateDoctorLocationDto) {
    return fetchAPI('/consultations/doctor/update-location', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async findNearbyDoctors(
    latitude: number,
    longitude: number,
    maxRadius?: number,
    specialty?: string,
  ) {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      ...(maxRadius && { maxRadius: maxRadius.toString() }),
      ...(specialty && { specialty }),
    });

    return fetchAPI(`/consultations/nearby/doctors?${params.toString()}`);
  }
}
