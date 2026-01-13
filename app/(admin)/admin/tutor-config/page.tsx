"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  RotateCcw,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Pencil,
  Check,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";

interface MasterCatalogTrack {
  id: string;
  title: string;
  desc: string;
}

interface Curriculum {
  id: string;
  title: string;
  units: { id: number; name: string }[];
}

interface TutorConfig {
  routerInstructions: string;
  tutorInstructions: string;
  masterCatalog: MasterCatalogTrack[];
  routerModel: string;
  routerTemperature: number;
  updatedAt: string;
}

export default function TutorConfigPage() {
  const [config, setConfig] = useState<TutorConfig | null>(null);
  const [routerInstructions, setRouterInstructions] = useState("");
  const [tutorInstructions, setTutorInstructions] = useState("");
  const [masterCatalog, setMasterCatalog] = useState<MasterCatalogTrack[]>([]);
  const [routerModel, setRouterModel] = useState("gemini-2.0-flash");
  const [routerTemperature, setRouterTemperature] = useState(0.1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Curriculums from DB
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loadingCurriculums, setLoadingCurriculums] = useState(false);
  const [showCurriculumSelector, setShowCurriculumSelector] = useState(false);

  // Inline editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTrack, setEditingTrack] = useState<MasterCatalogTrack | null>(
    null
  );

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (config) {
      const changed =
        routerInstructions !== config.routerInstructions ||
        tutorInstructions !== config.tutorInstructions ||
        JSON.stringify(masterCatalog) !==
          JSON.stringify(config.masterCatalog) ||
        routerModel !== config.routerModel ||
        routerTemperature !== config.routerTemperature;
      setHasChanges(changed);
    }
  }, [
    routerInstructions,
    tutorInstructions,
    masterCatalog,
    routerModel,
    routerTemperature,
    config
  ]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/tutor-config");
      const data = await response.json();
      setConfig(data);
      setRouterInstructions(data.routerInstructions);
      setTutorInstructions(data.tutorInstructions);
      setMasterCatalog(data.masterCatalog || []);
      setRouterModel(data.routerModel || "gemini-2.0-flash");
      setRouterTemperature(data.routerTemperature ?? 0.1);
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/tutor-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          routerInstructions,
          tutorInstructions,
          masterCatalog,
          routerModel,
          routerTemperature
        })
      });

      const data = await response.json();

      if (response.ok) {
        setConfig(data.config);
        setHasChanges(false);
        toast.success("Configuration saved successfully");
      } else {
        toast.error(data.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const fetchCurriculums = async () => {
    setLoadingCurriculums(true);
    try {
      const response = await fetch("/api/admin/curriculums");
      const data = await response.json();
      setCurriculums(data);
    } catch (error) {
      console.error("Error fetching curriculums:", error);
      toast.error("Failed to load curriculums");
    } finally {
      setLoadingCurriculums(false);
    }
  };

  const handleAddTrack = () => {
    const newTrack = { id: "", title: "", desc: "" };
    const newIndex = masterCatalog.length;
    setMasterCatalog([...masterCatalog, newTrack]);
    // Activar modo de edición para la nueva fila
    setEditingIndex(newIndex);
    setEditingTrack(newTrack);
  };

  const handleAddCurriculumAsTrack = (curriculum: Curriculum) => {
    // Generate keywords from unit names
    const keywords = curriculum.units.map((unit) => unit.name).join(", ");

    // Check if this curriculum is already in the catalog
    const exists = masterCatalog.some((track) => track.id === curriculum.id);

    if (exists) {
      toast.error(`"${curriculum.title}" is already in the catalog`);
      return;
    }

    // Add new track
    setMasterCatalog([
      ...masterCatalog,
      {
        id: curriculum.id,
        title: curriculum.title,
        desc: keywords || "No units available"
      }
    ]);

    toast.success(`Added "${curriculum.title}" to catalog`);
  };

  const handleRemoveTrack = (index: number) => {
    setMasterCatalog(masterCatalog.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingTrack({ ...masterCatalog[index] });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingTrack(null);
  };

  const handleSaveEdit = (index: number) => {
    if (editingTrack) {
      const updated = [...masterCatalog];
      updated[index] = editingTrack;
      setMasterCatalog(updated);
    }
    setEditingIndex(null);
    setEditingTrack(null);
  };

  const handleEditFieldChange = (
    field: keyof MasterCatalogTrack,
    value: string
  ) => {
    if (editingTrack) {
      setEditingTrack({ ...editingTrack, [field]: value });
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset to default instructions?")) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/tutor-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reset: true })
      });

      const data = await response.json();

      if (response.ok) {
        setConfig(data.config);
        setRouterInstructions(data.config.routerInstructions);
        setTutorInstructions(data.config.tutorInstructions);
        setMasterCatalog(data.config.masterCatalog || []);
        setRouterModel(data.config.routerModel || "gemini-2.0-flash");
        setRouterTemperature(data.config.routerTemperature ?? 0.1);
        setHasChanges(false);
        toast.success("Configuration reset to defaults");
      } else {
        toast.error(data.error || "Failed to reset configuration");
      }
    } catch (error) {
      console.error("Error resetting config:", error);
      toast.error("Failed to reset configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tutor Configuration</h1>
          <p className="text-muted-foreground">
            Customize how the Almanac Tutor responds to students
          </p>
          {config && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated:{" "}
              {new Date(config.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Warning */}
      <Card className="p-4 border-amber-500 bg-amber-50 dark:bg-amber-950">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
              Important
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              These instructions control how the AI tutor behaves. Changes will
              affect all future conversations. Test thoroughly before making
              significant changes.
            </p>
          </div>
        </div>
      </Card>

      {/* Master Catalog */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Master Catalog</h2>
            <p className="text-sm text-muted-foreground">
              Define all available tracks for the router. These tracks are
              always visible to the AI.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddTrack} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
              Add Custom
            </Button>
            <Button
              onClick={() => {
                setShowCurriculumSelector(true);
                if (curriculums.length === 0) {
                  fetchCurriculums();
                }
              }}
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Curriculum
            </Button>
          </div>
        </div>

        {/* Curriculum Selector Drawer */}
        <Drawer
          open={showCurriculumSelector}
          onOpenChange={setShowCurriculumSelector}
          direction="right"
        >
          <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none">
            <DrawerHeader>
              <DrawerTitle>Add Curriculum to Catalog</DrawerTitle>
              <DrawerDescription>
                Select a curriculum to add to the Master Catalog. Keywords will
                be generated automatically from the curriculum units.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingCurriculums ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : curriculums.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No active curriculums found in database
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {curriculums.map((curriculum) => {
                    const isInCatalog = masterCatalog.some(
                      (track) => track.id === curriculum.id
                    );
                    return (
                      <Card
                        key={curriculum.id}
                        className={`p-4 transition-colors ${
                          isInCatalog
                            ? "bg-green-800 dark:bg-green-950 border-green-300 dark:border-green-700 cursor-not-allowed"
                            : "cursor-pointer hover:bg-purple-800 dark:hover:bg-purple-950 hover:border-purple-300 dark:hover:border-purple-700"
                        }`}
                        onClick={() => {
                          if (!isInCatalog) {
                            handleAddCurriculumAsTrack(curriculum);
                            setShowCurriculumSelector(false);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">
                              {curriculum.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {curriculum.units.length} units
                            </p>
                            {curriculum.units.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {curriculum.units.map((u) => u.name).join(", ")}
                              </p>
                            )}
                          </div>
                          {isInCatalog && (
                            <div className="ml-4 flex-shrink-0">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                                Added
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {masterCatalog.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <p className="mb-2">No tracks defined.</p>
            <p className="text-sm">
              Click "Add Custom" or "Add from Curriculum" to create one.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium text-sm w-[25%]">
                    Track ID
                  </th>
                  <th className="text-left p-3 font-medium text-sm w-[25%]">
                    Course
                  </th>
                  <th className="text-left p-3 font-medium text-sm w-[40%]">
                    Keywords
                  </th>
                  <th className="text-right p-3 font-medium text-sm w-[10%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {masterCatalog.map((track, index) => {
                  const isEditing = editingIndex === index;
                  const displayTrack =
                    isEditing && editingTrack ? editingTrack : track;

                  return (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={displayTrack.id}
                            onChange={(e) =>
                              handleEditFieldChange("id", e.target.value)
                            }
                            placeholder="e.g., track_1_math"
                            className="font-mono text-sm h-8"
                          />
                        ) : (
                          <span className="font-mono text-sm text-muted-foreground">
                            {track.id}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={displayTrack.title}
                            onChange={(e) =>
                              handleEditFieldChange("title", e.target.value)
                            }
                            placeholder="e.g., The Source Code"
                            className="text-sm h-8"
                          />
                        ) : (
                          <span className="font-medium">{track.title}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={displayTrack.desc}
                            onChange={(e) =>
                              handleEditFieldChange("desc", e.target.value)
                            }
                            placeholder="e.g., Math, Logic, Probability"
                            className="text-sm h-8"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground line-clamp-2">
                            {track.desc}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveEdit(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTrack(index)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Router Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Router Instructions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Controls how the tutor determines which topic the student is asking
          about
        </p>
        <textarea
          value={routerInstructions}
          onChange={(e) => setRouterInstructions(e.target.value)}
          className="w-full min-h-[300px] p-4 rounded-lg border bg-background font-mono text-sm"
          placeholder="Enter router instructions..."
        />
      </Card>

      {/* Router Configuration */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Router Configuration</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Configure the AI model and temperature for the router
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Router Model */}
          <div className="space-y-2">
            <Label htmlFor="router-model">Router Model</Label>
            <Select value={routerModel} onValueChange={setRouterModel}>
              <SelectTrigger id="router-model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.0-flash">
                  Gemini 2.0 Flash (Recommended)
                </SelectItem>
                <SelectItem value="gemini-2.5-flash">
                  Gemini 2.5 Flash
                </SelectItem>
                <SelectItem value="gemini-1.5-flash">
                  Gemini 1.5 Flash
                </SelectItem>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Faster models are better for routing decisions
            </p>
          </div>

          {/* Router Temperature */}
          <div className="space-y-2">
            <Label htmlFor="router-temperature">
              Router Temperature: {routerTemperature.toFixed(2)}
            </Label>
            <Input
              id="router-temperature"
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={routerTemperature}
              onChange={(e) =>
                setRouterTemperature(parseFloat(e.target.value) || 0)
              }
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Lower values (0.0-0.2) make routing more deterministic
            </p>
          </div>
        </div>
      </Card>

      {/* Tutor Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Tutor Instructions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Controls how the tutor responds to students (teaching style,
          constraints, etc.)
        </p>
        <textarea
          value={tutorInstructions}
          onChange={(e) => setTutorInstructions(e.target.value)}
          className="w-full min-h-[300px] p-4 rounded-lg border bg-background font-mono text-sm"
          placeholder="Enter tutor instructions..."
        />
      </Card>

      {/* Save Button (Bottom) */}
      {hasChanges && (
        <Card className="p-4 sticky bottom-4 shadow-lg border-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">You have unsaved changes</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (config) {
                    setRouterInstructions(config.routerInstructions);
                    setTutorInstructions(config.tutorInstructions);
                    setMasterCatalog(config.masterCatalog || []);
                    setRouterModel(config.routerModel || "gemini-2.0-flash");
                    setRouterTemperature(config.routerTemperature ?? 0.1);
                  }
                }}
              >
                Discard
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
