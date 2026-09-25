'use client';

import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { Bell } from 'lucide-react';
import { useNavigate } from '@/components/RouterCompat';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load from localStorage safely on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      }
    } catch (e) {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    }
  }, [notifications, isLoaded]);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.VITE_PUSHER_KEY || 'd14edc647970149caa98';
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.VITE_PUSHER_CLUSTER || 'ap2';

    if (!pusherKey) {
      console.warn('Pusher key missing. Notification Center will not receive real-time updates.');
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe('admin-notifications');

    channel.bind('new-order', (data) => {
      const newNotification = {
        id: new Date().getTime(),
        title: 'New Order Received',
        message: `Order #${data.orderNumber || data.orderId} from ${data.customerName}`,
        time: new Date(),
        read: false,
        type: data.type
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const navigateToOrders = (id) => {
    setNotifications((prev) => {
      const isUnread = prev.find(n => n.id === id && !n.read);
      if (isUnread) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.map(n => n.id === id ? { ...n, read: true } : n);
    });
    setIsOpen(false);
    navigate('/admin/orders');
  };

  const handleClearSeen = () => {
    setNotifications((prev) => prev.filter(n => !n.read));
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: 'numeric', hour12: true
    }).format(new Date(date));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {notifications.some(n => n.read) && (
              <button 
                onClick={handleClearSeen}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear seen
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => navigateToOrders(notif.id)}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/30' : 'opacity-60'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-gray-800">{notif.title}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{formatTime(notif.time)}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
