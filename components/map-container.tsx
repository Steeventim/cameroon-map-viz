"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Layers, MapPin, ArrowLeft } from "lucide-react"
import type { PolygonData } from "@/types/polygon"
import cameroonOutline from "./data/cm1.geojson.json" // Level 0: Country
import regionsData from "./data/cm2.geojson.json" // Level 1: Regions
import departmentsData from "./data/cm3.geojson.json" // Level 2: Departments
import arrondissementsData from "./data/cm4.geojson.json" // Level 3: Arrondissements

interface MapContainerProps {
  polygonData: PolygonData[]
  selectedPolygon: PolygonData | null
  onPolygonSelect: (polygon: PolygonData) => void
  uploadedImages: string[]
}

export function MapContainer({ polygonData, selectedPolygon, onPolygonSelect, uploadedImages }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)

  // Refs to hold the actual Leaflet layer objects
  const regionsLayerRef = useRef<any>(null)
  const departmentsLayerRef = useRef<any>(null)
  const polygonLayersRef = useRef<any[]>([])
  const imageLayersRef = useRef<any[]>([])

  const arrondissementsLayerRef = useRef<any>(null)

  const [isMapReady, setIsMapReady] = useState(false)
  const [currentView, setCurrentView] = useState<"country" | "region" | "department" | "arrondissement">("country")

  // New state to manage drill-down
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null)

  // --- MAP INITIALIZATION ---
  useEffect(() => {
    const initializeMap = async () => {
      if (typeof window === "undefined" || !mapRef.current || leafletMapRef.current) return

      const L = (await import("leaflet")).default
      leafletRef.current = L

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current).setView([7.3697, 12.3547], 6)
      leafletMapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      // Add Cameroon outline (always visible)
      L.geoJSON(cameroonOutline as any, {
        style: { fillColor: "#D4D4D8", fillOpacity: 0.2, color: "#52525B", weight: 2 },
        interactive: false,
      }).addTo(map)

      setIsMapReady(true)
    }

    const timer = setTimeout(() => {
      initializeMap()
    }, 0);

    return () => {
      clearTimeout(timer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  // --- DRILL-DOWN AND DYNAMIC LAYER LOGIC ---
  useEffect(() => {
    if (!isMapReady || !leafletRef.current) return

    const L = leafletRef.current
    const map = leafletMapRef.current

    // Clear previous dynamic layers
    if (regionsLayerRef.current) map.removeLayer(regionsLayerRef.current)
    if (departmentsLayerRef.current) map.removeLayer(departmentsLayerRef.current)
    if (arrondissementsLayerRef.current) map.removeLayer(arrondissementsLayerRef.current)

    if (activeDepartment) {
      // --- ARRONDISSEMENT VIEW ---
      const filteredArrondissements = {
        ...arrondissementsData,
        features: arrondissementsData.features.filter(
          (feature) => feature.properties.NAME_2 === activeDepartment
        ),
      }
      const style = { fillColor: "#93c5fd", fillOpacity: 0.6, color: "#1e3a8a", weight: 1 }
      arrondissementsLayerRef.current = L.geoJSON(filteredArrondissements as any, {
        style,
        onEachFeature: (feature: any, layer: any) => {
          layer.bindTooltip(feature.properties.NAME_3, { sticky: true });
          layer.on({
            mouseover: (e: any) => e.target.setStyle({ weight: 3 }),
            mouseout: (e: any) => arrondissementsLayerRef.current.resetStyle(e.target),
          })
        },
      }).addTo(map)
      map.fitBounds(arrondissementsLayerRef.current.getBounds())

    } else if (activeRegion) {
      // --- DEPARTMENT VIEW ---
      const filteredDepartments = {
        ...departmentsData,
        features: departmentsData.features.filter(
          (feature) => feature.properties.NAME_1 === activeRegion
        ),
      }
      const style = { fillColor: "#a5b4fc", fillOpacity: 0.5, color: "#3730a3", weight: 1 }
      departmentsLayerRef.current = L.geoJSON(filteredDepartments as any, {
        style,
        onEachFeature: (feature: any, layer: any) => {
          const departmentName = feature.properties.NAME_2
          layer.bindTooltip(departmentName, { sticky: true });
          layer.on({
            mouseover: (e: any) => e.target.setStyle({ weight: 3, fillOpacity: 0.7 }),
            mouseout: (e: any) => departmentsLayerRef.current.resetStyle(e.target),
            click: () => setActiveDepartment(departmentName),
          })
        },
      }).addTo(map)
      map.fitBounds(departmentsLayerRef.current.getBounds())

    } else {
      // --- REGION VIEW (DEFAULT) ---
      const style = { fillColor: "#c4b5fd", fillOpacity: 0.4, color: "#4c1d95", weight: 1 }
      regionsLayerRef.current = L.geoJSON(regionsData as any, {
        style,
        onEachFeature: (feature: any, layer: any) => {
          const regionName = feature.properties.NAME_1
          layer.bindTooltip(regionName, { sticky: true });
          layer.on({
            mouseover: (e: any) => e.target.setStyle({ weight: 3, fillColor: "#a78bfa", fillOpacity: 0.6 }),
            mouseout: (e: any) => regionsLayerRef.current.resetStyle(e.target),
            click: () => {
              setActiveRegion(regionName)
              setActiveDepartment(null) // Reset department when clicking a new region
            },
          })
        },
      }).addTo(map)
    }
  }, [isMapReady, activeRegion, activeDepartment])

  // --- EXISTING LOGIC FOR PARCEL POLYGONS ---
  useEffect(() => {
    if (!isMapReady || !leafletMapRef.current || !leafletRef.current) return

    const L = leafletRef.current

    polygonLayersRef.current.forEach((layer) => leafletMapRef.current.removeLayer(layer))
    polygonLayersRef.current = []

    polygonData.forEach((polygon) => {
      const coords = polygon.polygon.geometry.coordinates[0].map((coord: any) => [coord[1], coord[0]])

      const polygonLayer = L.polygon(coords, {
        color: polygon === selectedPolygon ? "#8b5cf6" : "#6366f1",
        fillColor: polygon === selectedPolygon ? "#8b5cf6" : "#6366f1",
        fillOpacity: polygon === selectedPolygon ? 0.3 : 0.2,
        weight: polygon === selectedPolygon ? 3 : 2,
      }).addTo(leafletMapRef.current)

      polygonLayer.bindPopup(
        `<div class="p-2"><h4 class="font-semibold">${polygon.arrondissement_name}</h4><p class="text-sm text-gray-600">Département: ${polygon.department_name}</p><p class="text-sm text-gray-600">Propriétaire: ${polygon.owner_name}</p><p class="text-sm text-gray-600">Superficie: ${polygon.area_value} m²</p></div>`
      )

      polygonLayer.on("click", () => {
        onPolygonSelect(polygon)
      })

      polygonLayersRef.current.push(polygonLayer)
    })

    if (polygonData.length > 0) {
      const latestPolygon = polygonData[polygonData.length - 1]
      if (latestPolygon.polygon.bounds && latestPolygon.polygon.bounds.length === 4) {
        const [minLng, minLat, maxLng, maxLat] = latestPolygon.polygon.bounds
        const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng])
        leafletMapRef.current.fitBounds(bounds, { padding: [20, 20] })
        setCurrentView("arrondissement")
      }
    }
  }, [polygonData, selectedPolygon, onPolygonSelect, isMapReady])

  useEffect(() => {
    if (!isMapReady || !leafletMapRef.current || !leafletRef.current || !selectedPolygon) return

    const L = leafletRef.current

    if (
      selectedPolygon.polygon?.bounds &&
      Array.isArray(selectedPolygon.polygon.bounds) &&
      selectedPolygon.polygon.bounds.length === 4
    ) {
      const [minLng, minLat, maxLng, maxLat] = selectedPolygon.polygon.bounds

      if (
        typeof minLat === "number" &&
        typeof minLng === "number" &&
        typeof maxLat === "number" &&
        typeof maxLng === "number"
      ) {
        const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng])
        leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] })
        setCurrentView("arrondissement")
      }
    }
  }, [selectedPolygon, isMapReady])

  useEffect(() => {
    if (!isMapReady || !leafletMapRef.current || !leafletRef.current) return

    const L = leafletRef.current

    imageLayersRef.current.forEach((layer) => {
      leafletMapRef.current.removeLayer(layer)
    })
    imageLayersRef.current = []

    uploadedImages.forEach((imageUrl, index) => {
      const bounds = L.latLngBounds(
        [6 + index * 0.5, 11 + index * 0.5],
        [7 + index * 0.5, 12 + index * 0.5]
      )

      const imageOverlay = L.imageOverlay(imageUrl, bounds, {
        opacity: 0.7,
      }).addTo(leafletMapRef.current)

      imageLayersRef.current.push(imageOverlay)
    })
  }, [uploadedImages, isMapReady])

  const handleZoomIn = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut()
    }
  }

  const handleZoomToRegion = () => {
    if (leafletMapRef.current && selectedPolygon) {
      leafletMapRef.current.setView([7.3697, 12.3547], 8)
      setCurrentView("region")
    }
  }

  const handleZoomToDepartment = () => {
    if (leafletMapRef.current && selectedPolygon) {
      leafletMapRef.current.setView([7.3697, 12.3547], 10)
      setCurrentView("department")
    }
  }

  const handleZoomToArrondissement = () => {
    if (leafletMapRef.current && selectedPolygon && leafletRef.current) {
      const L = leafletRef.current
      if (
        selectedPolygon.polygon?.bounds &&
        Array.isArray(selectedPolygon.polygon.bounds) &&
        selectedPolygon.polygon.bounds.length === 4
      ) {
        const [minLng, minLat, maxLng, maxLat] = selectedPolygon.polygon.bounds

        if (
          typeof minLat === "number" &&
          typeof minLng === "number" &&
          typeof maxLat === "number" &&
          typeof maxLng === "number"
        ) {
          const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng])
          leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] })
          setCurrentView("arrondissement")
        }
      }
    }
  }

  const handleReset = () => {
    if (leafletMapRef.current) {
      setActiveRegion(null)
      setActiveDepartment(null)
      leafletMapRef.current.setView([7.3697, 12.3547], 6)
      setCurrentView("country")
    }
  }

  const handleBack = () => {
    if (activeDepartment) {
      setActiveDepartment(null);
    } else if (activeRegion) {
      setActiveRegion(null);
    }
  }

  return (
    <div className="relative w-full h-full bg-slate-100">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "400px" }} />

      <Card className="absolute top-6 right-6 p-3 z-[1000] shadow-lg border-2 border-slate-200">
        <div className="flex flex-col gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomIn}
            className="hover:bg-blue-50 hover:border-blue-300 bg-transparent"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomOut}
            className="hover:bg-blue-50 hover:border-blue-300 bg-transparent"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="hover:bg-slate-50 hover:border-slate-300 bg-transparent"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleBack}
            disabled={!activeRegion}
            className="hover:bg-slate-50 hover:border-slate-300 bg-transparent disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {selectedPolygon && (
        <Card className="absolute top-6 left-6 p-3 z-[1000] shadow-lg border-2 border-slate-200">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Navigation Administrative</h4>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant={currentView === "region" ? "default" : "outline"}
                onClick={handleZoomToRegion}
                className="text-xs font-semibold justify-start"
              >
                Région
              </Button>
              <Button
                size="sm"
                variant={currentView === "department" ? "default" : "outline"}
                onClick={handleZoomToDepartment}
                className="text-xs font-semibold justify-start"
              >
                Département
              </Button>
              <Button
                size="sm"
                variant={currentView === "arrondissement" ? "default" : "outline"}
                onClick={handleZoomToArrondissement}
                className="text-xs font-semibold justify-start"
              >
                <MapPin className="h-3 w-3 mr-2" />
                Arrondissement
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="absolute bottom-6 left-6 p-4 z-[1000] shadow-lg border-2 border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="font-semibold text-slate-900">{polygonData.length} Polygone(s)</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-600" />
            <span className="font-semibold text-slate-900">{uploadedImages.length} Image(s)</span>
          </div>
          {selectedPolygon && (
            <>
              <div className="w-px h-4 bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="font-bold text-slate-900">{selectedPolygon.arrondissement_name}</span>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
