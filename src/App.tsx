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

  useEffect(() => {
    load()
  }, [])

  function setSlotSaving(slot: number, on: boolean) {
    setSavingSlots(prev => {
      const next = new Set(prev)
      on ? next.add(slot) : next.delete(slot)
      return next
    })
  }

  // Gem ALTID via upsert – også når felterne er tomme.
  // Tomt => gemmes som '' i DB, så reload ikke bringer gamle navne tilbage.
  async function saveSlot(slot_index: number, member1: string, member2: string) {
    setSlotSaving(slot_index, true)
    setError(null)

    const m1 = member1.trim()
    const m2 = member2.trim()

    const { data, error } = await supabase
      .from('teams')
      .upsert(
        { slot_index, member1: m1, member2: m2 },
        { onConflict: 'slot_index' } // <- VIGTIGT: peg på unik kolonne
      )
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      setLastSavedAt(new Date().toLocaleTimeString())
      if (data) {
        setTeams(prev => [
          ...prev.filter(t => t.slot_index !== slot_index),
          data as any,
        ].sort((a, b) => a.slot_index - b.slot_index))
      }
    }

    setSlotSaving(slot_index, false)
  }

  return (
  <div
    className="min-h-screen bg-cover bg-center relative"
    style={{ backgroundImage: "url('/bg.jpg')" }}
  >
    {/* Lys overlay for bedre læsbarhed */}
    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

    {/* Alt indhold skal ligge ovenpå overlay */}
    <div className="relative">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-sky-600/90"></div>
            <h1 className="text-lg font-semibold text-slate-800">
              Barvagt Planlægger
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={load}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
            >
              Genindlæs
            </button>
            <span className="text-slate-500">
              {savingSlots.size ? 'Gemmer…' : 'Klar'}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="mb-5 text-slate-600">
          Skriv jer på hvornår I vil stå i bar og tryk <strong>Gem</strong>!
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
                  member1={t?.member1 ?? ''}
                  member2={t?.member2 ?? ''}
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
              {savingSlots.size
                ? 'Gemmer ændringer…'
                : lastSavedAt
                ? `Sidst gemt kl. ${lastSavedAt}`
                : 'Klar'}
            </span>
            <span className="hidden sm:inline">Supabase (gratis) · GitHub Pages</span>
          </div>
        </footer>
      </main>
    </div>
  </div>
)
}