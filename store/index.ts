import { DriverStore, LocationStore, MarkerData, DoctorStore, DoctorMarkerData } from 'types/type';
import { create } from 'zustand';

export const useLocationStore = create<LocationStore>((set) => ({
  userAddress: null,
  userLongitude: null,
  userLatitude: null,
  destinationLongitude: null,
  destinationLatitude: null,
  destinationAddress: null,

  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));
  },
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));
  },
}));

// New Doctor Store for medical consultations
export const useDoctorStore = create<DoctorStore>((set) => ({
  doctors: [] as DoctorMarkerData[],
  selectedDoctor: null,
  setSelectedDoctor: (doctorId: string) => set(() => ({ selectedDoctor: doctorId })),
  setDoctors: (doctors: DoctorMarkerData[]) => set(() => ({ doctors })),
  clearSelectedDoctor: () => set(() => ({ selectedDoctor: null })),
}));

// Legacy Driver Store for backward compatibility
export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) => set(() => ({ selectedDriver: driverId })),
  setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers })),
  clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
}));
