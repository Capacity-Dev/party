import { useState, useRef, useEffect, useCallback } from 'react';
import { EventConfig } from '../lib/db';
import { getFormatById } from '../types/formats';

interface UnifiedInviteEditorProps {
  config: EventConfig | null;
  onQrZoneChange: (zone: { x: number; y: number; width: number; height: number }) => void;
  onTextPositionChange: (fieldX: keyof EventConfig, fieldY: keyof EventConfig, x: number, y: number) => void;
}

export const UnifiedInviteEditor = ({
  config,
  onQrZoneChange,
  onTextPositionChange,
}: UnifiedInviteEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const format = config ? getFormatById(config.format_id) : null;
  const INVITE_CARD_WIDTH = config?.format_id === 'custom' 
    ? (config.custom_width || format?.width || 1050) 
    : (format?.width || 1050);
  const INVITE_CARD_HEIGHT = config?.format_id === 'custom' 
    ? (config.custom_height || format?.height || 500) 
    : (format?.height || 500);

  const [qrZone, setQrZone] = useState({
    x: config?.qr_zone_x || 700,
    y: config?.qr_zone_y || 150,
    width: config?.qr_zone_width || 150,
    height: config?.qr_zone_height || 150,
  });

  const [guestNamePos, setGuestNamePos] = useState({
    x: config?.guest_name_x || 50,
    y: config?.guest_name_y || 50,
  });

  const [tableNamePos, setTableNamePos] = useState({
    x: config?.table_name_x || 50,
    y: config?.table_name_y || 100,
  });

  const [isDraggingQr, setIsDraggingQr] = useState(false);
  const [isResizingQr, setIsResizingQr] = useState(false);
  const [isDraggingGuestName, setIsDraggingGuestName] = useState(false);
  const [isDraggingTableName, setIsDraggingTableName] = useState(false);

  const [dragStartMousePos, setDragStartMousePos] = useState({ x: 0, y: 0 });
  const [dragStartElementPos, setDragStartElementPos] = useState({
    x: 0, y: 0, width: 0, height: 0,
  });
  const [activeElement, setActiveElement] = useState<'qr' | 'guestName' | 'tableName' | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // Scale initial positions to fit the editor's display size
  useEffect(() => {
    if (config && imgRef.current) {
      const imgWidth = imgRef.current.offsetWidth;
      const imgHeight = imgRef.current.offsetHeight;

      const scaleX = imgWidth / INVITE_CARD_WIDTH;
      const scaleY = imgHeight / INVITE_CARD_HEIGHT;

      setQrZone({
        x: config.qr_zone_x * scaleX,
        y: config.qr_zone_y * scaleY,
        width: config.qr_zone_width * scaleX,
        height: config.qr_zone_height * scaleY,
      });
      setGuestNamePos({
        x: config.guest_name_x * scaleX,
        y: config.guest_name_y * scaleY,
      });
      setTableNamePos({
        x: config.table_name_x * scaleX,
        y: config.table_name_y * scaleY,
      });
    }
  }, [config?.qr_zone_x, config?.qr_zone_y, config?.qr_zone_width, config?.qr_zone_height,
      config?.guest_name_x, config?.guest_name_y, config?.table_name_x, config?.table_name_y,
      config?.background_image_url, imgRef.current?.offsetWidth, imgRef.current?.offsetHeight]);

  const handleSave = useCallback(() => {
    if (!config || !imgRef.current) return;

    const imgWidth = imgRef.current.offsetWidth;
    const imgHeight = imgRef.current.offsetHeight;

    const scaleX = INVITE_CARD_WIDTH / imgWidth;
    const scaleY = INVITE_CARD_HEIGHT / imgHeight;

    if (activeElement === 'qr') {
      onQrZoneChange({
        x: qrZone.x * scaleX,
        y: qrZone.y * scaleY,
        width: qrZone.width * scaleX,
        height: qrZone.height * scaleY,
      });
    } else if (activeElement === 'guestName') {
      onTextPositionChange('guest_name_x', 'guest_name_y', guestNamePos.x * scaleX, guestNamePos.y * scaleY);
    } else if (activeElement === 'tableName') {
      onTextPositionChange('table_name_x', 'table_name_y', tableNamePos.x * scaleX, tableNamePos.y * scaleY);
    }
  }, [config, qrZone, guestNamePos, tableNamePos, activeElement, onQrZoneChange, onTextPositionChange, imgRef.current?.offsetWidth, imgRef.current?.offsetHeight]);

  const handleMouseDown = (e: React.MouseEvent, element: 'qr' | 'guestName' | 'tableName', handle?: string) => {
    e.stopPropagation();
    setDragStartMousePos({ x: e.clientX, y: e.clientY });
    setActiveElement(element);

    if (element === 'qr') {
      setDragStartElementPos({ ...qrZone });
      if (handle) {
        setResizeHandle(handle);
        setIsResizingQr(true);
      } else {
        setIsDraggingQr(true);
      }
    } else if (element === 'guestName') {
      setDragStartElementPos({ x: guestNamePos.x, y: guestNamePos.y, width: 0, height: 0 });
      setIsDraggingGuestName(true);
    } else if (element === 'tableName') {
      setDragStartElementPos({ x: tableNamePos.x, y: tableNamePos.y, width: 0, height: 0 });
      setIsDraggingTableName(true);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imgRef.current || (!isDraggingQr && !isResizingQr && !isDraggingGuestName && !isDraggingTableName)) return;

    const imgRect = imgRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartMousePos.x;
    const deltaY = e.clientY - dragStartMousePos.y;

    if (activeElement === 'qr') {
      setQrZone(_prev => {
        let newZone = { ...dragStartElementPos };

        if (isDraggingQr) {
          newZone.x = Math.max(0, Math.min(dragStartElementPos.x + deltaX, imgRect.width - dragStartElementPos.width));
          newZone.y = Math.max(0, Math.min(dragStartElementPos.y + deltaY, imgRect.height - dragStartElementPos.height));
        } else if (isResizingQr && resizeHandle) {
          if (resizeHandle.includes('nw')) {
            newZone.x = dragStartElementPos.x + deltaX;
            newZone.y = dragStartElementPos.y + deltaY;
            newZone.width = dragStartElementPos.width - deltaX;
            newZone.height = dragStartElementPos.height - deltaY;
          } else if (resizeHandle.includes('ne')) {
            newZone.y = dragStartElementPos.y + deltaY;
            newZone.width = dragStartElementPos.width + deltaX;
            newZone.height = dragStartElementPos.height - deltaY;
          } else if (resizeHandle.includes('sw')) {
            newZone.x = dragStartElementPos.x + deltaX;
            newZone.width = dragStartElementPos.width - deltaX;
            newZone.height = dragStartElementPos.height + deltaY;
          } else if (resizeHandle.includes('se')) {
            newZone.width = dragStartElementPos.width + deltaX;
            newZone.height = dragStartElementPos.height + deltaY;
          }

          newZone.width = Math.max(50, newZone.width);
          newZone.height = Math.max(50, newZone.height);
          newZone.x = Math.max(0, newZone.x);
          newZone.y = Math.max(0, newZone.y);

          newZone.width = Math.min(newZone.width, imgRect.width - newZone.x);
          newZone.height = Math.min(newZone.height, imgRect.height - newZone.y);
        }
        return newZone;
      });
    } else if (activeElement === 'guestName') {
      setGuestNamePos(prev => {
        const textElement = document.getElementById('guest-name-example');
        if (!textElement) return prev;
        const textRect = textElement.getBoundingClientRect();

        let newX = dragStartElementPos.x + deltaX;
        let newY = dragStartElementPos.y + deltaY;

        newX = Math.max(0, Math.min(newX, imgRect.width - textRect.width));
        newY = Math.max(0, Math.min(newY, imgRect.height - textRect.height));
        return { x: newX, y: newY };
      });
    } else if (activeElement === 'tableName') {
      setTableNamePos(prev => {
        const textElement = document.getElementById('table-name-example');
        if (!textElement) return prev;
        const textRect = textElement.getBoundingClientRect();

        let newX = dragStartElementPos.x + deltaX;
        let newY = dragStartElementPos.y + deltaY;

        newX = Math.max(0, Math.min(newX, imgRect.width - textRect.width));
        newY = Math.max(0, Math.min(newY, imgRect.height - textRect.height));
        return { x: newX, y: newY };
      });
    }
  }, [isDraggingQr, isResizingQr, isDraggingGuestName, isDraggingTableName, dragStartMousePos, dragStartElementPos, activeElement]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingQr || isResizingQr || isDraggingGuestName || isDraggingTableName) {
      setIsDraggingQr(false);
      setIsResizingQr(false);
      setIsDraggingGuestName(false);
      setIsDraggingTableName(false);
      setResizeHandle(null);
      setActiveElement(null);
      handleSave();
    }
  }, [isDraggingQr, isResizingQr, isDraggingGuestName, isDraggingTableName, handleSave]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full bg-gray-100 rounded overflow-hidden border-2 border-gray-300"
        style={{
          aspectRatio: `${INVITE_CARD_WIDTH} / ${INVITE_CARD_HEIGHT}`,
          maxWidth: '600px',
          maxHeight: '400px'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
      {config?.background_image_url ? (
        <img ref={imgRef} src={config.background_image_url} alt="Arrière-plan" className="w-full h-full object-cover" />
      ) : (
        <div ref={imgRef} className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">Aucune image d'arrière-plan</div>
      )}

      {/* QR Code Zone */}
      <div
        className="absolute border-4 border-blue-500 bg-blue-200 bg-opacity-20 cursor-move"
        style={{
          left: `${qrZone.x}px`,
          top: `${qrZone.y}px`,
          width: `${qrZone.width}px`,
          height: `${qrZone.height}px`,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'qr')}
      >
        {['nw', 'ne', 'sw', 'se'].map(handle => (
          <div
            key={handle}
            className={`absolute w-3 h-3 bg-blue-500 rounded-full cursor-${handle}-resize`}
            style={{
              [handle.includes('n') ? 'top' : 'bottom']: '-6px',
              [handle.includes('w') ? 'left' : 'right']: '-6px',
            }}
            onMouseDown={(e) => handleMouseDown(e, 'qr', handle)}
          />
        ))}
      </div>

      {/* Guest Name Example */}
      <div
        id="guest-name-example"
        className="absolute cursor-grab font-bold text-lg p-2 rounded-md shadow-sm"
        style={{
          left: `${guestNamePos.x}px`,
          top: `${guestNamePos.y}px`,
          color: config?.guest_name_color || '#FFFFFF',
          backgroundColor: 'rgba(255,255,255,0.7)',
          zIndex: 10,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'guestName')}
      >
        Exemple de nom d'invité
      </div>

      {/* Table Name Example */}
      <div
        id="table-name-example"
        className="absolute cursor-grab font-bold text-lg p-2 rounded-md shadow-sm"
        style={{
          left: `${tableNamePos.x}px`,
          top: `${tableNamePos.y}px`,
          color: config?.table_name_color || '#FFFFFF',
          backgroundColor: 'rgba(255,255,255,0.7)',
          zIndex: 10,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'tableName')}
      >
        Exemple de nom de table
      </div>
      </div>
      
      <div className="text-sm text-gray-600">
        Format: {format?.name} ({INVITE_CARD_WIDTH} × {INVITE_CARD_HEIGHT}px)
        {format?.printWidth && ` - ${format.printWidth} × ${format.printHeight}`}
      </div>
    </div>
  );
};
