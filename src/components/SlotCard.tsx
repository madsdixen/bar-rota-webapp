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

  useEffect(() => {
    setM1(member1)
    setM2(member2)
  }, [member1, member2])

  useEffect(() => {
    const t = setTimeout(() => {
      if (m1 !== member1 || m2 !== member2) onSave(m1, m2)
    }, 250)
    return () => clearTimeout(t)
  }, [m1, m2])

  const isEmpty = !member1 && !member2

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm ring-1 ring-transparent transition hover:shadow-md hover:ring-sky-100">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center rounded-lg bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
          {label}
        </span>
        <button
          onClick={onClear}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          disabled={isEmpty || saving}
        >
          Ryd
        </button>
      </div>

      <div className="grid gap-3">
        <label className="text-xs font-medium text-slate-600" htmlFor={`${label}-bartender1`}>
          Bartender 1
        </label>
        <input
          id={`${label}-bartender1`}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Navn på Bartender 1"
          value={m1}
          onChange={(e) => setM1(e.target.value)}
        />

        <label className="mt-2 text-xs font-medium text-slate-600" htmlFor={`${label}-bartender2`}>
          Bartender 2
        </label>
        <input
          id={`${label}-bartender2`}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Navn på Bartender 2"
          value={m2}
          onChange={(e) => setM2(e.target.value)}
        />
      </div>

      {saving && <div className="mt-3 text-xs text-slate-500">Gemmer…</div>}
    </div>
  )
}