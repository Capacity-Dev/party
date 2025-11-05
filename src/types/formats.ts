export type InviteFormat = {
  id: string;
  name: string;
  width: number;
  height: number;
  printWidth?: string;
  printHeight?: string;
};

export const INVITE_FORMATS: InviteFormat[] = [
  {
    id: 'id-card',
    name: 'ID Card',
    width: 1050,
    height: 500,
    printWidth: '85.6mm',
    printHeight: '53.98mm'
  },
  {
    id: 'a5',
    name: 'A5',
    width: 1480,
    height: 2100,
    printWidth: '148mm',
    printHeight: '210mm'
  },
  {
    id: 'a4',
    name: 'A4',
    width: 2100,
    height: 2970,
    printWidth: '210mm',
    printHeight: '297mm'
  },
  {
    id: 'custom',
    name: 'Custom',
    width: 1050,
    height: 500
  }
];

export const getFormatById = (id: string): InviteFormat => {
  return INVITE_FORMATS.find(f => f.id === id) || INVITE_FORMATS[0];
};
