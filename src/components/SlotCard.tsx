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

  // Sync når props ændres (efter succesfuldt gem)
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

  const inputStyle = [
    'w-full rounded-xl border px-3 py-2 outline-none',
    'bg-white focus:ring-2',
    hasSavedData ? 'border-2 border-green-500 focus:ring-green-400' : 'border border-slate-300 focus:ring-sky-400'
  ].join(' ')

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center rounded-lg bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
          {label}
        </span>

        {/* Gem: kun når der er ændringer og noget at gemme */}
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
            className={inputStyle}
            placeholder="Navn på Bartender 1"
            value={m1}
            onChange={(e) => setM1(e.target.value)}
          />
        </div>

        <span className="mt-6 text-slate-500">&</span>

        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600">Bartender 2</label>
          <input
            className={inputStyle}
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