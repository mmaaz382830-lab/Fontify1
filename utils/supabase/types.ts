/**
 * Shared application types for Supabase rows.
 * Keep in sync with supabase/migrations.
 */

export interface SavedPairing {
  id: string
  user_id: string
  tag: string
  heading_font: string
  body_font: string
  created_at: string
}

export type NewSavedPairing = Pick<
  SavedPairing,
  'tag' | 'heading_font' | 'body_font'
>

export interface ScalePreset {
  id: string
  user_id: string
  name: string
  base: number
  ratio: number
  min_vw: number
  max_vw: number
  created_at: string
}

export type NewScalePreset = Pick<
  ScalePreset,
  'name' | 'base' | 'ratio' | 'min_vw' | 'max_vw'
>
