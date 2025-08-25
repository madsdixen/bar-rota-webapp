import React, { useEffect, useState } from 'react'

type Props = {
  label: string
  member1: string
  member2: string
  onSave: (member1: string, member2: string) => void
  saving?: boolean
}

export default function SlotCard({
  label,
  member1: savedMember1,
  member2: savedMember2,
  onSave,
  saving,
}: Props) {
  const [m1, setM1] = useState(savedMember1)
  const [m2, setM2] = useState(savedMember2)

  // Dirty = lokale ændringer ift. senest gemte props
  const isDirty = m1 !== savedMember1 || m2 !== savedMember2

  // Grøn ramme KUN hvis de gemte (props) indeholder tekst
  const hasSavedText = Boolean(savedMember1?.trim() || savedMember2?.trim())

  // Sync lokale felter når props ændres (efter vellykket gem / reload)
  useEffect(() => {
    setM1(savedMember1)
    setM2(savedMember2)
  }, [savedMember1, savedMember2])

  const handleSave = () => {
    // Også gem når felter er tomme (=> opdateres til '' i DB)
    onSave(m1, m2)
  }

  const cardClass = [
    'rounded-2xl p-4 shadow-sm transition bg-white',
    hasSavedText ? 'border-2 border-green-500' : 'border border-slate-200 hover:shadow-md',
  ].join(' ')

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400'

  return (
    <div className={cardClass}>
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center rounded-lg bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
          {label}
        </span>

        {/* Gem: vises kun ved ændringer (også når felter er tømt) */}
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Gemmer…' : 'Gem'}
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

      {saving && !isDirty && (
        <div className="mt-3 text-xs text-slate-500">Gemmer…</div>
      )}
    </div>
  )
}