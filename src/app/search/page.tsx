'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import PharmacyCard from '@/components/PharmacyCard';
import { supabase } from '@/lib/supabase';

type Pharmacy = {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  phone: string | null;
  whatsapp: string | null;
  schedule: string;
  is_garde: boolean;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. On récupère toutes les pharmacies une seule fois au chargement
  useEffect(() => {
    async function fetchPharmacies() {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('is_active', true);

      if (data) {
        setPharmacies(data);
      }
      setLoading(false);
    }
    fetchPharmacies();
  }, []);

  // 2. On filtre la liste instantanément selon la recherche de l'utilisateur
  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const lowerCaseQuery = query.toLowerCase();
    return (
      pharmacy.name.toLowerCase().includes(lowerCaseQuery) ||
      pharmacy.neighborhood.toLowerCase().includes(lowerCaseQuery)
    );
  });

  return (
    <div className="p-4">
      {/* Barre de recherche sticky (qui reste visible quand on scrolle) */}
      <div className="sticky top-[72px] z-30 bg-med-bg pb-4 pt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom ou quartier..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-med-blue focus:ring-1 focus:ring-med-blue bg-white text-gray-800 shadow-sm"
          />
          {/* Bouton pour effacer la recherche */}
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Chargement des pharmacies...</div>
      ) : query === '' ? (
        <div className="text-center py-10 text-gray-400">
          Tapez un nom ou un quartier pour lancer la recherche.
        </div>
      ) : filteredPharmacies.length > 0 ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">{filteredPharmacies.length} résultat(s) trouvé(s)</p>
          {filteredPharmacies.map((pharmacy) => (
            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          Aucune pharmacie trouvée pour "<span className="font-semibold text-gray-600">{query}</span>".
        </div>
      )}
    </div>
  );
}