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
  const [isEditing, setIsEditing] = useState(false)

  // Har slottet (props) data?
  const hasSavedData = Boolean(member1?.trim() || member2?.trim())
  // Skal Save vises? (kun i edit-mode og når der er noget at gemme)
  const canSave = isEditing && Boolean(m1?.trim() || m2?.trim())

  // Sync fra props når vi IKKE redigerer (så props kan låse felterne)
  useEffect(() => {
    if (!isEditing) {
      setM1(member1)
      setM2(member2)
    }
  }, [member1, member2, isEditing])

  const beginEdit = () => {
    // start fra seneste gemte værdier
    setM1(member1)
    setM2(member2)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!canSave) return
    onSave(m1.trim(), m2.trim())
    setIsEditing(false) // afslut highlight efter gem
  }

  const handleClear = () => {
    setM1('')
    setM2('')
    onClear()
    setIsEditing(false) // afslut highlight efter ryd
  }

  const readOnly = !isEditing
  const savedStyle =
    hasSavedData && !isEditing
      ? 'bg-green-50 border-green-300 ring-1 ring-green-200'
      : 'bg-white/90 border-slate-200 ring-1 ring-transparent hover:ring-sky-100'

  return (
    <div
      className={[
        'rounded-2xl p-4 shadow-sm transition',
        savedStyle,
        isEditing ? 'ring-2 ring-sky-400/60 shadow-md' : ''
      ].join(' ')}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center rounded-lg bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
          {label}
        </span>

        <div className="flex items-center gap-2">
          {/* Redigér: vises når der er gemte data og ikke i edit-mode */}
          {!isEditing && hasSavedData && (
            <button
              onClick={beginEdit}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              Redigér
            </button>
          )}

          {/* Ryd: vises når der er gemte data (altid) eller i edit-mode */}
          {(hasSavedData || isEditing) && (
            <button
              onClick={handleClear}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={saving}
            >
              Ryd
            </button>
          )}

          {/* Gem: kun i edit-mode og hvis der er noget at gemme */}
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
              'border-slate-300 bg-white',
              isEditing ? 'focus:ring-2 focus:ring-sky-400' : 'opacity-90'
            ].join(' ')}
            placeholder="Navn på Bartender 1"
            value={m1}
            onChange={(e) => setM1(e.target.value)}
            readOnly={readOnly}
            onFocus={() => { if (!isEditing) beginEdit() }}
          />
        </div>

        <span className="mt-6 text-slate-500">&</span>

        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600">Bartender 2</label>
          <input
            className={[
              'w-full rounded-xl border px-3 py-2 outline-none',
              'border-slate-300 bg-white',
              isEditing ? 'focus:ring-2 focus:ring-sky-400' : 'opacity-90'
            ].join(' ')}
            placeholder="Navn på Bartender 2"
            value={m2}
            onChange={(e) => setM2(e.target.value)}
            readOnly={readOnly}
            onFocus={() => { if (!isEditing) beginEdit() }}
          />
        </div>
      </div>

      {saving && <div className="mt-3 text-xs text-slate-500">Gemmer…</div>}
    </div>
  )
}