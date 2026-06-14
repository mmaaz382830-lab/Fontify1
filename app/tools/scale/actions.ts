'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { NewScalePreset, ScalePreset } from '@/utils/supabase/types'

/** Returns the current user's saved scale presets (newest first). */
export async function getPresets(): Promise<ScalePreset[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('scale_presets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getPresets error:', error.message)
    return []
  }
  return data as ScalePreset[]
}

/** Saves a new scale preset for the current user. */
export async function savePreset(
  input: NewScalePreset
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { error } = await supabase.from('scale_presets').insert({
    user_id: user.id,
    name: input.name,
    base: input.base,
    ratio: input.ratio,
    min_vw: input.min_vw,
    max_vw: input.max_vw,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/tools/scale')
  return { ok: true }
}

/** Deletes a preset (RLS ensures users can only delete their own). */
export async function deletePreset(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { error } = await supabase.from('scale_presets').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/tools/scale')
  return { ok: true }
}
