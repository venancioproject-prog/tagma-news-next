import React from 'react';

interface AdSlotProps {
  format?: 'leaderboard' | 'medium-rectangle' | 'in-feed';
  className?: string;
}

export default function AdSlot({ format = 'leaderboard', className = '' }: AdSlotProps) {
  if (format === 'leaderboard') {
    return (
      <aside 
        aria-label="Espaço Publicitário"
        className={`w-full flex flex-col items-center justify-center my-6 ${className}`}
      >
        <div className="w-full max-w-[728px] h-[90px] bg-stone-100/90 border border-dashed border-stone-300 rounded flex flex-col items-center justify-center text-center px-4 relative overflow-hidden group hover:border-stone-400 transition-colors">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400 mb-0.5">
            Publicidade
          </span>
          <span className="text-xs font-sans text-stone-500 font-medium">
            Espaço Publicitário • 728x90 Super Banner
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </aside>
    );
  }

  if (format === 'medium-rectangle') {
    return (
      <aside 
        aria-label="Espaço Publicitário"
        className={`flex flex-col items-center justify-center my-4 ${className}`}
      >
        <div className="w-full max-w-[300px] h-[250px] bg-stone-100/90 border border-dashed border-stone-300 rounded flex flex-col items-center justify-center text-center p-4 relative overflow-hidden group hover:border-stone-400 transition-colors mx-auto">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400 mb-1">
            Publicidade
          </span>
          <span className="text-xs font-sans text-stone-500 font-medium">
            Espaço Publicitário • 300x250
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </aside>
    );
  }

  return (
    <aside 
      aria-label="Espaço Publicitário"
      className={`w-full py-4 my-8 bg-stone-100 border-y border-dashed border-stone-300 flex flex-col items-center justify-center text-center ${className}`}
    >
      <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400 mb-1">
        Publicidade Institucional
      </span>
      <span className="text-xs font-sans text-stone-500 font-medium">
        Espaço Publicitário Integrado • Banner Horizontal
      </span>
    </aside>
  );
}
