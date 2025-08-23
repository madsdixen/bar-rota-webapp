import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import type { Team } from './types'
import SlotCard from './components/SlotCard'

const SLOT_COUNT = 12 // 16:00 .. 03:00

function slotLabel(idx: number) {
  const hour = (16 + idx) % 24
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(hour)}:00 – ${pad((hour + 1) % 24)}:00`
}

export default function App() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bySlot = useMemo(() => {
    const map: Record<number, Team | undefined> = {}
    for (const t of teams) map[t.slot_index] = t
    return map
  }, [teams])

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from('teams').select('*').order('slot_index')
    if (error) setError(error.message)
    setTeams(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function saveSlot(slot_index: number, member1: string, member2: string) {
    setSaving(true)
    const existing = bySlot[slot_index]
    if (existing) {
      const { data, error } = await supabase
        .from('teams')
        .update({ member1, member2 })
        .eq('id', existing.id)
        .select()
        .single()
      if (!error && data) setTeams(prev => prev.map(t => t.id === existing.id ? data as Team : t))
    } else {
      const { data, error } = await supabase
        .from('teams')
        .insert({ member1, member2, slot_index })
        .select()
        .single()
      if (!error && data) setTeams(prev => [...prev, data as Team])
    }
    setSaving(false)
  }

  async function clearSlot(slot_index: number) {
    const existing = bySlot[slot_index]
    if (!existing) return
    setSaving(true)
    await supabase.from('teams').delete().eq('id', existing.id)
    setTeams(prev => prev.filter(t => t.id !== existing.id))
    setSaving(false)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Barvagt Planlægger</h1>
        <button onClick={load} className="rounded-xl border px-3 py-2 text-sm">
          Genindlæs
        </button>
      </header>

      {loading ? (
        <div>Indlæser…</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: SLOT_COUNT }).map((_, idx) => {
            const t = bySlot[idx]
            return (
              <SlotCard
                key={idx}
                label={slotLabel(idx)}
                member1={t?.member1 || ''}
                member2={t?.member2 || ''}
                onSave={(m1, m2) => saveSlot(idx, m1, m2)}
                onClear={() => clearSlot(idx)}
                saving={saving}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}