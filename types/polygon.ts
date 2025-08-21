export interface PolygonGeometry {
  coordinates: number[][][]
  type: "Polygon"
}

export interface PolygonInfo {
  area: number
  bounds: number[]
  centroid: number[]
  geometry: PolygonGeometry
  perimeter: number
  type: "polygon"
}

export interface PolygonData {
  coordinates: number[][]
  area_value: number
  arrondissement_name: string
  department_name: string
  owner_name: string
  polygon: PolygonInfo
}

export interface AdministrativeDivision {
  region: string
  department: string
  arrondissement: string
  polygons: PolygonData[]
}
