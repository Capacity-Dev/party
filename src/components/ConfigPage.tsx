import { useEffect, useState, useCallback } from 'react';
import { Upload, Plus, Trash2, Edit2, Palette } from 'lucide-react';
import { UnifiedInviteEditor } from './UnifiedInviteEditor';
import { eventConfigDB, tablesDB, EventConfig, Table } from '../lib/db';

export const ConfigPage = () => {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableName, setNewTableName] = useState('');
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingTableName, setEditingTableName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cfg = await eventConfigDB.getOrCreate();
      setConfig(cfg);
      const tablesList = await tablesDB.getAll(cfg.id);
      setTables(tablesList);
    } catch (error) {
      console.error('Erreur lors du chargement des données :', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imageUrl = event.target?.result as string;
        await eventConfigDB.update(config.id, { background_image_url: imageUrl });
        setConfig(prev => prev ? { ...prev, background_image_url: imageUrl } : null);
      } catch (error) {
        console.error('Erreur lors du téléchargement de l\'image :', error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQrZoneChange = useCallback(async (zone: { x: number; y: number; width: number; height: number }) => {
    if (!config) return;

    if (
      config.qr_zone_x === zone.x &&
      config.qr_zone_y === zone.y &&
      config.qr_zone_width === zone.width &&
      config.qr_zone_height === zone.height
    ) {
      return; // Pas de changement, ne rien faire
    }

    try {
      await eventConfigDB.update(config.id, {
        qr_zone_x: zone.x,
        qr_zone_y: zone.y,
        qr_zone_width: zone.width,
        qr_zone_height: zone.height,
      });
      setConfig(prev => prev ? { ...prev, ...zone } : null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la zone QR :', error);
    }
  }, [config]);

  const handleTextPositionChange = useCallback(async (fieldX: keyof EventConfig, fieldY: keyof EventConfig, x: number, y: number) => {
    if (!config) return;

    if (config[fieldX] === x && config[fieldY] === y) return; // Pas de changement

    try {
      await eventConfigDB.update(config.id, { [fieldX]: x, [fieldY]: y });
      setConfig(prev => prev ? { ...prev, [fieldX]: x, [fieldY]: y } : null);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la position du texte pour ${fieldX} :`, error);
    }
  }, [config]);

  const handleTextColorChange = useCallback(async (field: keyof EventConfig, color: string) => {
    if (!config) return;

    if (config[field] === color) return; // Pas de changement

    try {
      await eventConfigDB.update(config.id, { [field]: color });
      setConfig(prev => prev ? { ...prev, [field]: color } : null);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la couleur du texte pour ${field} :`, error);
    }
  }, [config]);

  const handleAddTable = async () => {
    if (!newTableName.trim() || !config) return;

    try {
      const newTable = await tablesDB.create(config.id, newTableName);
      setTables([...tables, newTable]);
      setNewTableName('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la table :', error);
    }
  };

  const handleUpdateTable = async (tableId: string) => {
    if (!editingTableName.trim()) return;

    try {
      const updated = await tablesDB.update(tableId, editingTableName);
      setTables(tables.map(t => t.id === tableId ? updated : t));
      setEditingTableId(null);
      setEditingTableName('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la table :', error);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      await tablesDB.delete(tableId);
      setTables(tables.filter(t => t.id !== tableId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la table :', error);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Chargement de la configuration...</div>;
  }

  return (
    <div className="p-8 space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Configuration de l'événement</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* General Settings */}
        <section className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Paramètres généraux</h2>

          {/* Background Image */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Image de fond</h3>
            <label className="flex items-center gap-3 px-5 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-all duration-200 ease-in-out shadow-md w-fit">
              <Upload size={20} />
              Télécharger une image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {config?.background_image_url && (
              <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                <span className="text-green-500">&#10003;</span> Image téléchargée avec succès
              </p>
            )}
          </div>

          {/* Unified Invite Editor */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Éditeur de mise en page de l'invitation</h3>
            <p className="text-sm text-gray-500 mb-4">
              Faites glisser et redimensionnez la zone du code QR et les exemples de texte pour ajuster leurs positions.
            </p>
            {config && (
              <UnifiedInviteEditor
                config={config}
                onQrZoneChange={handleQrZoneChange}
                onTextPositionChange={handleTextPositionChange}
              />
            )}
          </div>
        </section>

        {/* Text Color Settings */}
        <section className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Paramètres de couleur du texte</h2>

          {/* Guest Name Color */}
          <div className="space-y-2">
            <label htmlFor="guestNameColor" className="block text-sm font-medium text-gray-700 mb-1">Couleur du nom de l'invité</label>
            <div className="relative">
              <Palette size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="color"
                id="guestNameColor"
                value={config?.guest_name_color || '#FFFFFF'}
                onChange={(e) => handleTextColorChange('guest_name_color', e.target.value)}
                onBlur={(e) => handleTextColorChange('guest_name_color', e.target.value)}
                className="w-full h-10 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{ padding: '0 0 0 40px' }}
              />
            </div>
          </div>

          {/* Table Name Color */}
          <div className="space-y-2">
            <label htmlFor="tableNameColor" className="block text-sm font-medium text-gray-700 mb-1">Couleur du nom de la table</label>
            <div className="relative">
              <Palette size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="color"
                id="tableNameColor"
                value={config?.table_name_color || '#FFFFFF'}
                onChange={(e) => handleTextColorChange('table_name_color', e.target.value)}
                onBlur={(e) => handleTextColorChange('table_name_color', e.target.value)}
                className="w-full h-10 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{ padding: '0 0 0 40px' }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Tables Management */}
      <section className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Gestion des tables</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Nom de la nouvelle table (ex: Table 1, Table VIP)"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTable()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleAddTable}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 ease-in-out shadow-md"
          >
            <Plus size={20} />
            Ajouter une table
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {tables.length > 0 ? (
            tables.map(table => (
              <div key={table.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {editingTableId === table.id ? (
                  <>
                    <input
                      type="text"
                      value={editingTableName}
                      onChange={(e) => setEditingTableName(e.target.value)}
                      autoFocus
                      className="flex-1 px-3 py-1 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleUpdateTable(table.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                    >
                      Sauvegarder
                    </button>
                    <button
                      onClick={() => setEditingTableId(null)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-gray-800 text-lg">{table.name}</span>
                    <button
                      onClick={() => {
                        setEditingTableId(table.id);
                        setEditingTableName(table.name);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                      aria-label={`Modifier ${table.name}`}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                      aria-label={`Supprimer ${table.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">Aucune table pour le moment. Ajoutez-en une pour commencer !</p>
          )}
        </div>
      </section>
    </div>
  );
};
