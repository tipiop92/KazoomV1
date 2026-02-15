import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

interface WheelPickerProps {
  options: Array<{ value: string | number; label: string }>;
  value: string | number;
  onChange: (value: string | number) => void;
  height?: number;
  itemHeight?: number;
}

export function WheelPicker({ 
  options, 
  value, 
  onChange, 
  height = 200, 
  itemHeight = 40
}: WheelPickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trouver l'index actuel
  const currentIndex = options.findIndex(opt => opt.value === value);

  useEffect(() => {
    // Centrer sur l'élément sélectionné
    const targetY = -currentIndex * itemHeight;
    animate(y, targetY, {
      type: "spring",
      stiffness: 300,
      damping: 30
    });
  }, [currentIndex, itemHeight, y]);

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    const offset = info.offset.y;
    const velocity = info.velocity.y;
    
    // Calculer l'index le plus proche
    let targetIndex = Math.round(-y.get() / itemHeight);
    
    // Ajouter la vélocité pour un effet plus naturel
    if (Math.abs(velocity) > 500) {
      targetIndex += Math.round(velocity / 500);
    }
    
    // Limiter aux bornes
    targetIndex = Math.max(0, Math.min(options.length - 1, targetIndex));
    
    const targetY = -targetIndex * itemHeight;
    
    animate(y, targetY, {
      type: "spring",
      stiffness: 300,
      damping: 30
    });
    
    if (options[targetIndex]) {
      onChange(options[targetIndex].value);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: `${height}px` }}
    >
      {/* Indicateur de sélection style iOS avec touche mauve */}
      <div 
        className="absolute left-0 right-0 border-y border-purple-500/30 bg-gradient-to-r from-purple-900/20 via-purple-800/10 to-purple-900/20 pointer-events-none z-10"
        style={{ 
          top: `${(height - itemHeight) / 2}px`,
          height: `${itemHeight}px`
        }}
      />
      
      {/* Gradient supérieur */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-900 via-gray-900/80 to-transparent pointer-events-none z-20" />
      
      {/* Gradient inférieur */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pointer-events-none z-20" />

      <motion.div
        drag="y"
        dragConstraints={{ top: -(options.length - 1) * itemHeight, bottom: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ 
          y,
          paddingTop: `${(height - itemHeight) / 2}px`,
          paddingBottom: `${(height - itemHeight) / 2}px`
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        {options.map((option, index) => {
          const distance = Math.abs(index - currentIndex);
          const opacity = Math.max(0.25, 1 - distance * 0.3);
          const scale = Math.max(0.85, 1 - distance * 0.08);
          const isSelected = index === currentIndex;
          
          return (
            <motion.div
              key={option.value}
              className="flex items-center justify-center select-none"
              style={{ 
                height: `${itemHeight}px`,
                opacity,
                scale
              }}
              onClick={() => {
                onChange(option.value);
                const targetY = -index * itemHeight;
                animate(y, targetY, {
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                });
              }}
            >
              <span className={`text-base font-medium transition-colors ${
                isSelected ? 'text-purple-200' : 'text-gray-500'
              }`}>
                {option.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}