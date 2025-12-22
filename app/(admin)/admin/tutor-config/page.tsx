"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, RotateCcw, Save, AlertCircle } from "lucide-react";

interface TutorConfig {
  routerInstructions: string;
  tutorInstructions: string;
  updatedAt: string;
}

export default function TutorConfigPage() {
  const [config, setConfig] = useState<TutorConfig | null>(null);
  const [routerInstructions, setRouterInstructions] = useState("");
  const [tutorInstructions, setTutorInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (config) {
      const changed =
        routerInstructions !== config.routerInstructions ||
        tutorInstructions !== config.tutorInstructions;
      setHasChanges(changed);
    }
  }, [routerInstructions, tutorInstructions, config]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/tutor-config");
      const data = await response.json();
      setConfig(data);
      setRouterInstructions(data.routerInstructions);
      setTutorInstructions(data.tutorInstructions);
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routerInstructions,
          tutorInstructions,
        }),
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

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset to default instructions?")) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/tutor-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reset: true }),
      });

      const data = await response.json();

      if (response.ok) {
        setConfig(data.config);
        setRouterInstructions(data.config.routerInstructions);
        setTutorInstructions(data.config.tutorInstructions);
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
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
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

      {/* Router Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Router Instructions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Controls how the tutor determines which topic the student is asking about
        </p>
        <textarea
          value={routerInstructions}
          onChange={(e) => setRouterInstructions(e.target.value)}
          className="w-full min-h-[300px] p-4 rounded-lg border bg-background font-mono text-sm"
          placeholder="Enter router instructions..."
        />
      </Card>

      {/* Tutor Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Tutor Instructions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Controls how the tutor responds to students (teaching style, constraints, etc.)
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
            <p className="text-sm font-medium">
              You have unsaved changes
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (config) {
                    setRouterInstructions(config.routerInstructions);
                    setTutorInstructions(config.tutorInstructions);
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
