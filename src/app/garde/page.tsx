import { supabase } from '@/lib/supabase';
import PharmacyCard from '@/components/PharmacyCard';
import { Shield } from 'lucide-react';

export const revalidate = 60; // Mise à jour automatique toutes les 60 secondes

export default async function GardePage() {
  // On demande à Supabase UNIQUEMENT les pharmacies où is_garde est vrai
  const { data: pharmacies, error } = await supabase
    .from('pharmacies')
    .select('*')
    .eq('is_active', true)
    .eq('is_garde', true);

  if (error) {
    return <div className="p-4 text-red-500">Erreur de chargement</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-med-green" size={28} />
          <h2 className="text-2xl font-bold text-gray-900">Pharmacies de Garde</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Pharmacies ouvertes en dehors des heures normales, week-ends et jours fériés.
        </p>
      </div>

      {/* Si aucune pharmacie de garde n'est trouvée */}
      {pharmacies.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <Shield size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucune pharmacie de garde</p>
          <p className="text-gray-400 text-sm mt-1">Revenez plus tard ou contactez votre mairie.</p>
        </div>
      ) : (
        // Sinon, on affiche la liste
        <div>
          {pharmacies.map((pharmacy) => (
            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
          ))}
        </div>
      )}
    </div>
  );
}