import React from 'react';
import { X, Check, Info } from 'lucide-react';
import { Notification } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationPanel({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationPanelProps) {
  if (!isOpen) return null;
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
            <Check className="h-4 w-4" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <Info className="h-4 w-4" />
          </div>
        );
    }
  };
  
  const getTimeString = (createdAt: string) => {
    const date = new Date(createdAt);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  return (
    <div className="fixed right-4 top-20 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 transform transition-transform">
      <div className="p-3 bg-[#333333] text-white flex justify-between items-center">
        <h3 className="font-medium">Notifications</h3>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-gray-300 h-auto w-auto p-1"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {notifications.length > 0 ? (
        <>
          <ScrollArea className="max-h-96">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 border-b border-gray-200 hover:bg-gray-50 ${notification.isRead ? 'opacity-70' : ''}`}
                onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {getIcon(notification.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {notification.type === 'success' ? 'Reservation Confirmed' : 
                       notification.type === 'info' ? 'Reminder' : 'Notification'}
                    </p>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{getTimeString(notification.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
          
          <div className="p-2 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[#005A9C]"
              onClick={onMarkAllAsRead}
            >
              Mark all as read
            </Button>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <Info className="h-10 w-10 mx-auto mb-2 opacity-20" />
          <p>No notifications yet</p>
        </div>
      )}
    </div>
  );
}
