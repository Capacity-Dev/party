import { v4 as uuidv4 } from 'uuid';

export type EventConfig = {
  id: string;
  background_image_url: string | null;
  format_id: string;
  custom_width?: number;
  custom_height?: number;
  qr_zone_x: number;
  qr_zone_y: number;
  qr_zone_width: number;
  qr_zone_height: number;
  guest_name_x: number;
  guest_name_y: number;
  guest_name_color: string;
  table_name_x: number;
  table_name_y: number;
  table_name_color: string;
};

export type Table = {
  id: string;
  event_config_id: string;
  name: string;
};

export type Guest = {
  id: string;
  event_config_id: string;
  table_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  qr_code_data: string;
};

const LOCAL_STORAGE_KEYS = {
  EVENT_CONFIG: 'party_invite_event_config',
  TABLES: 'party_invite_tables',
  GUESTS: 'party_invite_guests',
};

export const eventConfigDB = {
  async getOrCreate(): Promise<EventConfig> {
    const storedConfig = localStorage.getItem(LOCAL_STORAGE_KEYS.EVENT_CONFIG);
    if (storedConfig) {
      const config = JSON.parse(storedConfig);
      // Migration: add format_id if missing
      if (!config.format_id) {
        config.format_id = 'id-card';
        localStorage.setItem(LOCAL_STORAGE_KEYS.EVENT_CONFIG, JSON.stringify(config));
      }
      return config;
    }

    const newConfig: EventConfig = {
      id: uuidv4(),
      background_image_url: null,
      format_id: 'id-card',
      qr_zone_x: 700,
      qr_zone_y: 150,
      qr_zone_width: 150,
      qr_zone_height: 150,
      guest_name_x: 50,
      guest_name_y: 50,
      guest_name_color: '#FFFFFF',
      table_name_x: 50,
      table_name_y: 100,
      table_name_color: '#FFFFFF',
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVENT_CONFIG, JSON.stringify(newConfig));
    return newConfig;
  },

  async update(eventConfigId: string, updates: Partial<EventConfig>): Promise<EventConfig> {
    const storedConfig = localStorage.getItem(LOCAL_STORAGE_KEYS.EVENT_CONFIG);
    if (!storedConfig) throw new Error('Event config not found');

    let config: EventConfig = JSON.parse(storedConfig);
    if (config.id !== eventConfigId) throw new Error('Config ID mismatch');

    config = { ...config, ...updates };
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVENT_CONFIG, JSON.stringify(config));
    return config;
  },
};

export const tablesDB = {
  async getAll(eventConfigId: string): Promise<Table[]> {
    const storedTables = localStorage.getItem(LOCAL_STORAGE_KEYS.TABLES);
    const allTables: Table[] = storedTables ? JSON.parse(storedTables) : [];
    return allTables.filter(table => table.event_config_id === eventConfigId);
  },

  async create(eventConfigId: string, name: string): Promise<Table> {
    const storedTables = localStorage.getItem(LOCAL_STORAGE_KEYS.TABLES);
    const allTables: Table[] = storedTables ? JSON.parse(storedTables) : [];

    const newTable: Table = {
      id: uuidv4(),
      event_config_id: eventConfigId,
      name,
    };
    allTables.push(newTable);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TABLES, JSON.stringify(allTables));
    return newTable;
  },

  async update(tableId: string, name: string): Promise<Table> {
    const storedTables = localStorage.getItem(LOCAL_STORAGE_KEYS.TABLES);
    if (!storedTables) throw new Error('Tables not found');

    let allTables: Table[] = JSON.parse(storedTables);
    const tableIndex = allTables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) throw new Error('Table not found');

    allTables[tableIndex] = { ...allTables[tableIndex], name };
    localStorage.setItem(LOCAL_STORAGE_KEYS.TABLES, JSON.stringify(allTables));
    return allTables[tableIndex];
  },

  async delete(tableId: string) {
    const storedTables = localStorage.getItem(LOCAL_STORAGE_KEYS.TABLES);
    if (!storedTables) return;

    let allTables: Table[] = JSON.parse(storedTables);
    allTables = allTables.filter(t => t.id !== tableId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TABLES, JSON.stringify(allTables));
  },
};

export const guestsDB = {
  async getAll(eventConfigId: string): Promise<Guest[]> {
    const storedGuests = localStorage.getItem(LOCAL_STORAGE_KEYS.GUESTS);
    const allGuests: Guest[] = storedGuests ? JSON.parse(storedGuests) : [];
    return allGuests.filter(guest => guest.event_config_id === eventConfigId);
  },

  async create(eventConfigId: string, guestData: Omit<Guest, 'id' | 'event_config_id'>): Promise<Guest> {
    const storedGuests = localStorage.getItem(LOCAL_STORAGE_KEYS.GUESTS);
    const allGuests: Guest[] = storedGuests ? JSON.parse(storedGuests) : [];

    const newGuest: Guest = {
      id: uuidv4(),
      event_config_id: eventConfigId,
      ...guestData,
    };
    allGuests.push(newGuest);
    localStorage.setItem(LOCAL_STORAGE_KEYS.GUESTS, JSON.stringify(allGuests));
    return newGuest;
  },

  async update(guestId: string, updates: Partial<Guest>): Promise<Guest> {
    const storedGuests = localStorage.getItem(LOCAL_STORAGE_KEYS.GUESTS);
    if (!storedGuests) throw new Error('Guests not found');

    let allGuests: Guest[] = JSON.parse(storedGuests);
    const guestIndex = allGuests.findIndex(g => g.id === guestId);
    if (guestIndex === -1) throw new Error('Guest not found');

    allGuests[guestIndex] = { ...allGuests[guestIndex], ...updates };
    localStorage.setItem(LOCAL_STORAGE_KEYS.GUESTS, JSON.stringify(allGuests));
    return allGuests[guestIndex];
  },

  async delete(guestId: string) {
    const storedGuests = localStorage.getItem(LOCAL_STORAGE_KEYS.GUESTS);
    if (!storedGuests) return;

    let allGuests: Guest[] = JSON.parse(storedGuests);
    allGuests = allGuests.filter(g => g.id !== guestId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.GUESTS, JSON.stringify(allGuests));
  },
};