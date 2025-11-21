import React, { useRef } from 'react';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { GraphItem, CoordSystem } from '../types';

interface InputRowProps {
  item: GraphItem;
  onUpdate: (id: string, changes: Partial<GraphItem>) => void;
  onRemove: (id: string) => void;
}

const InputRow: React.FC<InputRowProps> = ({ item, onUpdate, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Auto-replace 'theta' -> 'θ', 'phi' -> 'φ', 'pi' -> 'π'
    const newValue = value
        .replace(/theta/gi, 'θ')
        .replace(/phi/gi, 'φ')
        .replace(/\bpi\b/gi, 'π');
    
    onUpdate(item.id, { expression: newValue });
  };

  const getPlaceholder = (type: CoordSystem) => {
    switch (type) {
      case CoordSystem.CARTESIAN: return "x^2 + y^2";
      case CoordSystem.SPHERICAL: return "sin(θ) * cos(φ)";
      case CoordSystem.CYLINDRICAL: return "r * cos(θ)";
      default: return "";
    }
  };

  const getVariableHelp = (type: CoordSystem) => {
    switch (type) {
      case CoordSystem.CARTESIAN: return "Vars: x, y";
      case CoordSystem.SPHERICAL: return "Vars: θ (polar), φ (azimuth)";
      case CoordSystem.CYLINDRICAL: return "Vars: r, θ";
      default: return "";
    }
  };

  const getLabel = (type: CoordSystem) => {
      switch (type) {
          case CoordSystem.CARTESIAN: return "z =";
          case CoordSystem.SPHERICAL: return "r =";
          case CoordSystem.CYLINDRICAL: return "z =";
      }
  }

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm mb-3 overflow-hidden transition-all hover:shadow-md">
      <div className="flex items-center p-2 bg-slate-50 border-b border-slate-100 gap-2">
        {/* Color Indicator / Visibility Toggle */}
        <button 
            onClick={() => onUpdate(item.id, { visible: !item.visible })}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{ backgroundColor: item.visible ? item.color : '#e2e8f0' }}
            title="Toggle Visibility"
        >
            {!item.visible && <EyeOff size={14} className="text-slate-500" />}
            {item.visible && <Eye size={14} className="text-white opacity-0 hover:opacity-100" />}
        </button>

        {/* Type Selector */}
        <select 
          value={item.type}
          onChange={(e) => onUpdate(item.id, { type: e.target.value as CoordSystem })}
          className="text-xs font-medium bg-transparent text-slate-600 border-none focus:ring-0 cursor-pointer hover:text-slate-900 max-w-[120px]"
        >
          <option value={CoordSystem.CARTESIAN}>Cartesian (z)</option>
          <option value={CoordSystem.SPHERICAL}>Spherical (r)</option>
          <option value={CoordSystem.CYLINDRICAL}>Cylindrical (z)</option>
        </select>

        <div className="flex-1"></div>

        {/* Delete Button */}
        <button 
          onClick={() => onRemove(item.id)}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Equation Input */}
      <div className="p-3 relative">
        <div className="flex items-center text-lg font-mono text-slate-700">
           <span className="mr-2 text-slate-400 select-none italic min-w-[30px] text-right">
             {getLabel(item.type)}
           </span>
           <input 
             ref={inputRef}
             type="text" 
             value={item.expression}
             onChange={handleExpressionChange}
             placeholder={getPlaceholder(item.type)}
             className="flex-1 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-300"
           />
        </div>
        
        {/* Error Message */}
        {item.error && (
          <div className="absolute top-full left-0 w-full bg-red-50 text-red-600 text-xs px-3 py-1 flex items-center border-t border-red-100 z-10">
            <AlertCircle size={12} className="mr-1" />
            {item.error}
          </div>
        )}
      </div>
      
      {/* Helper text for variables */}
      <div className="px-3 pb-2 text-[10px] text-slate-400 flex justify-between">
        <span>
            {getVariableHelp(item.type)}
        </span>
        <span className="opacity-50">
            Supports |x|, sin^2(x)
        </span>
      </div>
    </div>
  );
};

export default InputRow;