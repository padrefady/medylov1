import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mot de passe admin simple pour la V1
const ADMIN_PASSWORD = 'Medylo2024!';

// Client Supabase Admin avec droits total (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// FONCTION POUR AJOUTER UNE PHARMACIE (POST)
export async function POST(req: Request) {
  const body = await req.json();
  const { password, pharmacy } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('pharmacies')
    .insert([pharmacy])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

// FONCTION POUR SUPPRIMER UNE PHARMACIE (DELETE)
export async function DELETE(req: Request) {
  const body = await req.json();
  const { password, id } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from('pharmacies')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}