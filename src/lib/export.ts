import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { Guest, Table } from './db';

export const exportInviteAsImage = async (elementId: string, fileName: string = 'invite.png') => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
  });

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = fileName;
  link.click();
};

export const exportInviteAsPDF = async (
  elementId: string,
  fileName: string = 'invite.pdf',
  options: { width?: number; height?: number } = {}
) => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const { width = 210, height = 100 } = options;
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [width, height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, width, height);
  pdf.save(fileName);
};

export const exportGuestsAsCSV = (
  guests: (Guest & { tableName?: string })[],
  fileName: string = 'guests.csv'
) => {
  const csvData = guests.map(guest => ({
    Name: guest.name,
    Email: guest.email || '',
    Phone: guest.phone || '',
    Table: guest.tableName || 'Unassigned',
    'QR Code Data': guest.qr_code_data,
  }));

  const csv = Papa.unparse(csvData);
  const link = document.createElement('a');
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  link.download = fileName;
  link.click();
};

export const downloadMultipleInvites = async (
  inviteIds: string[],
  getInviteElement: (id: string) => HTMLElement | null
) => {
  for (const id of inviteIds) {
    const element = getInviteElement(id);
    if (element) {
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `invite-${id}.png`;
      link.click();

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};
