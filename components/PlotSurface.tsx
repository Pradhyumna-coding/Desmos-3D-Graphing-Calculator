import React, { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GraphItem } from '../types';
import { generateGeometry } from '../utils/mathUtils';

interface PlotSurfaceProps {
  item: GraphItem;
  wireframe: boolean;
  onError: (id: string, error: string | null) => void;
}

const PlotSurface: React.FC<PlotSurfaceProps> = ({ item, wireframe, onError }) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    try {
      const geo = generateGeometry(item.expression, item.type);
      setGeometry(geo);
      onError(item.id, null); // Clear error if successful
    } catch (e: any) {
      onError(item.id, e.message || "Invalid equation");
      setGeometry(null);
    }
  }, [item.expression, item.type, item.id]); // Re-run only if these change

  if (!geometry || !item.visible) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial 
        color={item.color} 
        side={THREE.DoubleSide} 
        wireframe={wireframe}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
};

export default PlotSurface;
