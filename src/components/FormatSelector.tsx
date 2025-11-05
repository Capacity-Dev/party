import { EventConfig } from '../lib/db';
import { INVITE_FORMATS, getFormatById } from '../types/formats';

interface FormatSelectorProps {
  config: EventConfig;
  onConfigChange: (config: EventConfig) => void;
}

export const FormatSelector = ({ config, onConfigChange }: FormatSelectorProps) => {
  const currentFormat = getFormatById(config.format_id);

  const handleFormatChange = (formatId: string) => {
    const format = getFormatById(formatId);
    onConfigChange({
      ...config,
      format_id: formatId,
      custom_width: formatId === 'custom' ? (config.custom_width || format.width) : undefined,
      custom_height: formatId === 'custom' ? (config.custom_height || format.height) : undefined,
    });
  };

  const handleCustomSizeChange = (dimension: 'width' | 'height', value: number) => {
    onConfigChange({
      ...config,
      [dimension === 'width' ? 'custom_width' : 'custom_height']: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Invite Format</label>
        <select
          value={config.format_id}
          onChange={(e) => handleFormatChange(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          {INVITE_FORMATS.map((format) => (
            <option key={format.id} value={format.id}>
              {format.name} {format.printWidth && `(${format.printWidth} × ${format.printHeight})`}
            </option>
          ))}
        </select>
      </div>

      {config.format_id === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Width (px)</label>
            <input
              type="number"
              value={config.custom_width || currentFormat.width}
              onChange={(e) => handleCustomSizeChange('width', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Height (px)</label>
            <input
              type="number"
              value={config.custom_height || currentFormat.height}
              onChange={(e) => handleCustomSizeChange('height', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="100"
            />
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        Current size: {config.format_id === 'custom' 
          ? `${config.custom_width || currentFormat.width} × ${config.custom_height || currentFormat.height}px`
          : `${currentFormat.width} × ${currentFormat.height}px`
        }
      </div>
    </div>
  );
};
