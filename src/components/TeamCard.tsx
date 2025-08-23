import React, { useState, useEffect } from 'react'
import type { Team } from '../types'

type Props = {
  team: Team
  onChange: (t: Team) => void
  onDelete: (id: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}

export default function TeamCard({ team, onChange, onDelete, dragHandleProps }: Props) {
  const [member1, setMember1] = useState(team.member1)
  const [member2, setMember2] = useState(team.member2)

  useEffect(() => {
    setMember1(team.member1)
    setMember2(team.member2)
  }, [team.member1, team.member2])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (member1 !== team.member1 || member2 !== team.member2) {
        onChange({ ...team, member1, member2 })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [member1, member2])

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        aria-label="Flyt"
        title="Træk for at flytte"
        className="cursor-grab rounded-xl border border-slate-200 px-2 py-2 text-sm hover:bg-slate-50 active:cursor-grabbing"
        {...dragHandleProps}
      >
        ☰
      </button>
      <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Navn 1"
          value={member1}
          onChange={(e) => setMember1(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Navn 2"
          value={member2}
          onChange={(e) => setMember2(e.target.value)}
        />
      </div>
      <button
        onClick={() => onDelete(team.id)}
        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
      >
        Slet
      </button>
    </div>
  )
}
