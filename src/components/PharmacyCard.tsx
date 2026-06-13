import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react';

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

export default function PharmacyCard({ pharmacy }: { pharmacy: Pharmacy }) {
  const waLink = pharmacy.whatsapp 
    ? `https://wa.me/${pharmacy.whatsapp.replace(/\s+/g, '')}` 
    : null;
    
  const telLink = pharmacy.phone ? `tel:${pharmacy.phone.replace(/\s+/g, '')}` : null;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 text-lg">{pharmacy.name}</h3>
        {pharmacy.is_garde && (
          <span className="bg-med-green/10 text-med-green text-xs font-bold px-2 py-1 rounded-full">
            De Garde
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-med-blue mt-0.5 shrink-0" />
          <span>{pharmacy.address}, <strong>{pharmacy.neighborhood}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-med-blue shrink-0" />
          <span>{pharmacy.schedule}</span>
        </div>
      </div>

      <div className="flex gap-3 border-t border-gray-50 pt-3">
        {pharmacy.phone && (
          <a href={telLink} className="flex-1 flex items-center justify-center gap-2 bg-med-blue text-white py-2 rounded-lg font-medium text-sm hover:bg-blue-800 transition-colors">
            <Phone size={16} /> Appeler
          </a>
        )}
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-med-green text-white py-2 rounded-lg font-medium text-sm hover:bg-green-600 transition-colors">
            <MessageCircle size={16} /> WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}