import { useEffect, useState, useRef } from 'react';
import { Download, FileDown, Trash2, Filter } from 'lucide-react';
import { InviteCard } from './InviteCard';
import { eventConfigDB, tablesDB, guestsDB, EventConfig, Table, Guest } from '../lib/db';
import { exportInviteAsImage, exportInviteAsPDF, exportGuestsAsCSV, downloadMultipleInvites } from '../lib/export';

export const GuestListPage = () => {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);
  const [filterTable, setFilterTable] = useState('');
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingAll, setDownloadingAll] = useState(false);
  const hiddenInvitesRef = useRef<HTMLDivElement>(null);
  const [activeDownloadGuests, setActiveDownloadGuests] = useState<Guest[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cfg = await eventConfigDB.getOrCreate();
      setConfig(cfg);
      const tablesList = await tablesDB.getAll(cfg.id);
      setTables(tablesList);
      const guestsList = await guestsDB.getAll(cfg.id);
      setGuests(guestsList);
    } catch (error) {
      console.error('Erreur lors du chargement des données :', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) return;

    try {
      await guestsDB.delete(guestId);
      setGuests(guests.filter(g => g.id !== guestId));
      setViewingGuest(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'invité :', error);
      alert('Échec de la suppression de l\'invité');
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
      console.error('Erreur lors de l\'exportation de l\'invitation :', error);
      alert('Échec de l\'exportation de l\'invitation');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAllAsCSV = () => {
    try {
      const guestsWithTableNames = guests.map(g => ({
        ...g,
        tableName: tables.find(t => t.id === g.table_id)?.name,
      }));
      exportGuestsAsCSV(guestsWithTableNames);
    } catch (error) {
      console.error('Erreur lors de l\'exportation CSV :', error);
      alert('Échec de l\'exportation CSV');
    }
  };

  const handleDownloadAllInvites = async () => {
    if (!config) {
      alert('Configuration introuvable. Veuillez configurer l\'événement d\'abord.');
      return;
    }
    if (guests.length === 0) {
      alert('Aucun invité à télécharger.');
      return;
    }

    setDownloadingAll(true);
    setActiveDownloadGuests(guests);

    // Wait for the invites to render in the hidden div
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const inviteIds = guests.map(g => `invite-${g.id}`);
      await downloadMultipleInvites(inviteIds, (id) => document.getElementById(id));
      alert('Toutes les invitations ont été téléchargées avec succès !');
    } catch (error) {
      console.error('Erreur lors du téléchargement de toutes les invitations :', error);
      alert('Échec du téléchargement de toutes les invitations.');
    } finally {
      setDownloadingAll(false);
      setActiveDownloadGuests([]); // Clear the hidden invites
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  const filteredGuests = guests.filter(g => {
    const matchesTable = !filterTable || g.table_id === filterTable;
    const matchesSearch = !searchTerm || g.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTable && matchesSearch;
  });

  const viewingTable = viewingGuest ? tables.find(t => t.id === viewingGuest.table_id) : undefined;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Liste des invités</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportAllAsCSV}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            <FileDown size={20} />
            Exporter en CSV
          </button>
          <button
            onClick={handleDownloadAllInvites}
            disabled={downloadingAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
          >
            <Download size={20} />
            {downloadingAll ? 'Téléchargement...' : 'Télécharger toutes les invitations'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Filter size={20} />
              Filtres
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rechercher par nom</label>
                <input
                  type="text"
                  placeholder="Saisir le nom de l'invité"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Filtrer par table</label>
                <select
                  value={filterTable}
                  onChange={(e) => setFilterTable(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les tables</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name} ({guests.filter(g => g.table_id === table.id).length})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 rounded text-sm text-gray-700">
                <p className="font-semibold">{filteredGuests.length} invité(s) trouvé(s)</p>
                <p className="text-xs mt-1">Total : {guests.length} invités</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-3">Détails de l'invité</h3>
            {viewingGuest ? (
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Nom</p>
                  <p className="font-medium">{viewingGuest.name}</p>
                </div>
                {viewingGuest.email && (
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium text-blue-600">{viewingGuest.email}</p>
                  </div>
                )}
                {viewingGuest.phone && (
                  <div>
                    <p className="text-gray-600">Téléphone</p>
                    <p className="font-medium">{viewingGuest.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Table assignée</p>
                  <p className="font-medium">{viewingTable?.name || 'Non assignée'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Sélectionnez un invité pour voir les détails</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {viewingGuest && config && viewingTable ? (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h3 className="font-semibold">Aperçu de l'invitation</h3>
              <div className="border rounded-lg p-4 overflow-auto">
                <InviteCard
                  guest={viewingGuest}
                  table={viewingTable}
                  config={config}
                  id={`invite-${viewingGuest.id}`}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadInvite(viewingGuest, 'png')}
                  disabled={exporting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50"
                >
                  <Download size={20} />
                  PNG
                </button>
                <button
                  onClick={() => handleDownloadInvite(viewingGuest, 'pdf')}
                  disabled={exporting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                >
                  <Download size={20} />
                  PDF
                </button>
                <button
                  onClick={() => handleDeleteGuest(viewingGuest.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  <Trash2 size={20} />
                  Supprimer
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 h-96 flex items-center justify-center">
              <p className="text-gray-500">Sélectionnez un invité pour prévisualiser son invitation</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4">Tous les invités</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredGuests.length > 0 ? (
                filteredGuests.map(guest => {
                  const table = tables.find(t => t.id === guest.table_id);
                  return (
                    <button
                      key={guest.id}
                      onClick={() => setViewingGuest(guest)}
                      className={`w-full text-left p-3 rounded transition ${
                        viewingGuest?.id === guest.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="font-medium">{guest.name}</div>
                      <div className="text-sm text-gray-600">{table?.name || 'Non assignée'}</div>
                      {guest.email && <div className="text-xs text-gray-500">{guest.email}</div>}
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 py-4">Aucun invité trouvé</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden container for rendering invites for bulk download */}
      {downloadingAll && config && (
        <div ref={hiddenInvitesRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          {activeDownloadGuests.map(guest => {
            const table = tables.find(t => t.id === guest.table_id);
            return table ? (
              <InviteCard
                key={`download-${guest.id}`}
                guest={guest}
                table={table}
                config={config}
                id={`invite-${guest.id}`}
              />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};
