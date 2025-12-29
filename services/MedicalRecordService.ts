import { fetchAPI } from '../lib/fetch';

interface CreateMedicalRecordDto {
  consultationId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
}

interface UpdateMedicalRecordDto {
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

export class MedicalRecordService {
  static async createRecord(data: CreateMedicalRecordDto) {
    return fetchAPI('/(api)/medical-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getRecordByConsultation(consultationId: string) {
    return fetchAPI(`/(api)/medical-records/consultation/${consultationId}`);
  }

  static async updateRecord(recordId: string, data: UpdateMedicalRecordDto) {
    return fetchAPI(`/(api)/medical-records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
