import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Scene3D from './components/Scene3D';
import { GraphItem, ViewSettings, CoordSystem, COLORS } from './types';

const App: React.FC = () => {
  // Initial example state
  const [items, setItems] = useState<GraphItem[]>([
    {
      id: 'init_1',
      type: CoordSystem.CARTESIAN,
      expression: 'sin(sqrt(x^2 + y^2)) + 0.5 * cos(y)',
      visible: true,
      color: COLORS[0],
    },
    {
      id: 'init_3',
      type: CoordSystem.CYLINDRICAL,
      expression: '0.5 * r * cos(3 * θ)',
      visible: true,
      color: COLORS[2],
    }
  ]);

  const [settings, setSettings] = useState<ViewSettings>({
    grid: true,
    axes: true,
    autoRotate: false,
    wireframe: false,
  });

  const handleGraphError = (id: string, error: string | null) => {
    setItems(prev => prev.map(item => {
      if (item.id === id && item.error !== error) {
        return { ...item, error: error || undefined };
      }
      return item;
    }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar 
        items={items} 
        setItems={setItems} 
        settings={settings}
        setSettings={setSettings}
      />
      <main className="flex-1 relative">
        <Scene3D 
          items={items} 
          settings={settings} 
          onError={handleGraphError}
        />
      </main>
    </div>
  );
};

export default App;