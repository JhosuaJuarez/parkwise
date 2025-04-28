import React from 'react';
import { useLocation, Link } from 'wouter';
import { Map, Ticket, User, Search } from 'lucide-react';

interface MobileMenuProps {
  onOpenSearch: () => void;
}

export default function MobileMenu({ onOpenSearch }: MobileMenuProps) {
  const [location] = useLocation();

  return (
    <div className="md:hidden bg-white border-b px-4 py-2 flex justify-between items-center">
      <button
        className="flex items-center p-2 rounded-md hover:bg-gray-100"
        onClick={onOpenSearch}
      >
        <Search className="text-[#333333] h-4 w-4 mr-2" />
        <span>Search</span>
      </button>
      <div className="flex space-x-3">
        <Link href="/" className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${location === '/' ? 'active:bg-gray-100' : ''}`}>
          <Map className={`${location === '/' ? 'text-[#A32638]' : 'text-[#333333]'} h-4 w-4 mr-1`} />
          <span>Map</span>
        </Link>
        <Link href="/reservations" className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${location === '/reservations' ? 'active:bg-gray-100' : ''}`}>
          <Ticket className={`${location === '/reservations' ? 'text-[#A32638]' : 'text-[#333333]'} h-4 w-4 mr-1`} />
          <span>Reservations</span>
        </Link>
        <Link href="/profile" className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${location === '/profile' ? 'active:bg-gray-100' : ''}`}>
          <User className={`${location === '/profile' ? 'text-[#A32638]' : 'text-[#333333]'} h-4 w-4 mr-1`} />
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );
}
