import React, { useEffect, useState } from 'react'

type Props = {
  label: string
  member1: string
  member2: string
  onSave: (member1: string, member2: string) => void
  saving?: boolean
}

export default function SlotCard({ label, member1: initialMember1, member2: initialMember2, onSave, saving }: Props) {
  const [m1, setM1] = useState(initialMember1)
  const [m2, setM2] = useState(initialMember2)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sync props når data bliver gemt eller genindlæst
  useEffect(() => {
    setM1(initialMember1)
    setM2(initialMember2)
    setDirty(false)
    setSaved(false)
  }, [initialMember1, initialMember2])

  // Når vi har gemt færdig, vis grøn ramme kortvarigt
  useEffect(() => {
    if (!saving && dirty) {
      setDirty(false)
      setSaved(true)
      const timeout = setTimeout(() => setSaved(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [saving, dirty])

  function handleSave() {
    onSave(m1, m2) // sender værdierne tilbage til App.tsx
    setDirty(false)
  }

  const cardClass = [
    'rounded-xl border p-4 shadow-sm transition-colors',
    saved ? 'border-4 border-green-600' : 'border border-slate-200'
  ].join(' ')

  const inputClass =
    'w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none'

  return (
    <div className={cardClass}>
      <div className="mb-2 font-semibold text-slate-700">{label}</div>
      <input
        type="text"
        placeholder="Bartender 1"
        value={m1}
        onChange={(e) => {
          setM1(e.target.value)
          setDirty(true)
          setSaved(false)
        }}
        className={inputClass + ' mb-2'}
      />
      <input
        type="text"
        placeholder="Bartender 2"
        value={m2}
        onChange={(e) => {
          setM2(e.target.value)
          setDirty(true)
          setSaved(false)
        }}
        className={inputClass + ' mb-4'}
      />
      {dirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {saving ? 'Gemmer…' : 'Gem'}
        </button>
      )}
    </div>
  )
}