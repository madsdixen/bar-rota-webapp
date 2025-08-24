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
  const [m1, setM1] = useState(member1)
  const [m2, setM2] = useState(member2)

  // Sync inputs når parent-props ændrer sig (efter gem/slet)
  useEffect(() => {
    setM1(member1)
    setM2(member2)
  }, [member1, member2])

  const hasSavedData = Boolean(member1?.trim() || member2?.trim())
  const isDirty = m1 !== member1 || m2 !== member2
  const canSave = isDirty && Boolean(m1?.trim() || m2?.trim())

  const handleSave = () => {
    if (!canSave) return
    onSave(m1.trim(), m2.trim())
  }

  const handleClear = () => {
    setM1('')
    setM2('')
    onClear() // App.tsx sletter i DB via saveSlot(...,'','')
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center rounded-lg bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
          {label}
        </span>

        <div className="flex items-center gap-2">
          {/* Ryd vises hvis der er noget gemt eller noget skrevet */}
          {(hasSavedData || m1 || m2) && (
            <button
              onClick={handleClear}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={saving}
            >
              Ryd
            </button>
          )}

          {/* Gem vises kun når der er ændringer og mindst ét felt udfyldt */}
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
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600">Bartender 1</label>
          <input
            className={[
              'w-full rounded-xl border px-3 py-2 outline-none',
              'border-slate-300 bg-white focus:ring-2',
              isDirty ? 'focus:ring-amber-400' : 'focus:ring-sky-400'
            ].join(' ')}
            placeholder="Navn på Bartender 1"
            value={m1}
            onChange={(e) => setM1(e.target.value)}
          />
        </div>

        <span className="mt-6 text-slate-500">&</span>

        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600">Bartender 2</label>
          <input
            className={[
              'w-full rounded-xl border px-3 py-2 outline-none',
              'border-slate-300 bg-white focus:ring-2',
              isDirty ? 'focus:ring-amber-400' : 'focus:ring-sky-400'
            ].join(' ')}
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