import { useMemo } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { EventConfig, Guest, Table } from '../lib/db';

interface InviteCardProps {
  guest: Guest;
  table: Table | undefined;
  config: EventConfig;
  id: string;
}

const INVITE_CARD_WIDTH = 1050;
const INVITE_CARD_HEIGHT = 500;

export const InviteCard = ({ guest, table, config, id }: InviteCardProps) => {
  const qrData = useMemo(() => {
    try {
      return JSON.parse(guest.qr_code_data);
    } catch {
      return null;
    }
  }, [guest.qr_code_data]);

  return (
    <div
      id={id}
      className="relative w-full"
      style={{
        aspectRatio: `${INVITE_CARD_WIDTH} / ${INVITE_CARD_HEIGHT}`,
        maxWidth: `${INVITE_CARD_WIDTH}px`,
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
          left: `${(config.qr_zone_x / INVITE_CARD_WIDTH) * 100}%`,
          top: `${(config.qr_zone_y / INVITE_CARD_HEIGHT) * 100}%`,
          width: `${(config.qr_zone_width / INVITE_CARD_WIDTH) * 100}%`,
          height: `${(config.qr_zone_height / INVITE_CARD_HEIGHT) * 100}%`,
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
          left: `${(config.guest_name_x / INVITE_CARD_WIDTH) * 100}%`,
          top: `${(config.guest_name_y / INVITE_CARD_HEIGHT) * 100}%`,
          color: config.guest_name_color,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        <h3 className="text-3xl font-bold">{guest.name}</h3>
      </div>

      <div
        className="absolute p-6"
        style={{
          left: `${(config.table_name_x / INVITE_CARD_WIDTH) * 100}%`,
          top: `${(config.table_name_y / INVITE_CARD_HEIGHT) * 100}%`,
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
