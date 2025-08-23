import React, { useEffect, useState } from 'react'

type Props = {
  label: string
  member1: string
  member2: string
  onSave: (member1: string, member2: string) => void
  onClear: () => void
  saving?: boolean
}

export default function SlotCard({ label, member1, member2, onSave, onClear, saving }: Props) {
  // Lokale felter
  const [m1, setM1] = useState(member1)
  const [m2, setM2] = useState(member2)
  // Redigerings-tilstand
  const [isEditing, setIsEditing] = useState(false)

  // Sync fra props når vi IKKE er i gang med at redigere
  useEffect(() => {
    if (!isEditing) {
      setM1(member1)
      setM2(member2)
    }
  }, [member1, member2, isEditing])

  // Klik i et felt starter redigering (og fremhæver kortet)
  const beginEdit = () => setIsEditing(true)

  const handleSave = () => {
    onSave(m1.trim(), m2.trim())
    setIsEditing(false) // afslut fremhævning efter gem
  }

  const isEmpty = !m1 && !m2

  return (
    <div
      className={[
        "rounded-2xl border bg-white/90 p-4 shadow-sm transition",
        "border-slate-200 ring-1 ring-transparent hover:shadow-md",
        isEditing ? "ring-2 ring-sky-400/60 shadow-md" : "hover:ring-sky-100"
      ].join(' ')}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center rounded-lg bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
          {label}
        </span>

        <div className="flex items-center gap-2">
          {/* Ryd er altid mulig (deaktiveret hvis tomt) */}
          <button
            onClick={() => {
              setM1('')
              setM2('')
              onClear()
              setIsEditing(false) // sikre at highlight forsvinder efter ryd
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            disabled={isEmpty || saving}
          >
            Ryd
          </button>

          {/* Gem vises kun i redigering */}
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            >
              Gem
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600">Bartender 1</label>
          <input
            className={[
              "w-full rounded-xl border px-3 py-2 outline-none",
              "border-slate-300 bg-white focus:ring-2",
              isEditing ? "focus:ring-sky-400" : "focus:ring-slate-200"
            ].join(' ')}
            placeholder="Navn på Bartender 1"
            value={m1}
            onFocus={beginEdit}          // klik/fokus => redigering
            onChange={(e) => setM1(e.target.value)}
            readOnly={!isEditing}        // tastning kun i edit-mode
          />
        </div>

        <span className="mt-6 text-slate-500">&</span>

        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600">Bartender 2</label>
          <input
            className={[
              "w-full rounded-xl border px-3 py-2 outline-none",
              "border-slate-300 bg-white focus:ring-2",
              isEditing ? "focus:ring-sky-400" : "focus:ring-slate-200"
            ].join(' ')}
            placeholder="Navn på Bartender 2"
            value={m2}
            onFocus={beginEdit}
            onChange={(e) => setM2(e.target.value)}
            readOnly={!isEditing}
          />
        </div>
      </div>

      {saving && <div className="mt-3 text-xs text-slate-500">Gemmer…</div>}
    </div>
  )
}