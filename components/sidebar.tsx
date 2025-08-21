"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MapPin, ImageIcon, Info, Building2, Map, Users } from "lucide-react"
import type { PolygonData } from "@/types/polygon"

import { ImageUpload } from "@/components/image-upload"

interface SidebarProps {
  onImageUpload: (imageUrl: string) => void
  onPolygonDataReceived: (polygonData: any) => void
  polygonData: PolygonData[]
  selectedPolygon: PolygonData | null
  onPolygonSelect: (polygon: PolygonData) => void
  uploadedImages: string[]
}

export function Sidebar({ 
  onImageUpload,
  onPolygonDataReceived,
  polygonData, 
  selectedPolygon, 
  onPolygonSelect, 
  uploadedImages 
}: SidebarProps) {
  const groupedData = {
    regions: polygonData.length > 0 ? new Set(polygonData.map((p) => p.region_name || p.department_name)).size : 0,
    departments: polygonData.length > 0 ? new Set(polygonData.map((p) => p.department_name)).size : 0,
    arrondissements: polygonData.length,
  }

  return (
    <div className="w-96 bg-white border-r border-slate-200 flex flex-col shadow-lg">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center shadow-md">
            <Map className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Panneau de Contrôle</h2>
            <p className="text-sm text-slate-600 font-medium">Divisions Administratives du Cameroun</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="text-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="text-xl font-bold text-slate-900">{groupedData.arrondissements}</div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mt-1">Arrondissements</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="text-xl font-bold text-slate-900">{groupedData.departments}</div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mt-1">Départements</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="text-xl font-bold text-slate-900">{uploadedImages.length}</div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mt-1">Images</div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                Polygones Disponibles
              </h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold px-3 py-1">
                {polygonData.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {polygonData.map((polygon, index) => (
                <Card
                  key={`polygon-${index}`}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                    selectedPolygon === polygon
                      ? "bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-200"
                      : "hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => onPolygonSelect(polygon)}
                >
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <Badge
                            variant={selectedPolygon === polygon ? "default" : "secondary"}
                            className={`text-sm font-bold px-3 py-1 ${
                              selectedPolygon === polygon ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {polygon.arrondissement_name}
                          </Badge>
                          <p className="text-base font-semibold text-slate-900">{polygon.department_name}</p>
                        </div>
                        <div className="text-right bg-slate-50 rounded-lg p-2">
                          <div className="text-sm font-bold text-slate-900">
                            {polygon.area_value?.toLocaleString() || "N/A"} m²
                          </div>
                          <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Surface</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-sm text-slate-700 font-medium flex items-center">
                          <Users className="h-4 w-4 inline mr-2 text-slate-500" />
                          {polygon.owner_name || "Propriétaire non spécifié"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {selectedPolygon && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Info className="h-4 w-4 text-green-600" />
                </div>
                Détails Techniques
              </h3>
              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3 text-slate-900">
                    <Building2 className="h-5 w-5 text-green-600" />
                    {selectedPolygon.arrondissement_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Département</div>
                      <div className="text-lg font-bold text-slate-900">{selectedPolygon.department_name}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                        Surface Totale
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        {selectedPolygon.area_value?.toLocaleString() || "N/A"} m²
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-green-200" />

                  <div className="space-y-3 bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                      Coordonnées Géographiques
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-600">Périmètre:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {selectedPolygon.polygon?.perimeter?.toFixed(6) || "N/A"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-slate-600">Centroïde:</div>
                        <div className="ml-4 space-y-1 font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Latitude:</span>
                            <span className="font-bold text-slate-900">
                              {selectedPolygon.polygon?.centroid?.[1]?.toFixed(6) || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Longitude:</span>
                            <span className="font-bold text-slate-900">
                              {selectedPolygon.polygon?.centroid?.[0]?.toFixed(6) || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Separator className="bg-slate-200" />

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-purple-600" />
                </div>
                Téléverser une Image
              </h3>
            <ImageUpload 
              onImageUpload={onImageUpload} 
              onPolygonDataReceived={onPolygonDataReceived} 
            />
          </div>

          <Separator className="bg-slate-200" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-purple-600" />
                </div>
                Images Analysées
              </h3>
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-800 font-semibold px-3 py-1 border-purple-300"
              >
                {uploadedImages.length}
              </Badge>
            </div>

            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div
                    key={`image-${index}`}
                    className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={`Analyse ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-lg font-semibold text-slate-700 mb-2">Aucune Image Analysée</p>
                <p className="text-sm text-slate-600">Uploadez une image pour commencer l'analyse géospatiale</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
