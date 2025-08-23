import React, { useEffect, useMemo, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from './lib/supabaseClient'
import type { Team } from './types'
import TeamCard from './components/TeamCard'

function SortableItem(props: { id: string; children: (dragHandleProps: any) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style}>
      {props.children({ ...attributes, ...listeners })}
    </div>
  )
}

export default function App() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) setError(error.message)
    setTeams(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addTeam() {
    setSaving(true)
    const nextOrder = (teams.at(-1)?.sort_order ?? -1) + 1
    const { data, error } = await supabase.from('teams').insert({
      member1: '',
      member2: '',
      sort_order: nextOrder
    }).select().single()
    if (error) setError(error.message)
    if (data) setTeams([...teams, data as Team])
    setSaving(false)
  }

  async function deleteTeam(id: string) {
    setSaving(true)
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) setError(error.message)
    setTeams(teams.filter(t => t.id !== id))
    setSaving(false)
  }

  async function updateTeam(updated: Team) {
    setSaving(true)
    const { data, error } = await supabase.from('teams')
      .update({ member1: updated.member1, member2: updated.member2 })
      .eq('id', updated.id)
      .select().single()
    if (error) setError(error.message)
    if (data) setTeams(teams.map(t => t.id === updated.id ? data as Team : t))
    setSaving(false)
  }

  async function persistOrder(newOrder: Team[]) {
    setSaving(true)
    // Batch update: run sequentially to keep it simple
    for (let i = 0; i < newOrder.length; i++) {
      const t = newOrder[i]
      const { error } = await supabase.from('teams')
        .update({ sort_order: i })
        .eq('id', t.id)
      if (error) {
        setError(error.message)
        break
      }
    }
    setSaving(false)
  }

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = teams.findIndex(t => t.id === active.id)
    const newIndex = teams.findIndex(t => t.id === over.id)
    const reordered = arrayMove(teams, oldIndex, newIndex).map((t, i) => ({ ...t, sort_order: i }))
    setTeams(reordered)
    persistOrder(reordered)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Barvagt Planlægger</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Genindlæs
          </button>
          <button
            onClick={addTeam}
            className="rounded-xl bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700"
          >
            + Tilføj team
          </button>
        </div>
      </header>

      <p className="mb-4 text-slate-600">
        Hvert team består af to personer og dækker <strong>1 time</strong>. Træk i ☰ for at ændre rækkefølgen.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Fejl: {error}
        </div>
      )}

      {loading ? (
        <div>Indlæser…</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={teams.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3">
              {teams.map((t) => (
                <SortableItem key={t.id} id={t.id}>
                  {(dragHandleProps: any) => (
                    <TeamCard
                      team={t}
                      onChange={updateTeam}
                      onDelete={deleteTeam}
                      dragHandleProps={dragHandleProps}
                    />
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <footer className="mt-8 text-sm text-slate-500">
        {saving ? 'Gemmer…' : 'Klar'} • Data persisteres i Supabase (gratis plan).
      </footer>
    </div>
  )
}
