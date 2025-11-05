import { useEffect, useState } from 'react';
import { Download, Download as DownloadIcon } from 'lucide-react';
import { InviteCard } from './InviteCard';
import { eventConfigDB, tablesDB, guestsDB, EventConfig, Table, Guest } from '../lib/db';
import { generateQRCodeData } from '../lib/qrcode';
import { exportInviteAsImage, exportInviteAsPDF } from '../lib/export';

export const MainPage = () => {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [previewGuest, setPreviewGuest] = useState<Guest | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cfg = await eventConfigDB.getOrCreate();
      setConfig(cfg);
      const tablesList = await tablesDB.getAll(cfg.id);
      setTables(tablesList);
      if (tablesList.length > 0 && !selectedTableId) {
        setSelectedTableId(tablesList[0].id);
      }
      const guestsList = await guestsDB.getAll(cfg.id);
      setGuests(guestsList);
    } catch (error) {
      console.error('Erreur lors du chargement des données :', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim() || !selectedTableId || !config) {
      alert('Veuillez saisir le nom de l'invité et sélectionner une table');
      return;
    }

    const selectedTable = tables.find(t => t.id === selectedTableId);
    if (!selectedTable) return;

    try {
      const qrData = generateQRCodeData(guestName, selectedTable.name);
      const newGuest = await guestsDB.create(config.id, {
        table_id: selectedTableId,
        name: guestName,
        email: guestEmail || null,
        phone: guestPhone || null,
        qr_code_data: qrData,
      });

      setGuests([...guests, newGuest]);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setPreviewGuest(newGuest);
    } catch (error) {
      console.error('Erreur lors de l'ajout de l'invité :', error);
      alert('Échec de l'ajout de l'invité');
    }
  };

  const handleDownloadInvite = async (guest: Guest, format: 'png' | 'pdf') => {
    setExporting(true);
    try {
      if (format === 'png') {
        await exportInviteAsImage(`invite-${guest.id}`, `invite-${guest.name}.png`);
      } else {
        await exportInviteAsPDF(`invite-${guest.id}`, `invite-${guest.name}.pdf`);
      }
    } catch (error) {
      console.error('Erreur lors de l'exportation de l'invitation :', error);
      alert('Échec de l'exportation de l'invitation');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!config) {
    return <div className="p-6 text-red-500">Configuration introuvable. Veuillez configurer l'événement d'abord.</div>;
  }

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const previewTable = previewGuest ? tables.find(t => t.id === previewGuest.table_id) : undefined;

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-2xl font-bold">Ajouter un invité</h2>

            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de l'invité *</label>
                <input
                  type="text"
                  placeholder="Saisir le nom de l'invité"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email (Facultatif)</label>
                <input
                  type="email"
                  placeholder="Saisir l'email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Téléphone (Facultatif)</label>
                <input
                  type="tel"
                  placeholder="Saisir le numéro de téléphone"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Table *</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-medium"
              >
                Générer l'invitation
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">Aperçu de l'invitation</h2>

            {previewGuest && config && previewTable ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 overflow-auto">
                  <InviteCard
                    guest={previewGuest}
                    table={previewTable}
                    config={config}
                    id={`invite-${previewGuest.id}`}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadInvite(previewGuest, 'png')}
                    disabled={exporting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50"
                  >
                    <Download size={20} />
                    Télécharger en PNG
                  </button>
                  <button
                    onClick={() => handleDownloadInvite(previewGuest, 'pdf')}
                    disabled={exporting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                  >
                    <DownloadIcon size={20} />
                    Télécharger en PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                {tables.length === 0
                  ? 'Veuillez créer des tables dans la configuration d'abord'
                  : 'Ajoutez un invité pour prévisualiser son invitation'}
              </div>
            )}
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">Invités récents</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {guests.slice(-6).reverse().map(guest => (
            <div key={guest.id} className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-lg">{guest.name}</h3>
              <p className="text-sm text-gray-600">
                Table : {tables.find(t => t.id === guest.table_id)?.name || 'Inconnue'}
              </p>
              {guest.email && <p className="text-sm text-gray-500">{guest.email}</p>}
              <button
                onClick={() => setPreviewGuest(guest)}
                className="mt-3 text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                Voir l'invitation
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
