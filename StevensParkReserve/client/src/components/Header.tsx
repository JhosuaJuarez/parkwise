import React from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/hooks/use-notifications';
import { User } from '@/lib/types';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onSearch: (query: string) => void;
}

export default function Header({ user, onSearch }: HeaderProps) {
  const [location] = useLocation();
  const { unreadCount, setIsOpen } = useNotifications();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img 
              src="https://web.stevens.edu/news/newspoints/brand-logos/2020/Stevens-Logos/Stevens-wordmark-2020.png" 
              alt="Stevens Logo" 
              className="h-10 mr-3" 
            />
            <h1 className="text-2xl font-bold text-[#A32638]">ParkWise</h1>
          </Link>
        </div>
        
        <div className="flex items-center">
          <div className="relative hidden md:block mr-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="text-gray-400 h-4 w-4" />
                </span>
                <Input
                  type="text"
                  className="bg-gray-100 rounded-lg py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-[#A32638]"
                  placeholder="Search parking spots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          
          {/* Notification bell with indicator */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-2 mx-2 relative"
            onClick={() => setIsOpen(true)}
          >
            <Bell className="text-[#333333] h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#A32638] rounded-full flex items-center justify-center text-white text-xs">
                {unreadCount}
              </span>
            )}
          </Button>
          
          <div className="flex items-center ml-4">
            {user ? (
              <>
                <div className="h-8 w-8 rounded-full bg-[#005A9C] text-white flex items-center justify-center">
                  {user.fullName.charAt(0)}
                </div>
                <span className="ml-2 hidden md:block font-medium">
                  {user.fullName}
                </span>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
