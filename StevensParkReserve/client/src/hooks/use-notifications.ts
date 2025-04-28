import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Notification } from '@/lib/types';

export function useNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });
  
  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
  });
  
  const unreadCount = unreadCountData?.count || 0;
  
  const markAsRead = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PUT', `/api/notifications/${id}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });
  
  const markAllAsRead = async () => {
    if (!notifications) return;
    
    const unreadNotifications = notifications.filter(notification => !notification.isRead);
    
    await Promise.all(
      unreadNotifications.map(notification => markAsRead.mutateAsync(notification.id))
    );
  };
  
  return {
    notifications: notifications || [],
    unreadCount,
    isOpen,
    setIsOpen,
    markAsRead: markAsRead.mutate,
    markAllAsRead
  };
}
