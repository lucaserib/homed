import { DriverStore, LocationStore, MarkerData, DoctorStore, DoctorMarkerData, UserStore } from 'types/type';
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

export const useUserStore = create<UserStore>((set) => ({
  userName: null,
  userRole: null,
  setUserData: (name: string, role: 'patient' | 'doctor') => set(() => ({ userName: name, userRole: role })),
  clearUserData: () => set(() => ({ userName: null, userRole: null })),
}));

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) => set(() => ({ selectedDriver: driverId })),
  setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers })),
  clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
}));
