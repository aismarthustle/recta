import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Text, Line } from "@react-three/drei";
import { CutPlan, CutPlacement } from "@/types";
import * as THREE from "three";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CuttingDiagram3DProps {
  currentPlan: CutPlan;
  sheetCount: number;
}

interface PanelMeshProps {
  placement: CutPlacement;
  sheetHeight: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const DimensionLine = ({
  start,
  end,
  label,
  offset = 0.05,
  textAnchor = "bottom"
}: {
  start: [number, number, number];
  end: [number, number, number];
  label: string;
  offset?: number;
  textAnchor?: "top" | "bottom" | "middle";
}) => {
  // Calculate direction vector
  const dir = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]).normalize();
  // Calculate perpendicular vector (assuming Y is up)
  const up = new THREE.Vector3(0, 1, 0);
  const perp = new THREE.Vector3().crossVectors(dir, up).normalize();

  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;
  const midZ = (start[2] + end[2]) / 2;

  return (
    <group>
      {/* Main Line */}
      <Line points={[start, end]} color="black" lineWidth={1} />

      {/* Label */}
      <Text
        position={[midX, midY + 0.02, midZ]}
        rotation={[-Math.PI / 2, 0, Math.atan2(end[2] - start[2], end[0] - start[0])]} // Rotate to align with line
        fontSize={0.06} // Reduced font size
        color="black"
        anchorX="center"
        anchorY={textAnchor}
        outlineWidth={0.005}
        outlineColor="white"
      >
        {label}
      </Text>
    </group>
  );
};

const PanelMesh = ({ placement, sheetHeight, isSelected, onSelect }: PanelMeshProps) => {
  const { x, y, width, length, color, rotation, panelId } = placement;

  // Calculate actual 3D dimensions based on rotation
  const dimX = rotation ? width : length;
  const dimZ = rotation ? length : width;

  // Position calculation
  const position: [number, number, number] = [
    x + dimX / 2,
    sheetHeight / 2,
    y + dimZ / 2
  ];

  // Display dimensions
  // Length (X axis)
  const lengthLabel = rotation ? width : length;
  // Width (Z axis)
  const widthLabel = rotation ? length : width;

  return (
    <group position={position}>
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(panelId);
        }}
      >
        <boxGeometry args={[dimX - 0.002, sheetHeight, dimZ - 0.002]} />
        <meshStandardMaterial
          color={isSelected ? "#ff9900" : color}
          roughness={0.3}
          metalness={0.1}
          emissive={isSelected ? "#ff9900" : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {isSelected && (
        <group position={[0, sheetHeight / 2 + 0.01, 0]}>
          {/* Length Dimension Line (along X, offset in Z) */}
          <DimensionLine
            start={[-dimX / 2, 0, dimZ / 2 + 0.05]}
            end={[dimX / 2, 0, dimZ / 2 + 0.05]}
            label={`${lengthLabel.toFixed(3)} m`}
            textAnchor="top"
          />

          {/* Width Dimension Line (along Z, offset in X) */}
          <DimensionLine
            start={[-dimX / 2 - 0.05, 0, -dimZ / 2]}
            end={[-dimX / 2 - 0.05, 0, dimZ / 2]}
            label={`${widthLabel.toFixed(3)} m`}
          />
        </group>
      )}
    </group>
  );
};

const StockSheetMesh = ({ width, length }: { width: number; length: number }) => {
  // width corresponds to Stock Sheet Width (3D Z)
  // length corresponds to Stock Sheet Length (3D X)
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[length / 2, 0, width / 2]}
      receiveShadow
    >
      <planeGeometry args={[length, width]} />
      <meshStandardMaterial color="#e5e7eb" roughness={0.8} metalness={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
};

const CuttingDiagram3D = ({ currentPlan, sheetCount }: CuttingDiagram3DProps) => {
  const { stockSheetDimensions, placements } = currentPlan;
  const { width: sheetWidth, length: sheetLength } = stockSheetDimensions;
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if user has access to 3D feature
  const hasAccess = user?.role === 'admin' || user?.plan === 'pro' || user?.plan === 'enterprise';

  // Center the camera target
  // X is length, Z is width
  const target: [number, number, number] = [sheetLength / 2, 0, sheetWidth / 2];

  // Adjust camera position based on sheet size
  const cameraPosition: [number, number, number] = [
    sheetLength * 0.5,
    Math.max(sheetWidth, sheetLength) * 1.2,
    sheetWidth * 0.5 + Math.max(sheetWidth, sheetLength)
  ];

  return (
    <div className="w-full h-[500px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200 relative group">
      <Canvas shadows onPointerMissed={() => setSelectedPanelId(null)} className={!hasAccess ? "blur-md" : ""}>
        <PerspectiveCamera makeDefault position={cameraPosition} fov={45} />
        <OrbitControls target={target} minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} enabled={hasAccess} />

        <ambientLight intensity={0.7} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Environment preset="city" />

        <group>
          {/* Base Sheet (Waste/Background) */}
          <StockSheetMesh width={sheetWidth} length={sheetLength} />

          {/* Panels */}
          {placements.map((placement, index) => (
            <PanelMesh
              key={`${placement.panelId}-${index}`}
              placement={placement}
              sheetHeight={0.018} // Standard 18mm thickness visual
              isSelected={selectedPanelId === placement.panelId}
              onSelect={hasAccess ? setSelectedPanelId : () => { }}
            />
          ))}
        </group>

        <ContactShadows position={[sheetLength / 2, -0.01, sheetWidth / 2]} opacity={0.4} scale={Math.max(sheetWidth, sheetLength) * 2} blur={2} far={1} />
        <gridHelper args={[Math.max(sheetWidth, sheetLength) * 3, 30, 0xdddddd, 0xeeeeee]} position={[sheetLength / 2, -0.02, sheetWidth / 2]} />
      </Canvas>

      {!hasAccess && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px]">
          <div className="bg-background/90 p-8 rounded-xl shadow-2xl text-center max-w-sm border border-primary/20">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-6">
              3D Visualization is available on Pro and Enterprise plans. Upgrade to visualize your cuts in 3D.
            </p>
            <Link to="/pricing">
              <Button>Upgrade to Pro</Button>
            </Link>
          </div>
        </div>
      )}

      {hasAccess && (
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded text-xs font-medium shadow-sm pointer-events-none select-none">
          Vue 3D • {sheetCount} plaque{sheetCount > 1 ? 's' : ''}
          {selectedPanelId && <span className="ml-2 text-industrial-steel">• Sélection active</span>}
        </div>
      )}
    </div>
  );
};

export default CuttingDiagram3D;
