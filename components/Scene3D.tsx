import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, PerspectiveCamera, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { GraphItem, ViewSettings } from '../types';
import PlotSurface from './PlotSurface';
import * as THREE from 'three';

interface Scene3DProps {
  items: GraphItem[];
  settings: ViewSettings;
  onError: (id: string, error: string | null) => void;
}

const Scene3D: React.FC<Scene3DProps> = ({ items, settings, onError }) => {
  return (
    <div className="w-full h-full bg-slate-50 relative">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[15, 10, 15]} fov={50} />
        
        <OrbitControls 
          autoRotate={settings.autoRotate} 
          autoRotateSpeed={1.0} 
          makeDefault 
        />

        <ambientLight intensity={0.6} />
        <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Grid and Axes */}
        {settings.grid && (
          <Grid 
            position={[0, -0.01, 0]} 
            args={[30, 30]} 
            cellColor="#cbd5e1" 
            sectionColor="#94a3b8" 
            fadeDistance={40}
            fadeStrength={1.5}
          />
        )}
        
        {settings.axes && (
           <axesHelper args={[50]} /> // Long axes
        )}

        {/* Graph Plots */}
        {items.map((item) => (
          <PlotSurface 
            key={item.id} 
            item={item} 
            wireframe={settings.wireframe}
            onError={onError}
          />
        ))}

        <Environment preset="city" />
        
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="black" />
        </GizmoHelper>

      </Canvas>

      {/* Overlay for simple legend or info if needed, though Sidebar handles most */}
      <div className="absolute bottom-4 right-4 pointer-events-none text-xs text-slate-400">
        {settings.autoRotate ? 'Auto-rotating...' : ''}
      </div>
    </div>
  );
};

export default Scene3D;
