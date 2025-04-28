import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Reservation } from '@/lib/types';
import { format } from 'date-fns';
import { Download, Map, X } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
}

export default function QRCodeModal({ isOpen, onClose, reservation }: QRCodeModalProps) {
  // Format dates for display
  const date = format(new Date(reservation.startTime), 'MMMM d, yyyy');
  const startTime = format(new Date(reservation.startTime), 'h:mm a');
  const endTime = format(new Date(reservation.endTime), 'h:mm a');
  
  // Create QR code data
  const qrCodeData = JSON.stringify({
    confirmationCode: reservation.confirmationCode,
    spotId: reservation.spotId,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    lotName: reservation.lot?.name,
    spotNumber: reservation.spot?.spotNumber
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="bg-[#005A9C] text-white p-4 -mx-6 -mt-6 flex items-center justify-between">
            <span>Parking Pass</span>
            <Button variant="ghost" className="h-8 w-8 p-0 text-white" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-3">
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-4 mb-4">
            <div className="flex flex-col items-center">
              <div className="font-semibold text-lg mb-1 text-center">{reservation.lot?.name}</div>
              <div className="text-sm text-gray-600 mb-3 text-center">
                {date} · {startTime} - {endTime}
              </div>
              
              <div className="bg-white p-2 border border-gray-200 rounded-md mb-3">
                <QRCodeSVG
                  value={qrCodeData}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="border border-gray-200 rounded-md p-3 w-full mb-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Confirmation:</div>
                  <div className="font-mono font-medium">{reservation.confirmationCode}</div>
                  
                  <div className="text-gray-500">Spot:</div>
                  <div>{reservation.spot?.spotNumber} ({reservation.spot?.type})</div>
                  
                  <div className="text-gray-500">Vehicle:</div>
                  <div>{reservation.vehicle?.make} {reservation.vehicle?.model}</div>
                  
                  <div className="text-gray-500">License:</div>
                  <div>{reservation.vehicle?.state} {reservation.vehicle?.licensePlate}</div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-center mb-4">
                Present this QR code to security personnel upon entry
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-300"
                  onClick={() => {
                    // This would download the QR code in a real application
                    alert('QR code download would be implemented here');
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Save to Phone
                </Button>
                
                <Button
                  size="sm"
                  className="text-xs bg-[#005A9C]"
                  onClick={() => {
                    // This would open directions in a real application
                    alert('Directions would open here');
                  }}
                >
                  <Map className="h-3 w-3 mr-1" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}