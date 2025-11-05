import { useState, useRef, useEffect, useCallback } from 'react';

interface QRZoneEditorProps {
  imageUrl: string | null;
  onZoneChange: (zone: { x: number; y: number; width: number; height: number }) => void;
  initialZone?: { x: number; y: number; width: number; height: number };
}

const INVITE_CARD_WIDTH = 1050;
const INVITE_CARD_HEIGHT = 500;

export const QRZoneEditor = ({ imageUrl, onZoneChange, initialZone }: QRZoneEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [zone, setZone] = useState(
    initialZone || { x: 50, y: 50, width: 150, height: 150 }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartMousePos, setDragStartMousePos] = useState({ x: 0, y: 0 });
  const [dragStartZone, setDragStartZone] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  useEffect(() => {
    if (initialZone && imgRef.current) {
      const imgWidth = imgRef.current.offsetWidth;
      const imgHeight = imgRef.current.offsetHeight;

      const scaleX = imgWidth / INVITE_CARD_WIDTH;
      const scaleY = imgHeight / INVITE_CARD_HEIGHT;

      setZone({
        x: initialZone.x * scaleX,
        y: initialZone.y * scaleY,
        width: initialZone.width * scaleX,
        height: initialZone.height * scaleY,
      });
    }
  }, [initialZone, imageUrl]);

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-gray-100 rounded border-2 border-dashed border-gray-300">
        <p className="text-gray-500">Upload an image first to edit the QR zone</p>
      </div>
    );
  }

  const handleSaveZone = useCallback(() => {
    if (imgRef.current) {
        const imgWidth = imgRef.current.offsetWidth;
        const imgHeight = imgRef.current.offsetHeight;

        const scaleX = INVITE_CARD_WIDTH / imgWidth;
        const scaleY = INVITE_CARD_HEIGHT / imgHeight;

        const scaledZone = {
            x: zone.x * scaleX,
            y: zone.y * scaleY,
            width: zone.width * scaleX,
            height: zone.height * scaleY,
        };
        onZoneChange(scaledZone);
    } else {
        onZoneChange(zone);
    }
  }, [zone, onZoneChange]);

  const handleMouseDown = (e: React.MouseEvent, handle?: string) => {
    e.stopPropagation();
    setDragStartMousePos({ x: e.clientX, y: e.clientY });
    setDragStartZone({ ...zone });

    if (handle) {
      setResizeHandle(handle);
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imgRef.current || (!isDragging && !isResizing)) return;

    const imgRect = imgRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartMousePos.x;
    const deltaY = e.clientY - dragStartMousePos.y;

    setZone(prev => {
      let newZone = { ...dragStartZone };

      if (isDragging) {
        newZone.x = Math.max(0, Math.min(dragStartZone.x + deltaX, imgRect.width - dragStartZone.width));
        newZone.y = Math.max(0, Math.min(dragStartZone.y + deltaY, imgRect.height - dragStartZone.height));
      } else if (isResizing && resizeHandle) {
        if (resizeHandle.includes('nw')) {
          newZone.x = dragStartZone.x + deltaX;
          newZone.y = dragStartZone.y + deltaY;
          newZone.width = dragStartZone.width - deltaX;
          newZone.height = dragStartZone.height - deltaY;
        } else if (resizeHandle.includes('ne')) {
          newZone.y = dragStartZone.y + deltaY;
          newZone.width = dragStartZone.width + deltaX;
          newZone.height = dragStartZone.height - deltaY;
        } else if (resizeHandle.includes('sw')) {
          newZone.x = dragStartZone.x + deltaX;
          newZone.width = dragStartZone.width - deltaX;
          newZone.height = dragStartZone.height + deltaY;
        } else if (resizeHandle.includes('se')) {
          newZone.width = dragStartZone.width + deltaX;
          newZone.height = dragStartZone.height + deltaY;
        }

        newZone.width = Math.max(50, newZone.width);
        newZone.height = Math.max(50, newZone.height);
        newZone.x = Math.max(0, newZone.x);
        newZone.y = Math.max(0, newZone.y);

        // Ensure zone stays within image bounds after resize
        newZone.width = Math.min(newZone.width, imgRect.width - newZone.x);
        newZone.height = Math.min(newZone.height, imgRect.height - newZone.y);
      }
      return newZone;
    });
  }, [isDragging, isResizing, dragStartMousePos, dragStartZone, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      handleSaveZone();
    }
  }, [isDragging, isResizing, handleSaveZone]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl h-96 bg-gray-100 rounded overflow-hidden border-2 border-gray-300"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img ref={imgRef} src={imageUrl} alt="Arrière-plan" className="w-full h-full object-cover" />

        <div
          className="absolute border-4 border-blue-500 bg-blue-200 bg-opacity-20 cursor-move"
          style={{
            left: `${zone.x}px`,
            top: `${zone.y}px`,
            width: `${zone.width}px`,
            height: `${zone.height}px`,
          }}
          onMouseDown={(e) => handleMouseDown(e)}
        >
          {[ 'nw', 'ne', 'sw', 'se'].map(handle => (
            <div
              key={handle}
              className={`absolute w-3 h-3 bg-blue-500 rounded-full cursor-${handle}-resize`}
              style={{
                [handle.includes('n') ? 'top' : 'bottom']: '-6px',
                [handle.includes('w') ? 'left' : 'right']: '-6px',
              }}
              onMouseDown={(e) => handleMouseDown(e, handle)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-sm">
        <div>
          <label className="block text-gray-600 mb-1">X:</label>
          <input
            type="number"
            value={Math.round(zone.x)}
            onChange={(e) => setZone({ ...zone, x: Math.max(0, parseInt(e.target.value) || 0) })}
            onBlur={handleSaveZone}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Y:</label>
          <input
            type="number"
            value={Math.round(zone.y)}
            onChange={(e) => setZone({ ...zone, y: Math.max(0, parseInt(e.target.value) || 0) })}
            onBlur={handleSaveZone}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Largeur:</label>
          <input
            type="number"
            value={Math.round(zone.width)}
            onChange={(e) => setZone({ ...zone, width: Math.max(50, parseInt(e.target.value) || 50) })}
            onBlur={handleSaveZone}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Hauteur:</label>
          <input
            type="number"
            value={Math.round(zone.height)}
            onChange={(e) => setZone({ ...zone, height: Math.max(50, parseInt(e.target.value) || 50) })}
            onBlur={handleSaveZone}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
      </div>
    </div>
  );
};
