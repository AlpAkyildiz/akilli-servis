'use client';
import React, { useEffect, useRef } from 'react';

interface LiveMapProps {
  busLocation: { lat: number; lng: number } | null;
}

const DEFAULT_CENTER: [number, number] = [41.0082, 28.9784]; // İstanbul

export default function LiveMap({ busLocation }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const pathPointsRef = useRef<[number, number][]>([]);

  useEffect(() => {
    // Leaflet CSS
    if (!document.querySelector('#leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      if (mapInstanceRef.current || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: 14,
        zoomControl: true,
        attributionControl: true
      });

      // OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        polylineRef.current = null;
        pathPointsRef.current = [];
      }
    };
  }, []);

  useEffect(() => {
    if (!busLocation || !mapInstanceRef.current) return;
    const { lat, lng } = busLocation;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Otobüs ikonu
      const busIcon = L.divIcon({
        html: `
          <div style="
            background: linear-gradient(135deg, #1e40af, #2563eb);
            border: 3px solid white;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 20px rgba(37,99,235,0.6), 0 0 0 6px rgba(37,99,235,0.15);
          ">🚌</div>
        `,
        className: '',
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: busIcon })
          .addTo(map)
          .bindPopup('<b>🚌 Servis Aracı</b><br>Konum canlı güncelleniyor');
      }

      // Geçilen yolu çiz (mavi çizgi)
      pathPointsRef.current.push([lat, lng]);
      if (pathPointsRef.current.length > 1) {
        if (polylineRef.current) {
          polylineRef.current.remove();
        }
        polylineRef.current = L.polyline(pathPointsRef.current, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.7,
          dashArray: '8, 6',
        }).addTo(map);
      }

      // Haritayı otobüse kaydır
      map.panTo([lat, lng], { animate: true, duration: 0.8 });
    });
  }, [busLocation]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: 'calc(100vh - 200px)', minHeight: '350px' }}
      className="z-0 bg-slate-200"
    />
  );
}
