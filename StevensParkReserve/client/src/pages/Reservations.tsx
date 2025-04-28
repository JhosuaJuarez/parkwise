import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileMenu from '@/components/MobileMenu';
import NotificationPanel from '@/components/NotificationPanel';
import QRCodeModal from '@/components/QRCodeModal';
import { useNotifications } from '@/hooks/use-notifications';
import { useReservations, useReservationForm } from '@/hooks/use-reservations';
import { User, Reservation } from '@/lib/types';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  CalendarDays, 
  Clock, 
  MapPin, 
  Car, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Search,
  QrCode
} from 'lucide-react';

export default function ReservationsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Get the current user
  const { data: user } = useQuery<User | null>({
    queryKey: ['/api/user/current'],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: 'include',
        });
        if (res.status === 401) {
          return null;
        }
        return res.json();
      } catch (error) {
        return null;
      }
    },
  });
  
  // Get reservations and related operations
  const { data: reservations, isLoading } = useReservations();
  
  // Notifications
  const { 
    notifications,
    unreadCount,
    isOpen: isNotificationsOpen,
    setIsOpen: setNotificationsOpen,
    markAsRead,
    markAllAsRead
  } = useNotifications();
  
  // Group reservations by status
  const activeReservations = reservations?.filter(r => r.status === 'active') || [];
  const upcomingReservations = reservations?.filter(r => r.status === 'upcoming') || [];
  const pastReservations = reservations?.filter(r => r.status === 'completed' || r.status === 'cancelled') || [];
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header 
          user={user} 
          onSearch={handleSearch} 
        />
        
        <MobileMenu 
          onOpenSearch={() => {}} 
        />
        
        <main className="flex-grow container mx-auto px-4 py-5">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005A9C]"></div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header 
        user={user} 
        onSearch={handleSearch} 
      />
      
      <MobileMenu 
        onOpenSearch={() => {}} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-5">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Your Parking Reservations</h1>
          <p className="text-gray-600">Manage all your parking reservations in one place</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                Active
              </CardTitle>
              <CardDescription>Currently active reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeReservations.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Upcoming
              </CardTitle>
              <CardDescription>Scheduled for the future</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{upcomingReservations.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-[#005A9C]" />
                Total
              </CardTitle>
              <CardDescription>All time reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{reservations?.length || 0}</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Reservations</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ReservationTable reservations={reservations || []} />
          </TabsContent>
          
          <TabsContent value="active">
            <ReservationTable 
              reservations={activeReservations} 
              emptyMessage="You have no active reservations" 
            />
          </TabsContent>
          
          <TabsContent value="upcoming">
            <ReservationTable 
              reservations={upcomingReservations} 
              emptyMessage="You have no upcoming reservations" 
            />
          </TabsContent>
          
          <TabsContent value="past">
            <ReservationTable 
              reservations={pastReservations} 
              emptyMessage="You have no past reservations" 
            />
          </TabsContent>
        </Tabs>
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
    </div>
  );
}

interface ReservationTableProps {
  reservations: Reservation[];
  emptyMessage?: string;
}

function ReservationTable({ reservations, emptyMessage = "No reservations found" }: ReservationTableProps) {
  const { cancelReservation } = useReservationForm();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  
  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-600 mb-1">{emptyMessage}</h3>
        <p className="text-gray-500">Reservations will appear here once created</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Spot</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1 text-gray-500" />
                    {format(new Date(reservation.startTime), 'MMM d, yyyy')}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(reservation.startTime), 'h:mm a')} - {format(new Date(reservation.endTime), 'h:mm a')}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-[#A32638]" />
                  {reservation.lot?.name}
                </div>
              </TableCell>
              <TableCell>
                #{reservation.spot?.spotNumber} ({reservation.spot?.type})
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Car className="h-4 w-4 mr-1 text-gray-500" />
                  {reservation.vehicle?.make} {reservation.vehicle?.model}
                  <br />
                  <span className="text-xs text-gray-500 ml-5">
                    {reservation.vehicle?.state} {reservation.vehicle?.licensePlate}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(reservation.status)}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {(reservation.status === 'active' || reservation.status === 'upcoming') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => cancelReservation.mutate(reservation.id)}
                      disabled={cancelReservation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                  {reservation.status === 'active' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-[#005A9C]"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Directions
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#005A9C] text-[#005A9C]"
                        onClick={() => setSelectedReservation(reservation)}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        Show Pass
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* QR Code Modal */}
      {selectedReservation && (
        <QRCodeModal
          isOpen={!!selectedReservation}
          onClose={() => setSelectedReservation(null)}
          reservation={selectedReservation}
        />
      )}
    </div>
  );
}
