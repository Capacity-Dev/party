import { QRCodeSVG as QRCode } from 'qrcode.react';
import { EventConfig, Guest, Table } from '../lib/db';
import { getFormatById } from '../types/formats';

interface InviteCardProps {
  guest: Guest;
  table: Table | undefined;
  config: EventConfig;
  id: string;
}

export const InviteCard = ({ guest, table, config, id }: InviteCardProps) => {
  const format = getFormatById(config.format_id);
  const width = config.format_id === 'custom' ? (config.custom_width || format.width) : format.width;
  const height = config.format_id === 'custom' ? (config.custom_height || format.height) : format.height;

  return (
    <div
      id={id}
      className="relative w-full"
      style={{
        aspectRatio: `${width} / ${height}`,
        maxWidth: `${width}px`,
      }}
    >
      {config.background_image_url ? (
        <img
          src={config.background_image_url}
          alt="Background"
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg" />
      )}

      <div
        className="absolute flex items-center justify-center bg-white rounded-lg shadow-md"
        style={{
          left: `${(config.qr_zone_x / width) * 100}%`,
          top: `${(config.qr_zone_y / height) * 100}%`,
          width: `${(config.qr_zone_width / width) * 100}%`,
          height: `${(config.qr_zone_height / height) * 100}%`,
          minWidth: '80px',
          minHeight: '80px',
        }}
      >
        <QRCode
          value={guest.qr_code_data || 'invalid'}
          size={Math.min(config.qr_zone_width, config.qr_zone_height) - 10}
          level="H"
          includeMargin={false}
        />
      </div>

      <div
        className="absolute p-6"
        style={{
          left: `${(config.guest_name_x / width) * 100}%`,
          top: `${(config.guest_name_y / height) * 100}%`,
          color: config.guest_name_color,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        <h3 className="text-3xl font-bold">{guest.name}</h3>
      </div>

      <div
        className="absolute p-6"
        style={{
          left: `${(config.table_name_x / width) * 100}%`,
          top: `${(config.table_name_y / height) * 100}%`,
          color: config.table_name_color,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        <p className="text-xl opacity-90">Table: {table?.name || 'TBA'}</p>
        {guest.email && <p className="text-sm opacity-75 mt-1">{guest.email}</p>}
      </div>
    </div>
  );
};
