import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from 'lib/fetch';
import {
  ConsultationDetails,
  MedicalRecord as MedicalRecordType,
} from '../../../types/consultation';

const PatientInfoCard = ({
  patient,
  consultation,
}: {
  patient: { name: string };
  consultation: { startTime?: string; scheduledTime?: string; complaint: string };
}) => (
  <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
    <Text className="mb-3 font-JakartaBold text-xl">Informações do Paciente</Text>

    <View className="mb-2">
      <Text className="font-JakartaMedium text-gray-500">Nome</Text>
      <Text className="font-JakartaSemiBold text-lg">{patient.name}</Text>
    </View>

    <View className="mb-2">
      <Text className="font-JakartaMedium text-gray-500">Data da Consulta</Text>
      <Text className="font-Jakarta">
        {new Date(consultation.startTime || consultation.scheduledTime || '').toLocaleDateString()}
      </Text>
    </View>

    <View className="mb-2">
      <Text className="font-JakartaMedium text-gray-500">Queixa</Text>
      <Text className="font-Jakarta">{consultation.complaint}</Text>
    </View>
  </View>
);

const EditableField = ({
  label,
  value,
  onChange,
  isEditing,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  isEditing: boolean;
}) => (
  <View className="mb-4">
    <Text className="mb-1 font-JakartaSemiBold">{label}</Text>
    {isEditing ? (
      <TextInput
        className="rounded-lg bg-gray-100 p-3 font-Jakarta"
        value={value}
        onChangeText={onChange}
        multiline
        numberOfLines={3}
        placeholder={`Digite ${label.toLowerCase()}`}
      />
    ) : (
      <Text className="rounded-lg bg-gray-50 p-3 font-Jakarta">
        {value || `Nenhum ${label.toLowerCase()} registrado`}
      </Text>
    )}
  </View>
);

// Componente principal de prontuário médico
const MedicalRecordScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAPI(`/(api)/consultation/${id}`)
        .then((response) => {
          if (response.data) {
            setConsultation(response.data);
            setDiagnosis(response.data.diagnosis || '');
            setTreatment(response.data.treatment || '');
            setNotes(response.data.notes || '');
            setMedicalHistory(response.data.medicalHistory || '');
            setAllergies(response.data.allergies || '');
            setMedications(response.data.medications || '');
          }
        })
        .catch((error) => {
          console.error('Error fetching medical record:', error);
          Alert.alert('Erro', 'Não foi possível carregar o prontuário médico');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const saveMedicalRecord = async () => {
    if (!user?.id || !id) return;

    setSaving(true);

    try {
      const updatedRecord: Partial<MedicalRecordType> = {
        diagnosis,
        treatment,
        notes,
        patientHistory: medicalHistory,
        allergies,
        medications,
      };

      await fetchAPI(`/(api)/consultation/${id}/update-medical-record`, {
        method: 'POST',
        body: JSON.stringify({
          doctorId: user.id,
          ...updatedRecord,
        }),
      });

      Alert.alert('Sucesso', 'Prontuário atualizado com sucesso');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving medical record:', error);
      Alert.alert('Erro', 'Não foi possível salvar o prontuário');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-general-500">
        <ActivityIndicator size="large" color="#0286FF" />
      </SafeAreaView>
    );
  }

  if (!consultation) {
    return (
      <View className="flex-1 items-center justify-center bg-general-500 p-5">
        <Text className="mb-4 text-center font-JakartaSemiBold text-lg">
          Prontuário não encontrado
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-primary-500 px-5 py-3">
          <Text className="font-JakartaBold text-white">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <ScrollView className="p-5">
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="font-JakartaBold text-2xl">Prontuário Médico</Text>
          {consultation.status === 'completed' ? (
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              className="rounded-full bg-primary-500 px-4 py-2">
              <Text className="font-JakartaBold text-white">
                {isEditing ? 'Cancelar' : 'Editar'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Informações do Paciente */}
        <PatientInfoCard patient={consultation.patient} consultation={consultation} />

        {/* Avaliação Médica */}
        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaBold text-xl">Avaliação Médica</Text>

          <EditableField
            label="Diagnóstico"
            value={diagnosis}
            onChange={setDiagnosis}
            isEditing={isEditing}
          />

          <EditableField
            label="Tratamento"
            value={treatment}
            onChange={setTreatment}
            isEditing={isEditing}
          />

          <EditableField
            label="Observações"
            value={notes}
            onChange={setNotes}
            isEditing={isEditing}
          />
        </View>

        {/* Histórico Médico */}
        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaBold text-xl">Histórico do Paciente</Text>

          <EditableField
            label="Histórico Médico"
            value={medicalHistory}
            onChange={setMedicalHistory}
            isEditing={isEditing}
          />

          <EditableField
            label="Alergias"
            value={allergies}
            onChange={setAllergies}
            isEditing={isEditing}
          />

          <EditableField
            label="Medicamentos em Uso"
            value={medications}
            onChange={setMedications}
            isEditing={isEditing}
          />
        </View>

        {isEditing && (
          <TouchableOpacity
            onPress={saveMedicalRecord}
            disabled={saving}
            className="mb-10 rounded-full bg-success-500 p-4">
            {saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-center font-JakartaBold text-white">Salvar Prontuário</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MedicalRecordScreen;
