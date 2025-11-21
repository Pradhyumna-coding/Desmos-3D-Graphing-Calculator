import React, { useState } from 'react';
import { Plus, Sparkles, Settings, Loader2, Calculator } from 'lucide-react';
import { GraphItem, CoordSystem, ViewSettings, COLORS } from '../types';
import InputRow from './InputRow';
import { generateEquation } from '../services/geminiService';

interface SidebarProps {
  items: GraphItem[];
  setItems: React.Dispatch<React.SetStateAction<GraphItem[]>>;
  settings: ViewSettings;
  setSettings: React.Dispatch<React.SetStateAction<ViewSettings>>;
}

const Sidebar: React.FC<SidebarProps> = ({ items, setItems, settings, setSettings }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  const addGraph = (itemProps?: Partial<GraphItem>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const nextColor = COLORS[items.length % COLORS.length];
    const newItem: GraphItem = {
      id: newId,
      type: CoordSystem.CARTESIAN,
      expression: '',
      visible: true,
      color: nextColor,
      ...itemProps
    };
    setItems([...items, newItem]);
  };

  const updateGraph = (id: string, changes: Partial<GraphItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...changes } : item));
  };

  const removeGraph = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    
    const result = await generateEquation(aiPrompt);
    
    if (result) {
      addGraph({
        expression: result.expression,
        type: result.type,
      });
      setAiPrompt('');
      setShowAiInput(false);
    } else {
      alert("Couldn't generate an equation. Try a different description.");
    }
    
    setIsGenerating(false);
  };

  return (
    <div className="w-96 h-full bg-white border-r border-slate-200 flex flex-col z-10 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2 mb-1">
           <Calculator className="text-blue-600" size={24} />
           <h1 className="text-xl font-bold text-slate-800 tracking-tight">3D Grapher</h1>
        </div>
        <p className="text-xs text-slate-500">Cartesian & Spherical Plotting</p>
      </div>

      {/* List of Inputs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
        {items.map(item => (
          <InputRow 
            key={item.id} 
            item={item} 
            onUpdate={updateGraph} 
            onRemove={removeGraph} 
          />
        ))}
        
        {/* Empty State */}
        {items.length === 0 && (
            <div className="text-center py-10 text-slate-400">
                <p>No graphs yet.</p>
                <p className="text-sm">Click + or ask AI to start.</p>
            </div>
        )}
      </div>

      {/* AI Input Panel */}
      {showAiInput && (
        <div className="p-4 bg-blue-50 border-t border-blue-100">
          <h3 className="text-xs font-bold text-blue-700 uppercase mb-2 flex items-center gap-1">
            <Sparkles size={12} /> Gemini Math AI
          </h3>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. 'A ripple effect' or 'A sphere with radius 5'"
            className="w-full text-sm p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none h-20 mb-2"
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAiGenerate();
                }
            }}
          />
          <div className="flex justify-end gap-2">
            <button 
                onClick={() => setShowAiInput(false)}
                className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
                Cancel
            </button>
            <button 
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
            >
                {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Generate
            </button>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-200 bg-white flex flex-col gap-3">
        
        {/* Main Actions */}
        <div className="flex gap-2">
            <button 
                onClick={() => addGraph()}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
            >
                <Plus size={18} />
                <span className="text-sm">Add Expression</span>
            </button>
            <button 
                onClick={() => setShowAiInput(!showAiInput)}
                className={`px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2 transition-colors ${showAiInput ? 'bg-blue-100 text-blue-700' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg'}`}
            >
                <Sparkles size={18} />
            </button>
        </div>

        {/* View Settings Toggles */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                <input 
                    type="checkbox" 
                    checked={settings.grid} 
                    onChange={e => setSettings(s => ({...s, grid: e.target.checked}))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Show Grid
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                <input 
                    type="checkbox" 
                    checked={settings.axes} 
                    onChange={e => setSettings(s => ({...s, axes: e.target.checked}))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Show Axes
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                <input 
                    type="checkbox" 
                    checked={settings.wireframe} 
                    onChange={e => setSettings(s => ({...s, wireframe: e.target.checked}))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Wireframe
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                <input 
                    type="checkbox" 
                    checked={settings.autoRotate} 
                    onChange={e => setSettings(s => ({...s, autoRotate: e.target.checked}))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Auto Rotate
            </label>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
