export const generateQRCodeData = (guestName: string, tableName: string): string => {
  const uniqueId = crypto.randomUUID();
  return JSON.stringify({
    id: uniqueId,
    guest: guestName,
    table: tableName,
    timestamp: new Date().toISOString(),
  });
};

export const parseQRCodeData = (data: string) => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};
