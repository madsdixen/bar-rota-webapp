import React, { useEffect, useState } from 'react'

type Props = {
  label: string
  member1: string
  member2: string
  onSave: (member1: string, member2: string) => void
  saving?: boolean
}

export default function SlotCard({ label, member1, member2, onSave, saving }: Props) {
  const [m1, setM1] = useState(member1)
  const [m2, setM2] = useState(member2)

  // Er der gemte data i dette slot? (baseret på props = senest gemte)
  const hasSavedData = Boolean(member1?.trim() || member2?.trim())
  // Er der ændringer i forhold til gemt tilstand?
  const isDirty = m1 !== member1 || m2 !== member2
  // Gem-knap skal også virke når man har tømt felterne (=> sletning i DB)
  const canSave = isDirty

  // Sync fra props kun når der IKKE er igangværende ændringer
  useEffect(() => {
    if (!isDirty) {
      setM1(member1)
      setM2(member2)
    }
  }, [member1, member2]) // bevidst ikke inkluderet isDirty i deps

  const handleSave = () => {
    if (!canSave) return
    onSave(m1.trim(), m2.trim()) // tomt => App.tsx sletter i DB
  }

  const cardClass = [
    "rounded-2xl p-4 shadow-sm transition",
    "bg-white",
    // Grøn, tyk ramme når der ER gemte data og ingen pending ændringer
    hasSavedData && !isDirty ? "border-2 border-green-500" : "border border-slate-200 hover:shadow-md"
  ].join(" ")

  const inputClass = [
    "w-full rounded-xl border px-3 py-2 outline-none",
    "bg-white focus:ring-2",
    "border-slate-300 focus:ring-sky-400"
  ].join(" ")

  return (
    <div className={cardClass}>
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center rounded-lg bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
          {label}
        </span>

        {/* Gem: vises kun når der er ændringer (også når felter er tømt) */}
        {canSave && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            Gem
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600">Bartender 1</label>
          <input
            className={inputClass}
            placeholder="Navn på Bartender 1"
            value={m1}
            onChange={(e) => setM1(e.target.value)}
          />
        </div>

        <span className="mt-6 text-slate-500">&</span>

        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600">Bartender 2</label>
          <input
            className={inputClass}
            placeholder="Navn på Bartender 2"
            value={m2}
            onChange={(e) => setM2(e.target.value)}
          />
        </div>
      </div>

      {saving && <div className="mt-3 text-xs text-slate-500">Gemmer…</div>}
    </div>
  )
}