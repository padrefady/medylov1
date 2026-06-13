'use client';

import { useState, useEffect } from 'react';
import { Lock, Plus, Trash2, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ADMIN_PASSWORD = 'Medylo2024!'; // Le même mot de passe que dans l'API

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
  
  // Champs du formulaire
  const [form, setForm] = useState({
    name: '', address: '', neighborhood: '', phone: '', whatsapp: '', schedule: 'Lun-Sam: 8h-20h', is_garde: false, is_active: true
  });

  useEffect(() => {
    if (isAuth) fetchPharmacies();
  }, [isAuth]);

  const fetchPharmacies = async () => {
    const { data } = await supabase.from('pharmacies').select('*').order('created_at', { ascending: false });
    if (data) setPharmacies(data);
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

  // SI NON CONNECTÉ : Formulaire de connexion
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

  // SI CONNECTÉ : Dashboard
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Admin</h2>
        <button onClick={() => setIsAuth(false)} className="text-red-500 flex items-center gap-1 text-sm font-medium">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>

      {/* Formulaire d'ajout */}
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

      {/* Liste des pharmacies existantes */}
      <h3 className="font-bold text-lg mb-4">Pharmacies existantes ({pharmacies.length})</h3>
      <div className="space-y-2">
        {pharmacies.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center">
            <div>
              <p className="font-medium">{p.name} {p.is_garde && <span className="text-xs text-med-green">(Garde)</span>}</p>
              <p className="text-xs text-gray-500">{p.neighborhood}</p>
            </div>
            <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}