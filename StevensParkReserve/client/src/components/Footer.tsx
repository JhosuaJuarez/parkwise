import React from 'react';
import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-[#333333] text-white py-5 mt-5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">ParkWise</h2>
              <span className="ml-2 text-xs bg-[#A32638] px-2 py-0.5 rounded">BETA</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Stevens Institute of Technology Parking System</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Navigation</h3>
              <ul className="space-y-1">
                <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link href="/reservations" className="text-gray-300 hover:text-white">My Reservations</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Help & Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Resources</h3>
              <ul className="space-y-1">
                <li><a href="https://web.stevens.edu/maps/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Campus Map</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Parking Policies</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">FAQ</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1 mt-4 md:mt-0">
              <h3 className="font-semibold mb-2">Contact</h3>
              <p className="text-gray-300 mb-2">
                Stevens Institute of Technology<br />
                1 Castle Point Terrace<br />
                Hoboken, NJ 07030
              </p>
              <p className="text-gray-300">
                <a href="mailto:parking@stevens.edu" className="hover:text-white">parking@stevens.edu</a>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} ParkWise. All rights reserved.</p>
          <div className="mt-3 md:mt-0 flex space-x-4">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
