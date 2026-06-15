'use client';

import { useState, useEffect } from 'react';
import { Lock, Plus, Trash2, LogOut, Pencil, Save, XCircle, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ADMIN_PASSWORD = 'Medylo2024!';

type Pharmacy = {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  phone: string;
  whatsapp: string;
  schedule: string;
  is_garde: boolean;
  is_active: boolean;
};

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  
  const [form, setForm] = useState({
    name: '', address: '', neighborhood: '', phone: '', whatsapp: '', schedule: 'Lun-Sam: 8h-20h', is_garde: false, is_active: true
  });

  // Nouveaux états pour la modification
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Pharmacy | null>(null);

  useEffect(() => {
    if (isAuth) fetchPharmacies();
  }, [isAuth]);

  const fetchPharmacies = async () => {
    const res = await fetch('/api/pharmacies');
    if (res.ok) {
      const data = await res.json();
      setPharmacies(data);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuth(true);
    } else {
      alert('Mot de passe incorrect !');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/pharmacies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD, pharmacy: form }),
    });
    
    if (res.ok) {
      setForm({ name: '', address: '', neighborhood: '', phone: '', whatsapp: '', schedule: 'Lun-Sam: 8h-20h', is_garde: false, is_active: true });
      fetchPharmacies();
      alert('Pharmacie ajoutée avec succès !');
    } else {
      alert('Erreur lors de l\'ajout');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette pharmacie ?')) return;
    const res = await fetch('/api/pharmacies', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD, id }),
    });
    
    if (res.ok) {
      fetchPharmacies();
    } else {
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async (id: string, field: string, value: boolean) => {
    const res = await fetch('/api/pharmacies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD, id, updates: { [field]: value } }),
    });
    
    if (res.ok) {
      fetchPharmacies(); 
    } else {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  // NOUVELLES FONCTIONS POUR LA MODIFICATION
  const handleEdit = (pharmacy: Pharmacy) => {
    setEditingId(pharmacy.id);
    setEditForm(pharmacy);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    
    const { id, ...updates } = editForm;

    const res = await fetch('/api/pharmacies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD, id, updates }),
    });

    if (res.ok) {
      alert('Pharmacie modifiée avec succès !');
      handleCancelEdit();
      fetchPharmacies();
    } else {
      alert('Erreur lors de la modification');
    }
  };

  // FONCTION POUR L'IMPORT CSV ADAPTÉE A TES DONNÉES
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      alert('Le fichier est vide ou mal formaté');
      return;
    }

    // On récupère les en-têtes (première ligne)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const pharmaciesToImport = lines.slice(1).map(line => {
      const values = line.split(',').map(val => val.trim());
      
      // Créer un objet clé/valeur avec les en-têtes
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || '';
      });

      // Extraction sécurisée du téléphone (on ignore les "Via...")
      let phone = row['telephone_contact'] || null;
      if (phone && phone.toLowerCase().startsWith('via ')) {
        phone = null;
      }

      return {
        name: row['nom'] || '',
        address: row['adresse_repere'] || '',
        neighborhood: row['quartier'] || '',
        phone: phone,
        whatsapp: null, // Pas dans ton CSV, on met null
        schedule: 'Lun-Sam: 8h-20h', // Horaires par défaut
        is_garde: false, // Pas de garde par défaut
        is_active: true, // Active par défaut
      };
    }).filter(p => p.name !== ''); // On ignore les lignes vides

    if (pharmaciesToImport.length === 0) {
      alert('Aucune pharmacie valide trouvée dans le fichier');
      return;
    }

    const res = await fetch('/api/pharmacies/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD, pharmacies: pharmaciesToImport }),
    });

    if (res.ok) {
      const result = await res.json();
      alert(`🎉 ${result.count} pharmacies importées avec succès !`);
      fetchPharmacies(); // Rafraîchit la liste
    } else {
      alert('Erreur lors de l\'importation.');
    }

    // Réinitialiser l'input fichier
    e.target.value = '';
  };

  if (!isAuth) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[70vh]">
        <Lock size={48} className="text-med-blue mb-4" />
        <h2 className="text-xl font-bold mb-4">Accès Administrateur</h2>
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <input
            type="password"
            placeholder="Mot de passe..."
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:border-med-blue"
          />
          <button type="submit" className="w-full bg-med-blue text-white py-3 rounded-lg font-bold">
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Admin</h2>
        <button onClick={() => setIsAuth(false)} className="text-red-500 flex items-center gap-1 text-sm font-medium">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Plus size={20} className="text-med-green" /> Ajouter une pharmacie
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input required placeholder="Nom *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="p-2 border rounded-lg text-sm focus:outline-none focus:border-med-blue" />
          <input required placeholder="Quartier *" value={form.neighborhood} onChange={(e) => setForm({...form, neighborhood: e.target.value})} className="p-2 border rounded-lg text-sm focus:outline-none focus:border-med-blue" />
          <input required placeholder="Adresse *" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="p-2 border rounded-lg text-sm focus:outline-none focus:border-med-blue md:col-span-2" />
          <input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="p-2 border rounded-lg text-sm focus:outline-none focus:border-med-blue" />
          <input placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({...form, whatsapp: e.target.value})} className="p-2 border rounded-lg text-sm focus:outline-none focus:border-med-blue" />
          <div className="flex items-center gap-4 md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_garde} onChange={(e) => setForm({...form, is_garde: e.target.checked})} /> De garde
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({...form, is_active: e.target.checked})} /> Active
            </label>
          </div>
          <button type="submit" className="md:col-span-2 bg-med-green text-white py-2 rounded-lg font-bold mt-2">
            Ajouter
          </button>
        </form>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Pharmacies existantes ({pharmacies.length})</h3>
        
        <div>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleImportCSV} 
            className="hidden" 
            id="csv-upload"
          />
          <label 
            htmlFor="csv-upload" 
            className="flex items-center gap-2 bg-med-green text-white px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-green-600 transition-colors"
          >
            <Upload size={16} /> Importer CSV
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {pharmacies.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-lg border border-gray-100">
            
            {/* MODE AFFICHAGE NORMAL */}
            {editingId !== p.id ? (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className={p.is_active ? '' : 'opacity-50 line-through'}>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.neighborhood} - {p.schedule}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="checkbox" checked={p.is_garde} onChange={() => handleToggleStatus(p.id, 'is_garde', !p.is_garde)} className="w-4 h-4 text-med-green rounded focus:ring-med-green" /> 
                    <span className="text-gray-600">Garde</span>
                  </label>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="checkbox" checked={p.is_active} onChange={() => handleToggleStatus(p.id, 'is_active', !p.is_active)} className="w-4 h-4 text-med-blue rounded focus:ring-med-blue" /> 
                    <span className="text-gray-600">Active</span>
                  </label>
                  
                  {/* Bouton Modifier */}
                  <button onClick={() => handleEdit(p)} className="text-med-blue hover:bg-blue-50 p-1.5 rounded-full" title="Modifier">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full" title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (

              /* MODE MODIFICATION (Formulaire inline) */
              editForm && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="p-2 border rounded-lg text-sm focus:outline-none focus:border-med-blue" placeholder="Nom" />
                    <input value={editForm.neighborhood} onChange={(e) => setEditForm({...editForm, neighborhood: e.target.value})} className="p-2 border rounded-lg text-sm focus:outline-none focus:border-med-blue" placeholder="Quartier" />
                    <input value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} className="p-2 border rounded-lg text-sm focus:outline-none focus:border-med-blue md:col-span-2" placeholder="Adresse" />
                    <input value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="p-2 border rounded-lg text-sm focus:outline-none focus:border-med-blue" placeholder="Téléphone" />
                    <input value={editForm.whatsapp} onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})} className="p-2 border rounded-lg text-sm focus:outline-none focus:border-med-blue" placeholder="WhatsApp" />
                    <input value={editForm.schedule} onChange={(e) => setEditForm({...editForm, schedule: e.target.value})} className="p-2 border rounded-lg text-sm focus:outline-none focus:border-med-blue md:col-span-2" placeholder="Horaires" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleCancelEdit} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm px-3 py-1 border rounded-lg">
                      <XCircle size={16} /> Annuler
                    </button>
                    <button onClick={handleSaveEdit} className="flex items-center gap-1 text-white bg-med-blue hover:bg-blue-800 text-sm px-3 py-1 rounded-lg">
                      <Save size={16} /> Sauvegarder
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}