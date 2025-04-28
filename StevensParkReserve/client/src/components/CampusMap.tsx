import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, List } from 'lucide-react';
import { ParkingLot } from '@/lib/types';
import { getAvailabilityColor } from '@/hooks/use-parking';

// Fix for TypeScript errors with react-leaflet
declare module 'react-leaflet' {
  interface MapContainerProps {
    center?: [number, number];
    zoom?: number;
    ref?: React.RefObject<any>;
  }
  
  interface TileLayerProps {
    attribution?: string;
  }
  
  interface MarkerProps {
    position?: [number, number];
    icon?: any;
  }
}

// Fix for Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface CampusMapProps {
  parkingLots: ParkingLot[];
  selectedLotId: number | null;
  onSelectLot: (lotId: number) => void;
  isLoading: boolean;
}

// Custom marker icon for parking lots
const createLotIcon = (availablePercentage: number) => {
  const colorClass = getAvailabilityColor(availablePercentage);
  const color = colorClass === 'bg-green-600' ? '#22c55e' :
                colorClass === 'bg-yellow-500' ? '#eab308' :
                colorClass === 'bg-stevens-red' ? '#A32638' : '#9ca3af';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; opacity: 0.8; color: white; border: 2px solid white; border-radius: 0.5rem; padding: 0.5rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
            <div style="font-weight: 600; font-size: 14px;"></div>
            <div style="font-size: 12px;"></div>
          </div>`,
    iconSize: [100, 70],
    iconAnchor: [50, 35],
  });
};

// Component to center map on change of parking lots
function MapUpdater({ parkingLots }: { parkingLots: ParkingLot[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (parkingLots && parkingLots.length > 0) {
      // Calculate bounds from all lot coordinates
      const bounds = L.latLngBounds(
        parkingLots.map(lot => [parseFloat(lot.latitude), parseFloat(lot.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, parkingLots]);
  
  return null;
}

export default function CampusMap({ parkingLots, selectedLotId, onSelectLot, isLoading }: CampusMapProps) {
  const [showLegend, setShowLegend] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  
  const handleRefreshMap = () => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  };
  
  const handleToggleLegend = () => {
    setShowLegend(!showLegend);
  };
  
  if (isLoading) {
    return (
      <div className="w-full md:w-2/3 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
        <div className="p-4 bg-[#A32638] text-white">
          <h2 className="text-lg font-semibold">Campus Parking Map</h2>
        </div>
        <div className="flex-grow flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <RefreshCw className="h-10 w-10 animate-spin mx-auto text-gray-400" />
            <p className="mt-4 text-gray-500">Loading parking map...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full md:w-2/3 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
      <div className="p-4 bg-[#A32638] text-white flex justify-between items-center">
        <h2 className="text-lg font-semibold">Campus Parking Map</h2>
        <div className="flex items-center space-x-3">
          <button 
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-3 py-1 text-sm flex items-center"
            onClick={handleRefreshMap}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Refresh</span>
          </button>
          <button 
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-3 py-1 text-sm flex items-center"
            onClick={handleToggleLegend}
          >
            <List className="h-4 w-4 mr-2" />
            <span>Legend</span>
          </button>
        </div>
      </div>
      
      <div className="relative flex-grow overflow-hidden" style={{ minHeight: '400px' }}>
        <MapContainer
          ref={mapRef}
          center={[40.745, -74.025]}
          zoom={16} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater parkingLots={parkingLots} />
          
          {parkingLots.map((lot) => {
            const availablePercentage = (lot.availableSpots / lot.totalSpots) * 100;
            return (
              <Marker
                key={lot.id}
                position={[parseFloat(lot.latitude), parseFloat(lot.longitude)]}
                icon={createLotIcon(availablePercentage)}
                eventHandlers={{
                  click: () => {
                    console.log('Parking lot selected from map:', lot);
                    console.log('Setting selectedLotId to:', lot.id);
                    // Ensure we're passing a valid number
                    if (lot && typeof lot.id === 'number') {
                      onSelectLot(lot.id);
                    }
                  }
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{lot.name}</h3>
                    <p className="text-sm text-gray-600">{lot.description}</p>
                    <p className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(availablePercentage).replace('bg-', 'bg-opacity-20 text-')}`}>
                        {lot.availableSpots} / {lot.totalSpots} spots available
                      </span>
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Legend panel */}
        {showLegend && (
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-3 text-sm">
            <h4 className="font-semibold mb-2">Parking Availability</h4>
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 rounded bg-green-600 mr-2"></div>
              <span>High availability (&gt;20 spots)</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 rounded bg-yellow-500 mr-2"></div>
              <span>Limited availability (5-20 spots)</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 rounded bg-[#A32638] mr-2"></div>
              <span>Low availability (&lt;5 spots)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-gray-400 mr-2"></div>
              <span>No availability</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
