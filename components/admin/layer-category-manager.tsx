"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Pencil,
  Check,
  X,
  Upload
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { LayerCategory, LayerTrait } from "@/lib/types";
import { LayerTraitUploader } from "./layer-trait-uploader";

// ── Sortable Trait Row ──────────────────────────────────────────────────

function SortableTraitRow({
  trait,
  category,
  editingTraitId,
  editWeight,
  setEditingTraitId,
  setEditWeight,
  updateTraitWeight,
  deleteTrait,
  handleImageUpload,
  uploadingTraitId
}: {
  trait: LayerTrait;
  category: LayerCategory;
  editingTraitId: string | null;
  editWeight: string;
  setEditingTraitId: (id: string | null) => void;
  setEditWeight: (w: string) => void;
  updateTraitWeight: (id: string) => void;
  deleteTrait: (id: string) => void;
  handleImageUpload: (traitId: string, file: File) => void;
  uploadingTraitId: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: trait.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const totalWeight = category.traits.reduce((s, t) => s + t.weight, 0);
  const probability =
    totalWeight === 0 ? "0" : ((trait.weight / totalWeight) * 100).toFixed(1);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[24px_60px_1fr_80px_80px_40px] gap-2 items-center bg-muted/50 rounded-md p-1"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <label className="relative w-10 h-10 rounded border overflow-hidden cursor-pointer group">
        {trait.imageUrl.startsWith("placeholder://") ? (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Upload className="w-4 h-4 text-muted-foreground" />
          </div>
        ) : (
          <img
            src={trait.imageUrl}
            alt={trait.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploadingTraitId === trait.id ? (
            <span className="text-white text-[10px]">...</span>
          ) : (
            <Upload className="w-3.5 h-3.5 text-white" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(trait.id, file);
            e.target.value = "";
          }}
        />
      </label>

      <span className="text-sm truncate">{trait.name}</span>

      {editingTraitId === trait.id ? (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min="1"
            value={editWeight}
            onChange={(e) => setEditWeight(e.target.value)}
            className="h-7 w-14 text-xs"
          />
          <button
            onClick={() => updateTraitWeight(trait.id)}
            className="text-green-600"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={() => setEditingTraitId(null)}
            className="text-red-500"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setEditingTraitId(trait.id);
            setEditWeight(String(trait.weight));
          }}
          className="text-sm text-left hover:underline flex items-center gap-1"
        >
          {trait.weight}
          <Pencil className="w-3 h-3 text-muted-foreground" />
        </button>
      )}

      <span className="text-sm text-muted-foreground">{probability}%</span>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="text-red-400 hover:text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar trait</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{trait.name}&quot; y su imagen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTrait(trait.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Sortable Category Card ──────────────────────────────────────────────

function SortableCategoryCard({
  category,
  isExpanded,
  onToggleExpand,
  onDeleteCategory,
  onTraitDragEnd,
  editingTraitId,
  editWeight,
  setEditingTraitId,
  setEditWeight,
  updateTraitWeight,
  deleteTrait,
  handleImageUpload,
  uploadingTraitId,
  fetchCategories
}: {
  category: LayerCategory;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDeleteCategory: (id: string) => void;
  onTraitDragEnd: (categoryId: string, event: DragEndEvent) => void;
  editingTraitId: string | null;
  editWeight: string;
  setEditingTraitId: (id: string | null) => void;
  setEditWeight: (w: string) => void;
  updateTraitWeight: (id: string) => void;
  deleteTrait: (id: string) => void;
  handleImageUpload: (traitId: string, file: File) => void;
  uploadingTraitId: string | null;
  fetchCategories: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const traitSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <Card ref={setNodeRef} style={style}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <button
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <div
              className="flex items-center gap-2 cursor-pointer flex-1"
              onClick={onToggleExpand}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <CardTitle className="text-sm font-medium">
                {category.name}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Orden: {category.order}
              </Badge>
              <Badge
                variant={category.isRequired ? "default" : "secondary"}
                className="text-xs"
              >
                {category.isRequired ? "Requerida" : "Opcional"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {category.traits.length} traits
              </Badge>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar categoría</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminará &quot;{category.name}&quot; y todos sus traits.
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteCategory(category.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 px-4 pb-4">
          {category.traits.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-[24px_60px_1fr_80px_80px_40px] gap-2 text-xs text-muted-foreground font-medium px-1">
                <span></span>
                <span>Preview</span>
                <span>Nombre</span>
                <span>Peso</span>
                <span>Prob.</span>
                <span></span>
              </div>
              <DndContext
                sensors={traitSensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => onTraitDragEnd(category.id, e)}
              >
                <SortableContext
                  items={category.traits.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {category.traits.map((trait) => (
                    <SortableTraitRow
                      key={trait.id}
                      trait={trait}
                      category={category}
                      editingTraitId={editingTraitId}
                      editWeight={editWeight}
                      setEditingTraitId={setEditingTraitId}
                      setEditWeight={setEditWeight}
                      updateTraitWeight={updateTraitWeight}
                      deleteTrait={deleteTrait}
                      handleImageUpload={handleImageUpload}
                      uploadingTraitId={uploadingTraitId}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {category.traits.length === 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Sin traits. Agrega uno abajo.
            </p>
          )}

          <LayerTraitUploader
            categoryId={category.id}
            onTraitCreated={fetchCategories}
          />
        </CardContent>
      )}
    </Card>
  );
}

// ── Main Component ──────────────────────────────────────────────────────

interface LayerCategoryManagerProps {
  collectionId: string;
}

export function LayerCategoryManager({
  collectionId
}: LayerCategoryManagerProps) {
  const [categories, setCategories] = useState<LayerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New category form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [newRequired, setNewRequired] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);

  // Edit trait weight
  const [editingTraitId, setEditingTraitId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");

  // Upload trait image
  const [uploadingTraitId, setUploadingTraitId] = useState<string | null>(null);

  // Drag sensors — require small movement to avoid conflict with clicks
  const categorySensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleImageUpload = async (traitId: string, file: File) => {
    setUploadingTraitId(traitId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/layer-traits/${traitId}`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al subir imagen");
      }

      toast.success("Imagen actualizada");
      fetchCategories();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al subir imagen"
      );
    } finally {
      setUploadingTraitId(null);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `/api/admin/layer-categories?collectionId=${collectionId}`
      );
      if (!res.ok) throw new Error("Error loading categories");
      const data = await res.json();
      setCategories(data);
      if (data.length > 0) {
        setNewOrder(Math.max(...data.map((c: LayerCategory) => c.order)) + 1);
      }
    } catch {
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [collectionId]);

  const addCategory = async () => {
    if (!newName.trim()) return;
    setAddingCategory(true);
    try {
      const res = await fetch("/api/admin/layer-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId,
          name: newName.trim(),
          order: newOrder,
          isRequired: newRequired
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      toast.success(`Categoría "${newName}" creada`);
      setNewName("");
      setShowAddForm(false);
      fetchCategories();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear categoría"
      );
    } finally {
      setAddingCategory(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/layer-categories/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Error deleting category");
      toast.success("Categoría eliminada");
      fetchCategories();
    } catch {
      toast.error("Error al eliminar categoría");
    }
  };

  const updateTraitWeight = async (traitId: string) => {
    try {
      const res = await fetch(`/api/admin/layer-traits/${traitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseInt(editWeight) })
      });
      if (!res.ok) throw new Error("Error updating weight");
      setEditingTraitId(null);
      fetchCategories();
    } catch {
      toast.error("Error al actualizar peso");
    }
  };

  const deleteTrait = async (traitId: string) => {
    try {
      const res = await fetch(`/api/admin/layer-traits/${traitId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Error deleting trait");
      toast.success("Trait eliminado");
      fetchCategories();
    } catch {
      toast.error("Error al eliminar trait");
    }
  };

  // ── Category drag end → reorder & persist ───────────────────────────

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex).map((c, i) => ({
      ...c,
      order: i
    }));

    setCategories(reordered);

    try {
      const res = await fetch("/api/admin/layer-categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((c) => c.id) })
      });
      if (!res.ok) throw new Error("Error reordering");
      toast.success("Orden actualizado");
    } catch {
      toast.error("Error al reordenar categorías");
      fetchCategories();
    }
  };

  // ── Trait drag end → reorder visually (no DB order field) ───────────

  const handleTraitDragEnd = (categoryId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const oldIndex = cat.traits.findIndex((t) => t.id === active.id);
        const newIndex = cat.traits.findIndex((t) => t.id === over.id);
        return { ...cat, traits: arrayMove(cat.traits, oldIndex, newIndex) };
      })
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando categorías...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Categories list with drag & drop */}
      <DndContext
        sensors={categorySensors}
        collisionDetection={closestCenter}
        onDragEnd={handleCategoryDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => (
            <SortableCategoryCard
              key={category.id}
              category={category}
              isExpanded={expandedId === category.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === category.id ? null : category.id)
              }
              onDeleteCategory={deleteCategory}
              onTraitDragEnd={handleTraitDragEnd}
              editingTraitId={editingTraitId}
              editWeight={editWeight}
              setEditingTraitId={setEditingTraitId}
              setEditWeight={setEditWeight}
              updateTraitWeight={updateTraitWeight}
              deleteTrait={deleteTrait}
              handleImageUpload={handleImageUpload}
              uploadingTraitId={uploadingTraitId}
              fetchCategories={fetchCategories}
            />
          ))}
        </SortableContext>
      </DndContext>

      {categories.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No hay categorías. Crea la primera para comenzar.
        </p>
      )}

      {/* Add category form */}
      {showAddForm ? (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-xs mb-1">Nombre</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Background, Body, Eyes..."
                  className="h-9"
                />
              </div>
              <div className="w-20">
                <Label className="text-xs mb-1">Orden</Label>
                <Input
                  type="number"
                  min="0"
                  value={newOrder}
                  onChange={(e) => setNewOrder(parseInt(e.target.value) || 0)}
                  className="h-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newRequired}
                  onCheckedChange={setNewRequired}
                />
                <Label className="text-xs">Requerida</Label>
              </div>
              <Button
                size="sm"
                className="h-9"
                onClick={addCategory}
                disabled={addingCategory || !newName.trim()}
              >
                {addingCategory ? "..." : "Crear"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-9"
                onClick={() => setShowAddForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Categoría
        </Button>
      )}
    </div>
  );
}
