import { supabase } from '@/lib/supabase';
import PharmacyCard from '@/components/PharmacyCard';

export const revalidate = 60;

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

export default async function HomePage() {
  const { data: pharmacies, error } = await supabase
    .from('pharmacies')
    .select('*')
    .eq('is_active', true)
    .order('is_garde', { ascending: false });

  if (error) {
    return <div className="p-4 text-red-500">Erreur de chargement des données</div>;
  }

  const groupedByNeighborhood = (pharmacies as Pharmacy[]).reduce<Record<string, Pharmacy[]>>((acc, pharmacy) => {
    if (!acc[pharmacy.neighborhood]) {
      acc[pharmacy.neighborhood] = [];
    }
    acc[pharmacy.neighborhood].push(pharmacy);
    return acc;
  }, {});

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pharmacies à Yaoundé</h2>
        <p className="text-gray-500 text-sm">{pharmacies?.length} pharmacies référencées</p>
      </div>

      {Object.entries(groupedByNeighborhood).map(([neighborhood, pharms]) => (
        <div key={neighborhood} className="mb-6">
          <h3 className="text-md font-semibold text-med-blue mb-3 border-b border-blue-100 pb-1">
            {neighborhood}
          </h3>
          <div>
            {pharms.map((pharmacy) => (
              <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}