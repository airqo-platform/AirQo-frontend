"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { diagnosticsService } from "@/services/diagnosticsService";
import {
  DeviceProfile,
  ComponentDefinition,
  ComponentRelationship,
  getRelationshipDetails,
} from "@/types/diagnostics";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Activity,
  Sun,
  Moon,
  Compass,
  ArrowRight,
  Save,
  Check,
} from "lucide-react";

interface SubsystemTopologyFlowProps {
  profile: DeviceProfile;
  onEditSubsystem?: (component: ComponentDefinition, index: number) => void;
  onAddMetric?: (componentIndex: number) => void;
  onEditRelationship?: (relationshipIndex: number) => void;
  onDeleteRelationship?: (relationshipIndex: number) => void;
  onOpenAddRelationship?: (preselectedSource?: string, preselectedTarget?: string) => void;
  onOpenAddSubsystem?: () => void;
  onSuccess?: (updated: DeviceProfile) => void;
  className?: string;
}

interface NodePosition {
  x: number;
  y: number;
}

interface LayoutNode {
  id: string;
  name: string;
  component: ComponentDefinition;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutEdge {
  id: string;
  index: number;
  sourceId: string;
  targetId: string;
  sourceName: string;
  targetName: string;
  relationType: string;
  rawRel: ComponentRelationship;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 86;

const getComponentCoordinates = (comp: ComponentDefinition): NodePosition | null => {
  const x =
    typeof comp.x_coordinate === "number"
      ? comp.x_coordinate
      : typeof comp.x === "number"
      ? comp.x
      : typeof comp.meta_data?.x_coordinate === "number"
      ? comp.meta_data.x_coordinate
      : typeof comp.meta_data?.x === "number"
      ? comp.meta_data.x
      : null;

  const y =
    typeof comp.y_coordinate === "number"
      ? comp.y_coordinate
      : typeof comp.y === "number"
      ? comp.y
      : typeof comp.meta_data?.y_coordinate === "number"
      ? comp.meta_data.y_coordinate
      : typeof comp.meta_data?.y === "number"
      ? comp.meta_data.y
      : null;

  if (x !== null && y !== null && !isNaN(x) && !isNaN(y)) {
    return { x: Math.round(x), y: Math.round(y) };
  }
  return null;
};

export function SubsystemTopologyFlow({
  profile,
  onEditSubsystem,
  onAddMetric,
  onEditRelationship,
  onDeleteRelationship,
  onOpenAddRelationship,
  onOpenAddSubsystem,
  onSuccess,
  className = "",
}: SubsystemTopologyFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas State: Pan & Zoom
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 60, y: 40 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Theme: Dark by default (as in diagram) with light mode toggle
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Node Positions (custom dragged positions & persistent layout)
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodeDragOffset, setNodeDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSavingLayout, setIsSavingLayout] = useState<boolean>(false);

  // Interactive Connection Linking Mode (click source port then target node)
  const [connectingSourceNode, setConnectingSourceNode] = useState<string | null>(null);

  // Selected Elements
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const components = useMemo(() => profile.components || [], [profile.components]);
  const relationships = useMemo(() => profile.relationships || [], [profile.relationships]);

  // Compute Auto-Layout positions using Topological DAG ranking
  const computeAutoLayout = useCallback((): Record<string, NodePosition> => {
    if (components.length === 0) return {};

    // 1. Build adjacency and in-degree maps
    const nameToComp = new Map<string, ComponentDefinition>();
    components.forEach((c) => {
      nameToComp.set(c.name, c);
      if (c.id) nameToComp.set(c.id, c);
    });

    const inDegree: Record<string, number> = {};
    const outEdges: Record<string, string[]> = {};
    components.forEach((c) => {
      inDegree[c.name] = 0;
      outEdges[c.name] = [];
    });

    relationships.forEach((rel) => {
      const details = getRelationshipDetails(rel, components);
      if (details.sourceName && details.targetName && details.sourceName !== details.targetName) {
        if (inDegree[details.targetName] !== undefined) {
          inDegree[details.targetName] = (inDegree[details.targetName] || 0) + 1;
        }
        if (outEdges[details.sourceName]) {
          outEdges[details.sourceName].push(details.targetName);
        }
      }
    });

    // 2. Assign topological rank/levels
    // Level 0: In-degree 0 power/solar sources or primary suppliers
    // Next levels: components powered or fed by previous levels
    const levels: Record<string, number> = {};

    components.forEach((c) => {
      const isPowerType =
        c.component_type?.toLowerCase().includes("power") ||
        c.component_type?.toLowerCase().includes("solar") ||
        c.name?.toLowerCase().includes("solar") ||
        c.name?.toLowerCase().includes("panel") ||
        c.name?.toLowerCase().includes("grid");

      if (inDegree[c.name] === 0 && isPowerType) {
        levels[c.name] = 0;
      } else if (inDegree[c.name] === 0) {
        levels[c.name] = c.component_type?.toLowerCase().includes("battery") ? 1 : 0;
      }
    });

    // BFS to assign deeper levels
    let changed = true;
    let iteration = 0;
    while (changed && iteration < 10) {
      changed = false;
      iteration++;
      relationships.forEach((rel) => {
        const details = getRelationshipDetails(rel, components);
        const src = details.sourceName;
        const tgt = details.targetName;
        if (levels[src] !== undefined) {
          const expectedTgtLevel =
            details.relationType === "MEASURES_SAME_AS"
              ? levels[src] // same lateral level for cross-sensor comparison
              : levels[src] + 1;

          if (levels[tgt] === undefined || levels[tgt] < expectedTgtLevel) {
            levels[tgt] = expectedTgtLevel;
            changed = true;
          }
        }
      });
    }

    // Fallback unassigned nodes based on component type
    components.forEach((c) => {
      if (levels[c.name] === undefined) {
        const type = c.component_type?.toLowerCase() || "";
        if (type.includes("power") || type.includes("solar")) levels[c.name] = 0;
        else if (type.includes("battery") || type.includes("storage")) levels[c.name] = 1;
        else if (type.includes("sensor")) levels[c.name] = 2;
        else if (type.includes("modem") || type.includes("connectivity")) levels[c.name] = 2;
        else if (type.includes("compute") || type.includes("mcu") || type.includes("bus")) levels[c.name] = 3;
        else levels[c.name] = 2;
      }
    });

    // 3. Group nodes by level and compute (X, Y) coordinates
    const levelGroups: Record<number, ComponentDefinition[]> = {};
    components.forEach((c) => {
      const lvl = levels[c.name] || 0;
      if (!levelGroups[lvl]) levelGroups[lvl] = [];
      levelGroups[lvl].push(c);
    });

    const positions: Record<string, NodePosition> = {};
    const startY = 60;
    const levelSpacingY = 170;
    const nodeSpacingX = 270;
    const canvasCenterX = 450;

    const sortedLevels = Object.keys(levelGroups)
      .map(Number)
      .sort((a, b) => a - b);

    sortedLevels.forEach((lvl) => {
      const group = levelGroups[lvl];
      const count = group.length;
      const totalGroupWidth = count * NODE_WIDTH + (count - 1) * (nodeSpacingX - NODE_WIDTH);
      const startX = canvasCenterX - totalGroupWidth / 2;

      group.forEach((comp, idx) => {
        positions[comp.name] = {
          x: Math.round(startX + idx * nodeSpacingX),
          y: Math.round(startY + lvl * levelSpacingY),
        };
      });
    });

    return positions;
  }, [components, relationships]);

  const prevComponentNamesRef = useRef<string[] | null>(null);
  const prevProfileIdRef = useRef<string>(profile.id);

  // Initialize or restore saved coordinates on profile change
  useEffect(() => {
    const isProfileChanged = prevProfileIdRef.current !== profile.id;
    const prevNames = prevComponentNamesRef.current;
    const currentNames = components.map((c) => c.name);

    const isComponentSetChanged =
      isProfileChanged ||
      prevNames === null ||
      prevNames.length !== currentNames.length ||
      currentNames.some((name) => !prevNames.includes(name));

    if (!isComponentSetChanged) {
      return;
    }

    prevProfileIdRef.current = profile.id;
    prevComponentNamesRef.current = currentNames;

    const autoPositions = computeAutoLayout();

    setNodePositions((prev) => {
      const nextPositions: Record<string, NodePosition> = {};

      components.forEach((comp, index) => {
        if (!isProfileChanged && prev[comp.name]) {
          nextPositions[comp.name] = prev[comp.name];
          return;
        }

        const savedCoord = getComponentCoordinates(comp);
        if (savedCoord) {
          nextPositions[comp.name] = savedCoord;
        } else if (autoPositions[comp.name]) {
          nextPositions[comp.name] = autoPositions[comp.name];
        } else {
          nextPositions[comp.name] = {
            x: 100 + index * 180,
            y: 100 + index * 80,
          };
        }
      });

      return nextPositions;
    });

    setHasUnsavedChanges(false);
  }, [profile.id, components, computeAutoLayout]);

  const handleResetLayout = () => {
    const autoPositions = computeAutoLayout();
    setNodePositions(autoPositions);
    setHasUnsavedChanges(true);
    setZoom(0.9);
    setPan({ x: 60, y: 40 });
  };

  const handleSaveLayout = async () => {
    if (!profile) return;
    setIsSavingLayout(true);

    const updatedComponents: ComponentDefinition[] = (profile.components || []).map((comp) => {
      const pos = nodePositions[comp.name];
      if (pos) {
        return {
          ...comp,
          x_coordinate: pos.x,
          y_coordinate: pos.y,
          x: pos.x,
          y: pos.y,
          meta_data: {
            ...(comp.meta_data || {}),
            x_coordinate: pos.x,
            y_coordinate: pos.y,
          },
        };
      }
      return comp;
    });

    const payload: Partial<DeviceProfile> = {
      ...profile,
      components: updatedComponents,
    };

    try {
      const updated = await diagnosticsService.updateProfile(profile.id, payload);
      toast({
        title: "Diagram Layout Saved",
        description: "Subsystem (X, Y) coordinates have been successfully persisted.",
      });
      setHasUnsavedChanges(false);
      if (onSuccess) {
        onSuccess(updated);
      }
    } catch (err: any) {
      toast({
        title: "Failed to Save Layout",
        description: err?.message || "Could not save canvas coordinates.",
        variant: "destructive",
      });
    } finally {
      setIsSavingLayout(false);
    }
  };

  // Convert components to LayoutNodes
  const layoutNodes: LayoutNode[] = useMemo(() => {
    return components.map((comp, index) => {
      const pos = nodePositions[comp.name] || { x: 100 + index * 180, y: 100 + index * 80 };
      return {
        id: comp.id || comp.name,
        name: comp.name,
        component: comp,
        index,
        x: pos.x,
        y: pos.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      };
    });
  }, [components, nodePositions]);

  // Convert relationships to LayoutEdges
  const layoutEdges: LayoutEdge[] = useMemo(() => {
    return relationships.map((rel, index) => {
      const details = getRelationshipDetails(rel, components);
      return {
        id: rel.id || `rel-${index}`,
        index,
        sourceId: details.sourceName,
        targetId: details.targetName,
        sourceName: details.sourceName,
        targetName: details.targetName,
        relationType: details.relationType,
        rawRel: rel,
      };
    });
  }, [relationships, components]);

  // Mouse pan & zoom handlers
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (
      e.target === containerRef.current ||
      (e.target as HTMLElement).tagName === "svg" ||
      (e.target as HTMLElement).classList.contains("canvas-bg")
    ) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setConnectingSourceNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (draggingNodeId) {
      const newX = Math.round((e.clientX - nodeDragOffset.x) / zoom);
      const newY = Math.round((e.clientY - nodeDragOffset.y) / zoom);
      setNodePositions((prev) => ({
        ...prev,
        [draggingNodeId]: { x: newX, y: newY },
      }));
      setHasUnsavedChanges(true);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.35), 2.2));
    };

    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, []);

  const handleStartNodeDrag = (e: React.MouseEvent, nodeName: string, currentPos: NodePosition) => {
    e.stopPropagation();
    if (connectingSourceNode) {
      if (connectingSourceNode !== nodeName && onOpenAddRelationship) {
        onOpenAddRelationship(connectingSourceNode, nodeName);
      }
      setConnectingSourceNode(null);
      return;
    }
    setDraggingNodeId(nodeName);
    setSelectedNodeId(nodeName);
    setNodeDragOffset({
      x: e.clientX - currentPos.x * zoom,
      y: e.clientY - currentPos.y * zoom,
    });
  };

  const handleStartConnection = (e: React.MouseEvent, nodeName: string) => {
    e.stopPropagation();
    setConnectingSourceNode(nodeName);
  };

  // Edge Path Calculation: Smooth Orthogonal or Bezier routing
  const calculateEdgePath = (sourcePos: NodePosition, targetPos: NodePosition, relationType: string) => {
    const isLateral = relationType === "MEASURES_SAME_AS" || Math.abs(sourcePos.y - targetPos.y) < 60;

    let sx: number, sy: number, tx: number, ty: number;

    if (isLateral) {
      if (sourcePos.x < targetPos.x) {
        sx = sourcePos.x + NODE_WIDTH;
        sy = sourcePos.y + NODE_HEIGHT / 2;
        tx = targetPos.x;
        ty = targetPos.y + NODE_HEIGHT / 2;
      } else {
        sx = sourcePos.x;
        sy = sourcePos.y + NODE_HEIGHT / 2;
        tx = targetPos.x + NODE_WIDTH;
        ty = targetPos.y + NODE_HEIGHT / 2;
      }
    } else {
      sx = sourcePos.x + NODE_WIDTH / 2;
      sy = sourcePos.y + NODE_HEIGHT;
      tx = targetPos.x + NODE_WIDTH / 2;
      ty = targetPos.y;
    }

    const dy = Math.max(Math.abs(ty - sy) * 0.45, 40);
    let path = "";
    let midX = (sx + tx) / 2;
    let midY = (sy + ty) / 2;

    if (isLateral) {
      const dx = Math.abs(tx - sx) * 0.45;
      path = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
      midX = (sx + tx) / 2;
      midY = (sy + ty) / 2;
    } else {
      path = `M ${sx} ${sy} C ${sx} ${sy + dy}, ${tx} ${ty - dy}, ${tx} ${ty}`;
      midX = (sx + tx) / 2;
      midY = (sy + ty) / 2;
    }

    return { path, sx, sy, tx, ty, midX, midY };
  };

  // Color & Badge Tokens for Relationship Types
  const getRelationStyle = (type: string) => {
    switch (type) {
      case "POWERS":
        return {
          stroke: "#f59e0b",
          markerColor: "#f59e0b",
          badgeBg: isDarkMode ? "bg-amber-950/90 border-amber-500/60 text-amber-300" : "bg-amber-50 border-amber-300 text-amber-800",
          iconColor: "text-amber-400",
        };
      case "MEASURES_SAME_AS":
        return {
          stroke: "#a855f7",
          markerColor: "#a855f7",
          badgeBg: isDarkMode ? "bg-purple-950/90 border-purple-500/60 text-purple-300" : "bg-purple-50 border-purple-300 text-purple-800",
          iconColor: "text-purple-400",
        };
      case "COMMUNICATES_VIA":
        return {
          stroke: "#10b981",
          markerColor: "#10b981",
          badgeBg: isDarkMode ? "bg-emerald-950/90 border-emerald-500/60 text-emerald-300" : "bg-emerald-50 border-emerald-300 text-emerald-800",
          iconColor: "text-emerald-400",
        };
      case "COOLS":
        return {
          stroke: "#0ea5e9",
          markerColor: "#0ea5e9",
          badgeBg: isDarkMode ? "bg-sky-950/90 border-sky-500/60 text-sky-300" : "bg-sky-50 border-sky-300 text-sky-800",
          iconColor: "text-sky-400",
        };
      default:
        return {
          stroke: "#64748b",
          markerColor: "#64748b",
          badgeBg: isDarkMode ? "bg-zinc-800 border-zinc-600 text-zinc-300" : "bg-slate-100 border-slate-300 text-slate-700",
          iconColor: "text-slate-400",
        };
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl border transition-colors ${
        isDarkMode ? "bg-[#18181b] border-zinc-800 text-zinc-100" : "bg-[#f8fafc] border-slate-200 text-slate-900"
      } ${className}`}
      style={{ height: isFullscreen ? "100vh" : "620px", cursor: isPanning ? "grabbing" : "default" }}
      onMouseDown={handleMouseDownCanvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Floating Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-black/40 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg">
          <div className="flex items-center gap-1 px-2 text-xs font-bold text-white/90">
            <Activity className="w-4 h-4 text-primary" />
            <span>Interactive Subsystem Flow</span>
          </div>
          <div className="h-4 w-px bg-white/20 mx-1" />
          <span className="text-[11px] text-white/60 font-mono">
            {components.length} subsystems · {relationships.length} links
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-black/40 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg">
          {connectingSourceNode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/20 border border-primary text-[11px] text-primary-foreground font-semibold animate-pulse mr-1">
              <span>Click target subsystem to link from {connectingSourceNode}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConnectingSourceNode(null)}
                className="h-5 px-1.5 text-[10px] text-white hover:bg-white/20"
              >
                Cancel
              </Button>
            </div>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetLayout}
            className="h-7 text-xs text-white/90 hover:bg-white/10 gap-1 px-2"
            title="Auto-Arrange Nodes"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Auto-Layout
          </Button>

          <Button
            size="sm"
            onClick={handleSaveLayout}
            disabled={isSavingLayout}
            className={`h-7 text-xs font-semibold gap-1 px-2.5 transition-all ${
              hasUnsavedChanges
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md animate-pulse"
                : "bg-white/10 hover:bg-white/20 text-white/90"
            }`}
            title="Save Subsystem Positions"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingLayout ? "Saving..." : hasUnsavedChanges ? "Save Layout *" : "Save Layout"}</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
            className="h-7 w-7 p-0 text-white/90 hover:bg-white/10"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.35))}
            className="h-7 w-7 p-0 text-white/90 hover:bg-white/10"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setZoom(0.9);
              setPan({ x: 60, y: 40 });
            }}
            className="h-7 w-7 p-0 text-white/90 hover:bg-white/10"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <div className="h-4 w-px bg-white/20 mx-0.5" />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="h-7 w-7 p-0 text-white/90 hover:bg-white/10"
            title={isDarkMode ? "Switch to Light Canvas" : "Switch to Dark Canvas"}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-7 w-7 p-0 text-white/90 hover:bg-white/10"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>

          {onOpenAddRelationship && (
            <Button
              size="sm"
              onClick={() => onOpenAddRelationship()}
              className="h-7 text-xs bg-primary hover:bg-primary/90 text-white gap-1 font-semibold ml-1 shadow-sm"
            >
              <Plus className="w-3 h-3" /> Link
            </Button>
          )}
        </div>
      </div>

      {/* SVG Canvas for Grid and Connections */}
      <svg
        className="canvas-bg absolute inset-0 w-full h-full pointer-events-auto"
        style={{
          backgroundImage: isDarkMode
            ? "radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)"
            : "radial-gradient(rgba(0, 0, 0, 0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        <defs>
          {/* Arrowhead Markers for Each Relationship Type */}
          {["POWERS", "MEASURES_SAME_AS", "COMMUNICATES_VIA", "COOLS", "DEFAULT"].map((type) => {
            const style = getRelationStyle(type);
            return (
              <marker
                key={type}
                id={`arrow-${type}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill={style.markerColor} />
              </marker>
            );
          })}
        </defs>

        {/* Transformed Flow Space */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render Connections / Edges */}
          {layoutEdges.map((edge) => {
            const srcPos = nodePositions[edge.sourceName];
            const tgtPos = nodePositions[edge.targetName];
            if (!srcPos || !tgtPos) return null;

            const edgeGeom = calculateEdgePath(srcPos, tgtPos, edge.relationType);
            const style = getRelationStyle(edge.relationType);
            const isHovered = hoveredEdgeId === edge.id;
            const isSelected = selectedEdgeId === edge.id;

            return (
              <g key={edge.id} className="edge-group cursor-pointer">
                {/* Invisible wider hit area for easy hover/clicking */}
                <path
                  d={edgeGeom.path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  onMouseEnter={() => setHoveredEdgeId(edge.id)}
                  onMouseLeave={() => setHoveredEdgeId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdgeId(edge.id);
                  }}
                />

                {/* Visible Connection Line */}
                <path
                  d={edgeGeom.path}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={isSelected || isHovered ? "2.8" : "1.8"}
                  strokeDasharray={edge.relationType === "MEASURES_SAME_AS" ? "5 4" : undefined}
                  markerEnd={`url(#arrow-${edge.relationType || "DEFAULT"})`}
                  className="transition-all duration-150"
                  style={{ opacity: isHovered || isSelected ? 1 : 0.85 }}
                />

                {/* Interactive Relationship Badge at the midpoint of the curve */}
                <foreignObject
                  x={edgeGeom.midX - 70}
                  y={edgeGeom.midY - 14}
                  width="140"
                  height="30"
                  className="overflow-visible pointer-events-auto"
                >
                  <div
                    onMouseEnter={() => setHoveredEdgeId(edge.id)}
                    onMouseLeave={() => setHoveredEdgeId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEdgeId(edge.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold shadow-md cursor-pointer transition-transform hover:scale-105 ${style.badgeBg} ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <span>{edge.relationType}</span>

                    {/* Quick action buttons on hover / selection */}
                    {(isHovered || isSelected) && (
                      <div className="flex items-center gap-1 ml-1 border-l border-white/20 pl-1">
                        {onEditRelationship && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditRelationship(edge.index);
                            }}
                            className="p-0.5 hover:text-white rounded"
                            title="Edit Relationship"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {onDeleteRelationship && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRelationship(edge.index);
                            }}
                            className="p-0.5 hover:text-rose-400 rounded"
                            title="Delete Relationship"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>

      {/* HTML Rendered Draggable Nodes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {layoutNodes.map((node) => {
          const isSelected = selectedNodeId === node.name;
          const isConnectingSource = connectingSourceNode === node.name;
          const comp = node.component;

          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${NODE_WIDTH}px`,
                minHeight: `${NODE_HEIGHT}px`,
              }}
              className={`group pointer-events-auto rounded-xl border p-3 shadow-md transition-shadow select-none cursor-move flex flex-col justify-between ${
                isDarkMode
                  ? "bg-zinc-900/95 border-zinc-700 text-zinc-100 hover:border-zinc-500"
                  : "bg-white/95 border-slate-300 text-slate-800 hover:border-slate-400"
              } ${isSelected ? "ring-2 ring-primary border-primary" : ""} ${
                isConnectingSource ? "ring-2 ring-amber-400 border-amber-400 animate-pulse" : ""
              }`}
              onMouseDown={(e) => handleStartNodeDrag(e, node.name, { x: node.x, y: node.y })}
              onClick={(e) => {
                e.stopPropagation();
                if (connectingSourceNode && connectingSourceNode !== node.name && onOpenAddRelationship) {
                  onOpenAddRelationship(connectingSourceNode, node.name);
                  setConnectingSourceNode(null);
                } else {
                  setSelectedNodeId(node.name);
                }
              }}
            >
              {/* Connector Ports on Top & Bottom for visual wiring */}
              <div
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-white cursor-crosshair shadow-sm hover:scale-125 transition-transform"
                title="Input Connector"
              />
              <div
                onClick={(e) => handleStartConnection(e, node.name)}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-white cursor-crosshair shadow-sm hover:scale-125 transition-transform"
                title="Click to link to another subsystem"
              />

              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-bold text-xs tracking-tight truncate max-w-[140px]" title={node.name}>
                      {node.name}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      isDarkMode ? "bg-zinc-800 text-zinc-300 border border-zinc-700" : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {(comp.criticality * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] mt-1 text-zinc-400">
                  <span className="font-mono uppercase tracking-wider">({comp.component_type || "Component"})</span>
                  <span className="text-[10px] text-primary font-medium">{comp.metrics?.length || 0} metrics</span>
                </div>
              </div>

              {/* Quick Actions Ribbon on Node */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10 text-[10px]">
                <div className="flex items-center gap-1">
                  {onEditSubsystem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSubsystem(comp, node.index);
                      }}
                      className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] flex items-center gap-1"
                      title="Edit Subsystem"
                    >
                      <Edit2 className="w-2.5 h-2.5" /> Edit
                    </button>
                  )}
                  {onAddMetric && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddMetric(node.index);
                      }}
                      className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] flex items-center gap-1"
                      title="Add Metric Bound"
                    >
                      <Plus className="w-2.5 h-2.5" /> Metric
                    </button>
                  )}
                </div>

                {onOpenAddRelationship && (
                  <button
                    onClick={(e) => handleStartConnection(e, node.name)}
                    className="px-1.5 py-0.5 rounded bg-primary/20 hover:bg-primary/40 text-primary-foreground font-semibold text-[10px] flex items-center gap-1"
                    title="Link to another subsystem"
                  >
                    <ArrowRight className="w-2.5 h-2.5" /> Link
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State Banner if No Subsystems Registered */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md max-w-sm space-y-3">
            <Compass className="w-10 h-10 text-primary mx-auto opacity-80" />
            <h4 className="text-sm font-bold text-white">No Subsystems Registered</h4>
            <p className="text-xs text-zinc-400">
              Add hardware subsystems (such as solar panel, battery, PM sensors, modems) to view and connect the topology.
            </p>
            {onOpenAddSubsystem && (
              <Button size="sm" onClick={onOpenAddSubsystem} className="bg-primary text-white text-xs gap-1 font-semibold">
                <Plus className="w-3.5 h-3.5" /> Add Subsystem
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Hint Indicator */}
      <div className="absolute bottom-2.5 left-3 z-20 pointer-events-none text-[10px] text-white/50 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded border border-white/5 font-mono">
        Drag nodes to position · Scroll to zoom · Click edge badge to edit/delete
      </div>
    </div>
  );
}
