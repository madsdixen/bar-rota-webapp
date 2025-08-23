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
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('slot_index', { ascending: true })
    if (error) setError(error.message)
    setTeams(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function saveSlot(slot_index: number, member1: string, member2: string) {
  setSaving(true)
  setError(null)
  const existing = bySlot[slot_index]

  // 🚫 Hvis begge felter er tomme: betragt det som "slet slot"
  if (!member1.trim() && !member2.trim()) {
    if (existing) {
      const { error } = await supabase.from('teams').delete().eq('id', existing.id)
      if (error) setError(error.message)
      setTeams(prev => prev.filter(t => t.id !== existing.id))
    }
    setSaving(false)
    return
  }

  // Ellers gem/indsæt normalt
  if (existing) {
    const { data, error } = await supabase
      .from('teams')
      .update({ member1, member2 })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) setError(error.message)
    if (data) setTeams(prev => prev.map(t => t.id === existing.id ? data as any : t))
  } else {
    const { data, error } = await supabase
      .from('teams')
      .insert({ member1, member2, slot_index })
      .select()
      .single()
    if (error) setError(error.message)
    if (data) setTeams(prev => [...prev, data as any])
  }

  setSaving(false)
}

  async function clearSlot(slot_index: number) {
    const existing = bySlot[slot_index]
    if (!existing) return
    setSaving(true)
    const { error } = await supabase.from('teams').delete().eq('id', existing.id)
    if (error) setError(error.message)
    setTeams(prev => prev.filter(t => t.id !== existing.id))
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-sky-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-sky-600/90"></div>
            <h1 className="text-lg font-semibold text-slate-800">Barvagt Planlægger</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={load}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
            >
              Genindlæs
            </button>
            <span className="text-slate-500">{saving ? 'Gemmer…' : 'Klar'}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="mb-5 text-slate-600">
          Udfyld <strong>Bartender 1</strong> og <strong>Bartender 2</strong> for hvert timeslot fra
          <strong> 16:00</strong> til <strong>03:00</strong>. Ændringer gemmes automatisk.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Fejl: {error}
          </div>
        )}

        {loading ? (
          <div>Indlæser…</div>
        ) : (
          <div className="flex flex-col gap-4">
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

        <div className="mt-10 text-center text-xs text-slate-500">
          Hostet gratis på GitHub Pages • Data i Supabase (gratis plan)
        </div>
      </main>
    </div>
  )
}