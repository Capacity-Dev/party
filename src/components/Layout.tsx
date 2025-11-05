import { Link, Outlet } from 'react-router-dom';
import { Settings, Plus, Users } from 'lucide-react';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Générateur d'Invitations de Fête</h1>
            <p className="text-sm text-gray-600">Invitations au format ID Card</p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/configuration"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700"
            >
              <Settings size={20} />
              Configuration
            </Link>
            <Link
              to="/ajouter-invites"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700"
            >
              <Plus size={20} />
              Ajouter des invités
            </Link>
            <Link
              to="/liste-invites"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700"
            >
              <Users size={20} />
              Liste des invités
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
