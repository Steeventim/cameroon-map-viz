"use client";

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { PolygonData } from "@/types/polygon";

export default function Home() {

  const [polygonData, setPolygonData] = useState<PolygonData[]>([]);
  const [selectedPolygon, setSelectedPolygon] = useState<PolygonData | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImages(prev => [...prev, imageUrl]);
  };

  const handlePolygonData = (data: any) => {
    // The backend returns a single polygon object in the 'results' field.
    if (data.success && data.results && typeof data.results === 'object' && !Array.isArray(data.results)) {
      const newPolygon = data.results;
      setPolygonData(prev => [...prev, newPolygon]);
      setSelectedPolygon(newPolygon); // Select the newly added polygon
    }
  };

  const handlePolygonSelect = (polygon: PolygonData) => {
    setSelectedPolygon(polygon);
  };

  // Dynamically import both main components to ensure they are client-side only
  const Sidebar = useMemo(() => dynamic(
    () => import('@/components/sidebar').then(mod => mod.Sidebar),
    { ssr: false }
  ), []);

  const MapContainer = useMemo(() => dynamic(
    () => import('@/components/map-container').then(mod => mod.MapContainer),
    {
      loading: () => <div className="flex items-center justify-center w-full h-full"><p>Chargement de la carte...</p></div>,
      ssr: false
    }
  ), []);

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar 
        onImageUpload={handleImageUpload}
        onPolygonDataReceived={handlePolygonData}
        polygonData={polygonData}
        selectedPolygon={selectedPolygon}
        onPolygonSelect={handlePolygonSelect}
        uploadedImages={uploadedImages}
      />
      <main className="flex-1">
        <MapContainer 
          polygonData={polygonData}
          selectedPolygon={selectedPolygon}
          onPolygonSelect={handlePolygonSelect}
          uploadedImages={uploadedImages}
        />
      </main>
    </div>
  );
}