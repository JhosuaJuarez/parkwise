// Types for frontend application state

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

export interface ParkingLot {
  id: number;
  name: string;
  description: string;
  totalSpots: number;
  availableSpots: number;
  latitude: string;
  longitude: string;
  spots?: ParkingSpot[];
}

export interface Vehicle {
  id: number;
  userId: number;
  make: string;
  model: string;
  licensePlate: string;
  state: string;
}

export interface ParkingSpot {
  id: number;
  lotId: number;
  spotNumber: string;
  type: string;
  isAvailable: boolean;
}

export interface Reservation {
  id: number;
  userId: number;
  spotId: number;
  vehicleId: number;
  startTime: string;
  endTime: string;
  status: string;
  confirmationCode: string;
  spot?: ParkingSpot;
  lot?: ParkingLot;
  vehicle?: Vehicle;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
}
