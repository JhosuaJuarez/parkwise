import React from 'react';
import { CheckCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Reservation } from '@/lib/types';
import { Link } from 'wouter';
import { QRCodeSVG } from 'qrcode.react';

interface ReservationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}

export default function ReservationConfirmationModal({
  isOpen,
  onClose,
  reservation
}: ReservationConfirmationModalProps) {
  if (!reservation) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="bg-[#A32638] text-white p-4 -mx-6 -mt-6 flex items-center">
            Reservation Confirmation
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-5">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle className="h-10 w-10" />
            </div>
          </div>
          
          <h4 className="text-center text-xl font-semibold mb-1">Success!</h4>
          <p className="text-center text-gray-600 mb-4">Your parking spot has been reserved</p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-sm text-gray-500">Location:</div>
              <div className="text-sm font-medium">
                {reservation.lot?.name}, Spot #{reservation.spot?.spotNumber}
              </div>
              
              <div className="text-sm text-gray-500">Date:</div>
              <div className="text-sm font-medium">
                {format(new Date(reservation.startTime), 'MMMM d, yyyy')}
              </div>
              
              <div className="text-sm text-gray-500">Time:</div>
              <div className="text-sm font-medium">
                {format(new Date(reservation.startTime), 'h:mm a')} - {format(new Date(reservation.endTime), 'h:mm a')}
              </div>
              
              <div className="text-sm text-gray-500">Vehicle:</div>
              <div className="text-sm font-medium">
                {reservation.vehicle?.make} {reservation.vehicle?.model} ({reservation.vehicle?.state} {reservation.vehicle?.licensePlate})
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center mt-2">
              Confirmation code: <span className="font-mono font-medium">{reservation.confirmationCode}</span>
            </div>
            
            {/* QR Code section */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center mb-2">
                <p className="text-sm font-medium text-gray-700">Show this QR code to security upon arrival</p>
                <p className="text-xs text-gray-500">This serves as your digital parking pass</p>
              </div>
              <div className="flex justify-center">
                <div className="p-2 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                  <QRCodeSVG 
                    value={JSON.stringify({
                      confirmationCode: reservation.confirmationCode,
                      spotId: reservation.spotId,
                      startTime: reservation.startTime,
                      endTime: reservation.endTime,
                      lotName: reservation.lot?.name,
                      spotNumber: reservation.spot?.spotNumber
                    })} 
                    size={180} 
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => {
                    // This would download the QR code in a real application
                    alert('QR code download would be implemented here');
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Save to Phone
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              className="border-[#005A9C] text-[#005A9C]"
              onClick={onClose}
            >
              Close
            </Button>
            
            <Link href="/reservations">
              <Button
                className="bg-[#005A9C] text-white hover:bg-[#005A9C]/90"
                onClick={onClose}
              >
                View Reservation
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
