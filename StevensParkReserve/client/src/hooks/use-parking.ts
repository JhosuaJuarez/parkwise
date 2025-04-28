import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ParkingLot, ParkingSpot } from '@/lib/types';
import { queryClient } from '@/lib/queryClient';

export function useParkingLots() {
  return useQuery<ParkingLot[]>({
    queryKey: ['/api/parking-lots'],
  });
}

export function useParkingLot(lotId: number | null) {
  return useQuery<ParkingLot>({
    queryKey: ['/api/parking-lots', lotId],
    enabled: !!lotId
  });
}

export function useSelectedLot() {
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
  const { data: parkingLots } = useParkingLots();
  
  // When we get a specific lot, this includes the full spot data
  const { data: selectedLot, isLoading: isLoadingLot } = useQuery<ParkingLot>({
    queryKey: ['/api/parking-lots', selectedLotId],
    enabled: !!selectedLotId,
  });
  
  // Initialize with the first lot if none selected and data is available
  useEffect(() => {
    if (!selectedLotId && parkingLots && parkingLots.length > 0) {
      console.log('Auto-selecting first lot:', parkingLots[0].id);
      setSelectedLotId(parkingLots[0].id);
    }
  }, [parkingLots, selectedLotId]);
  
  // For debugging
  useEffect(() => {
    if (selectedLotId) {
      console.log('Selected lot ID in useSelectedLot:', selectedLotId);
    }
    if (selectedLot) {
      console.log('Selected lot data loaded:', selectedLot);
    }
  }, [selectedLotId, selectedLot]);
  
  // Create a custom setter function that ensures we always set a valid lot ID
  const setSafeLotId = (id: number | null) => {
    console.log('setSafeLotId called with:', id);
    if (id !== null && typeof id === 'number') {
      setSelectedLotId(id);
    } else {
      console.log('Invalid lot ID, not setting:', id);
    }
  };
  
  // Ensure we always pass a valid selected lot
  // If we don't have the lot from the API yet, fallback to the lot from the list
  const validSelectedLot = selectedLot || (selectedLotId && parkingLots ? 
    parkingLots.find(lot => lot.id === selectedLotId) : null);
  
  return {
    selectedLotId,
    setSelectedLotId: setSafeLotId,  // Use our safe setter
    selectedLot: validSelectedLot,
    parkingLots,
    isLoading: !parkingLots || isLoadingLot
  };
}

export function useSpotAvailability(lotId: number | null, spotType: string, date: string, timeSlot: string) {
  console.log('useSpotAvailability getting data for lotId:', lotId);
  console.log('useSpotAvailability getting data for spotType:', spotType);
  
  // For demo purposes, always generate demo spots regardless of whether lotId is passed
  // This ensures users can always make a reservation in the demo
  
  // If we have a lotId, use it, otherwise default to 1
  const effectiveLotId = lotId !== null && lotId !== undefined ? lotId : 1;
  console.log('Using effective lot ID for demo spots:', effectiveLotId);
  
  // Create demo spots based on the effective lot ID
  const demoAvailableSpots: ParkingSpot[] = [];
  
  // Generate demo available spots for demonstration purposes
  if (spotType === 'student') {
    // Add 5 student spots for demo
    for (let i = 1; i <= 5; i++) {
      demoAvailableSpots.push({
        id: i * 100 + effectiveLotId,
        lotId: effectiveLotId,
        spotNumber: `S${i}`,
        type: 'student',
        isAvailable: true
      });
    }
  } else if (spotType === 'faculty') {
    // Add 3 faculty spots for demo
    for (let i = 1; i <= 3; i++) {
      demoAvailableSpots.push({
        id: i * 200 + effectiveLotId,
        lotId: effectiveLotId,
        spotNumber: `F${i}`,
        type: 'faculty',
        isAvailable: true
      });
    }
  } else {
    // Add 8 regular spots for demo
    for (let i = 1; i <= 8; i++) {
      demoAvailableSpots.push({
        id: i * 300 + effectiveLotId,
        lotId: effectiveLotId,
        spotNumber: `R${i}`,
        type: 'regular',
        isAvailable: true
      });
    }
  }
  
  console.log(`Demo ${spotType} spots for lot:`, demoAvailableSpots);
  
  return {
    availableSpots: demoAvailableSpots,
    totalTypeSpots: spotType === 'student' ? 15 : (spotType === 'faculty' ? 8 : 20),
    hasAvailableSpots: true
  };
}

export function getAvailabilityColor(availablePercentage: number): string {
  if (availablePercentage > 50) return 'bg-green-600';
  if (availablePercentage > 20) return 'bg-yellow-500';
  if (availablePercentage > 0) return 'bg-stevens-red';
  return 'bg-gray-400';
}
