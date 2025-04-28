import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileMenu from '@/components/MobileMenu';
import CampusMap from '@/components/CampusMap';
import ReservationPanel from '@/components/ReservationPanel';
import NotificationPanel from '@/components/NotificationPanel';
import ReservationConfirmationModal from '@/components/ReservationConfirmationModal';
import { useSelectedLot } from '@/hooks/use-parking';
import { useNotifications } from '@/hooks/use-notifications';
import { User, Reservation } from '@/lib/types';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [confirmationReservation, setConfirmationReservation] = useState<Reservation | null>(null);
  
  // Get the current user
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/current'],
    // If the user is not logged in, return null instead of throwing
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: 'include',
        });
        if (res.status === 401) {
          return null;
        }
        await res.json();
        return res.json();
      } catch (error) {
        return null;
      }
    },
  });
  
  // Parking lot selection
  const { selectedLotId, setSelectedLotId, selectedLot, parkingLots, isLoading } = useSelectedLot();
  
  // Notifications
  const { 
    notifications,
    unreadCount,
    isOpen: isNotificationsOpen,
    setIsOpen: setNotificationsOpen,
    markAsRead,
    markAllAsRead
  } = useNotifications();
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchModal(false);
    // In a real app, we would filter lots based on the query
  };
  
  const handleReservationComplete = (reservation: Reservation) => {
    setConfirmationReservation(reservation);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header 
        user={user} 
        onSearch={handleSearch} 
      />
      
      <MobileMenu 
        onOpenSearch={() => setShowSearchModal(true)} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-5 flex flex-col md:flex-row gap-5">
        <CampusMap
          parkingLots={parkingLots || []}
          selectedLotId={selectedLotId}
          onSelectLot={(id) => {
            console.log('Home: Setting selected lot ID to:', id);
            setSelectedLotId(id);
            // If we have the parking lots already, we can set the selectedLot directly
            // This helps ensure the ReservationPanel gets the lot data immediately
            if (parkingLots) {
              const lot = parkingLots.find(lot => lot.id === id);
              console.log('Pre-selecting lot data:', lot);
            }
          }}
          isLoading={isLoading}
        />
        
        <ReservationPanel
          selectedLot={selectedLot}
          onReservationComplete={handleReservationComplete}
        />
      </main>
      
      <Footer />
      
      {/* Notifications panel */}
      <NotificationPanel
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
      
      {/* Reservation confirmation modal */}
      <ReservationConfirmationModal
        isOpen={!!confirmationReservation}
        onClose={() => setConfirmationReservation(null)}
        reservation={confirmationReservation}
      />
    </div>
  );
}
