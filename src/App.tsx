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
  // Remove global saving, use per-slot saving state
  const [savingSlots, setSavingSlots] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

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

  // Helper to set per-slot saving state
  function setSlotSaving(slot: number, on: boolean) {
    setSavingSlots(prev => {
      const next = new Set(prev)
      if (on) next.add(slot)
      else next.delete(slot)
      return next
    })
  }

  async function saveSlot(slot_index: number, member1: string, member2: string) {
    setSlotSaving(slot_index, true)
    setError(null)
    const existing = bySlot[slot_index]

    // 🚫 Hvis begge felter er tomme: gem som "tomt" ved at fjerne posten for slot'et
    if (!member1.trim() && !member2.trim()) {
      // Optimistisk: fjern alle med slot_index fra lokal state
      setTeams(prev => prev.filter(t => t.slot_index !== slot_index))
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('slot_index', slot_index)
      if (error) setError(error.message)
      else setLastSavedAt(new Date().toLocaleTimeString())
      setSlotSaving(slot_index, false)
      return
    }

    // Ellers gem/indsæt normalt
    if (existing) {
      setTeams(prev => prev.map(t =>
        t.id === existing.id ? { ...t, member1, member2 } : t
      ))
      const { data, error } = await supabase
        .from('teams')
        .update({ member1, member2 })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) setError(error.message)
      else setLastSavedAt(new Date().toLocaleTimeString())
      if (data) setTeams(prev => prev.map(t => t.id === existing.id ? data as any : t))
    } else {
      const { data, error } = await supabase
        .from('teams')
        .upsert({ member1, member2, slot_index })
        .select()
        .single()
      if (error) setError(error.message)
      else setLastSavedAt(new Date().toLocaleTimeString())
      if (data) {
        setTeams(prev => [
          // fjern evt. gammel post for samme slot (inkl. evt. stale state)
          ...prev.filter(t => t.slot_index !== slot_index),
          data as any
        ])
      }
    }

    setSlotSaving(slot_index, false)
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-sky-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-sky-600/90"></div>
            <h1 className="text-lg font-semibold text-slate-800">Barvagt Planlægger til Mejlgade Kollektivet</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={load}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
            >
              Genindlæs
            </button>
            <span className="text-slate-500">{savingSlots.size ? 'Gemmer…' : 'Klar'}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
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
                  saving={savingSlots.has(idx)}
                />
              )
            })}
          </div>
        )}

        <footer className="mt-10 border-t border-slate-200/80 bg-white/70 backdrop-blur">
          <div className="mx-auto max-w-2xl px-4 py-4 text-xs text-slate-600 flex items-center justify-between">
            <span>
              {savingSlots.size ? 'Gemmer ændringer…' : (lastSavedAt ? `Sidst gemt kl. ${lastSavedAt}` : 'Klar')}
            </span>
            <span className="hidden sm:inline">Supabase (gratis) · GitHub Pages</span>
          </div>
        </footer>
      </main>
    </div>
  )
}