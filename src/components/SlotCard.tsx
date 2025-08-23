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

  useEffect(() => { setM1(member1); setM2(member2) }, [member1, member2])

  useEffect(() => {
    const t = setTimeout(() => {
      if (m1 !== member1 || m2 !== member2) onSave(m1, m2)
    }, 300)
    return () => clearTimeout(t)
  }, [m1, m2])

  const isEmpty = !member1 && !member2

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <button
          onClick={onClear}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          disabled={isEmpty || saving}
        >
          Ryd
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Navn 1"
          value={m1}
          onChange={(e) => setM1(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Navn 2"
          value={m2}
          onChange={(e) => setM2(e.target.value)}
        />
      </div>
      {saving && <div className="mt-2 text-xs text-slate-500">Gemmer…</div>}
    </div>
  )
}