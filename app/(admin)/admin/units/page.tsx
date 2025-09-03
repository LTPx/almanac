"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import LearningGrid from "@/components/learning-path"

type Unit = {
  id: number
  name: string
  description: string | null
  order: number
  isActive: boolean
  _count: {
    lessons: number
  }
}

export default function UnitsAdminPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: 1
  })
  // const { toast } = useToast();

  // Fetch units
  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/units")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setUnits(data)
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "No se pudieron cargar las unidades",
      //   variant: "destructive",
      // });
      toast.error("No se pudieron cargar las unidades")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingUnit ? `/api/units/${editingUnit.id}` : "/api/units"
      const method = editingUnit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to save")

      // toast({
      //   title: "Éxito",
      //   description: `Unidad ${editingUnit ? 'actualizada' : 'creada'} correctamente`,
      // });
      toast.success(
        `Unidad ${editingUnit ? "actualizada" : "creada"} correctamente`
      )

      setDialogOpen(false)
      setEditingUnit(null)
      setFormData({ name: "", description: "", order: 1 })
      fetchUnits()
    } catch (error) {
      toast.error("No se pudo guardar la unidad")

      // toast({
      //   title: "Error",
      //   description: "No se pudo guardar la unidad",
      //   variant: "destructive",
      // });
    }
  }

  // Handle edit
  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormData({
      name: unit.name,
      description: unit.description || "",
      order: unit.order
    })
    setDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (unit: Unit) => {
    if (!confirm(`¿Estás seguro de eliminar "${unit.name}"?`)) return

    try {
      const response = await fetch(`/api/units/${unit.id}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Failed to delete")

      // toast({
      //   title: "Éxito",
      //   description: "Unidad eliminada correctamente",
      // });
      toast.success("Unidad eliminada correctamente")

      fetchUnits()
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "No se pudo eliminar la unidad",
      //   variant: "destructive",
      // });
      toast.error("No se pudo eliminar la unidad")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Unidades</h1>
          <p className="text-muted-foreground">
            Administra las unidades de aprendizaje
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingUnit(null)
                setFormData({ name: "", description: "", order: 1 })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Unidad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUnit ? "Editar Unidad" : "Crear Nueva Unidad"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nombre de la unidad"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descripción opcional"
                />
              </div>
              <div>
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value)
                    })
                  }
                  min="1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingUnit ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => (
          <Card key={unit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{unit.name}</CardTitle>
                  <Badge variant="secondary">Orden: {unit.order}</Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(unit)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(unit)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {unit.description && (
                <p className="text-muted-foreground mb-4">{unit.description}</p>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>{unit._count.lessons} lecciones</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {units.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay unidades</h3>
          <p className="text-muted-foreground mb-4">
            Crea tu primera unidad para comenzar
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera Unidad
          </Button>
        </div>
      )}

      <LearningGrid />
    </div>
  )
}
