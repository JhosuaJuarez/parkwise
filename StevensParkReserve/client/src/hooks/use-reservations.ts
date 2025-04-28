import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Reservation, Vehicle } from '@/lib/types';
import { format } from 'date-fns';

export function useReservations() {
  return useQuery<Reservation[]>({
    queryKey: ['/api/reservations'],
  });
}

export function useVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });
}

export function useReservationForm() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedSpotType, setSelectedSpotType] = useState<string>('student');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | string>('');
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  
  const reset = () => {
    setDate(new Date());
    setSelectedTimeSlot(null);
    setSelectedSpotType('student');
    setSelectedVehicleId('');
    setSelectedSpotId(null);
  };
  
  // Get available time slots
  const timeSlots = [
    { id: 'morning', label: '8:00 AM - 12:00 PM', start: '08:00', end: '12:00' },
    { id: 'afternoon', label: '12:00 PM - 4:00 PM', start: '12:00', end: '16:00' },
    { id: 'evening', label: '4:00 PM - 8:00 PM', start: '16:00', end: '20:00' },
    { id: 'night', label: '8:00 PM - 12:00 AM', start: '20:00', end: '00:00' }
  ];

  // Reservation creation mutation
  const createReservation = useMutation({
    mutationFn: async (reservationData: any) => {
      const response = await apiRequest('POST', '/api/reservations', reservationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reservations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      reset();
    }
  });
  
  // Cancel reservation mutation
  const cancelReservation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PUT', `/api/reservations/${id}/cancel`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reservations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });
  
  const handleCreateReservation = (lotId: number) => {
    if (!selectedTimeSlot || !selectedVehicleId || !selectedSpotId) {
      return Promise.reject(new Error('Please fill in all required fields'));
    }
    
    // Find the time slot
    const timeSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
    if (!timeSlot) {
      return Promise.reject(new Error('Invalid time slot selected'));
    }
    
    // Format dates for API
    const dateStr = format(date, 'yyyy-MM-dd');
    const startTime = new Date(`${dateStr}T${timeSlot.start}:00`);
    const endTime = new Date(`${dateStr}T${timeSlot.end}:00`);
    
    return createReservation.mutateAsync({
      spotId: selectedSpotId,
      vehicleId: selectedVehicleId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
  };
  
  return {
    date,
    setDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    selectedSpotType,
    setSelectedSpotType,
    selectedVehicleId,
    setSelectedVehicleId,
    selectedSpotId,
    setSelectedSpotId,
    timeSlots,
    createReservation: {
      mutate: handleCreateReservation,
      isPending: createReservation.isPending,
      isError: createReservation.isError,
      error: createReservation.error
    },
    cancelReservation: {
      mutate: cancelReservation.mutate,
      isPending: cancelReservation.isPending
    },
    reset
  };
}
