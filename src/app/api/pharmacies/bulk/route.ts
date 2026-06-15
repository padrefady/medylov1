import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PASSWORD = 'Medylo2024!';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const { password, pharmacies } = body;

  // Vérification du mot de passe
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Vérification que c'est bien un tableau
  if (!Array.isArray(pharmacies) || pharmacies.length === 0) {
    return NextResponse.json({ error: 'Format de données invalide' }, { status: 400 });
  }

  // Insertion en masse dans Supabase
  const { data, error } = await supabaseAdmin
    .from('pharmacies')
    .insert(pharmacies)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ count: data.length });
}