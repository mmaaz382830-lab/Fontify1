'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { NewSavedPairing, SavedPairing } from '@/utils/supabase/types'

/** Returns the current user's saved pairings (newest first). */
export async function getPairings(): Promise<SavedPairing[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('saved_pairings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getPairings error:', error.message)
    return []
  }
  return data as SavedPairing[]
}

/** Saves a new pairing for the current user. */
export async function savePairing(
  input: NewSavedPairing
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { error } = await supabase.from('saved_pairings').insert({
    user_id: user.id,
    tag: input.tag,
    heading_font: input.heading_font,
    body_font: input.body_font,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/tools/pairing')
  return { ok: true }
}

/** Deletes a pairing (RLS ensures users can only delete their own). */
export async function deletePairing(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { error } = await supabase.from('saved_pairings').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/tools/pairing')
  return { ok: true }
}
