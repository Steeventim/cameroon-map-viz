"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  onPolygonDataReceived: (polygonData: any) => void
}

export function ImageUpload({ onImageUpload, onPolygonDataReceived }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner un fichier image (JPG, PNG, etc.)")
      return
    }

    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string
      setPreviewImage(imageUrl)
      onImageUpload(imageUrl)
      setIsUploading(false)

      await processImageWithBackend(file)
    }
    reader.readAsDataURL(file)
  }

  const processImageWithBackend = async (file: File) => {
    setIsProcessing(true)

    try {
      console.log("[v0] Sending image to backend for processing...")

      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("http://localhost:5000/api/process", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const polygonData = await response.json()

      console.log("[v0] Backend response received:", polygonData)

      if (polygonData.success && polygonData.results) {
        onPolygonDataReceived(polygonData)
      } else {
        throw new Error("Invalid response format from backend")
      }
    } catch (error) {
      console.error("[v0] Error processing image with backend:", error)

      let errorMessage = "Erreur lors du traitement de l'image."

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorMessage =
            "Impossible de se connecter au serveur backend. Vérifiez que le serveur est démarré sur http://localhost:5000"
        } else if (error.message.includes("HTTP error! status: 404")) {
          errorMessage = "Erreur 404: L'endpoint /api/process n'existe pas sur le serveur."
        } else if (error.message.includes("HTTP error! status: 500")) {
          errorMessage = "Erreur serveur 500: Problème lors du traitement de l'image."
        } else if (error.message.includes("Invalid response format")) {
          errorMessage = "Erreur: Format de réponse invalide du serveur."
        } else {
          errorMessage = `Erreur: ${error.message}`
        }
      }

      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const clearPreview = () => {
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-border",
          (isUploading || isProcessing) && "opacity-50",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            {isProcessing ? (
              <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin" />
            ) : (
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {isProcessing
                  ? "Traitement en cours..."
                  : isUploading
                    ? "Upload en cours..."
                    : "Cliquez ou glissez une image"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isProcessing ? "Analyse des polygones par le serveur..." : "JPG, PNG jusqu'à 10MB"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />

      {previewImage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Aperçu</span>
                {isProcessing && (
                  <span className="text-xs text-muted-foreground">(En traitement par le serveur...)</span>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={clearPreview} disabled={isProcessing}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="aspect-video rounded-md overflow-hidden border border-border">
              <img src={previewImage || "/placeholder.svg"} alt="Aperçu" className="w-full h-full object-cover" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
