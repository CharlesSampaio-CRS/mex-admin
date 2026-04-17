import { useEffect, useState } from 'react'
import { apiAdminJobs, apiAdminTriggerJob, apiAdminJobExecutions } from '@/lib/api'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'
import { cn, formatRelative, formatDate } from '@/lib/utils'
import type { JobStatus, JobExecution } from '@/types'

function statusBadge(status: string) {
  if (status === 'running') return <Badge variant="info" size="sm" dot>running</Badge>
  if (status === 'success') return <Badge variant="success" size="sm" dot>success</Badge>
  if (status === 'error')   return <Badge variant="danger" size="sm" dot>error</Badge>
  return <Badge variant="default" size="sm" dot>idle</Badge>
}

function duration(ms?: number) {
  if (!ms) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function JobsPage() {
  const [jobs,       setJobs]       = useState<JobStatus[]>([])
  const [executions, setExecutions] = useState<JobExecution[]>([])
  const [selected,   setSelected]   = useState<string | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [loadingEx,  setLoadingEx]  = useState(false)
  const [triggering, setTriggering] = useState<string | null>(null)

  const loadJobs = () => {
    setLoading(true)
    apiAdminJobs()
      .then(d => setJobs(d.jobs))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const loadExecutions = async (jobName?: string) => {
    setLoadingEx(true)
    try {
      const d = await apiAdminJobExecutions(jobName)
      setExecutions(d.executions)
    } catch (e) { console.error(e) }
    finally { setLoadingEx(false) }
  }

  useEffect(() => {
    loadJobs()
    loadExecutions()
  }, [])

  const handleSelect = (jobId: string) => {
    const next = selected === jobId ? null : jobId
    setSelected(next)
    loadExecutions(next ?? undefined)
  }

  const trigger = async (jobId: string) => {
    setTriggering(jobId)
    try { await apiAdminTriggerJob(jobId) } catch (e) { console.error(e) }
    setTimeout(() => { loadJobs(); setTriggering(null) }, 1000)
  }

  return (
    <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-fore">Agendamentos e histórico de execuções</p>
        <Button variant="secondary" size="sm" onClick={() => { loadJobs(); loadExecutions(selected ?? undefined) }}>
          <IonIcon name="refresh-outline" size={14} /> Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Jobs list */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : jobs.map(job => (
            <button
              key={job.job_id}
              onClick={() => handleSelect(job.job_id)}
              className={cn(
                'w-full text-left rounded-lg border p-3 transition-all',
                selected === job.job_id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-foreground">{job.name}</p>
                {statusBadge(job.status)}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-fore">
                <span>{job.last_run ? formatRelative(job.last_run) : 'Nunca'}</span>
                <span>·</span>
                <span>{job.runs_today}x hoje</span>
              </div>
              {(job.last_error || job.error) && (
                <p className="text-xs text-destructive mt-1 truncate">{job.last_error ?? job.error}</p>
              )}
              <Button
                size="sm" variant="secondary"
                loading={triggering === job.job_id}
                onClick={e => { e.stopPropagation(); trigger(job.job_id) }}
                className="mt-2 text-[11px] h-6 px-2"
              >
                <IonIcon name="play-outline" size={11} /> Executar
              </Button>
            </button>
          ))}
        </div>

        {/* Execution history */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <IonIcon name="time-outline" size={15} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  {selected ? `Histórico — ${jobs.find(j => j.job_id === selected)?.name}` : 'Todas as execuções'}
                </p>
                {loadingEx && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-auto" />}
              </div>
            </CardHeader>
            <CardBody className="p-0 overflow-y-auto max-h-[500px]">
              {executions.length === 0 && !loadingEx ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-fore">
                  <IonIcon name="document-outline" size={32} className="opacity-20 mb-2" />
                  <p className="text-xs">Nenhuma execução registrada</p>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-2 text-muted-fore font-semibold">Job</th>
                      <th className="text-left px-4 py-2 text-muted-fore font-semibold">Status</th>
                      <th className="text-left px-4 py-2 text-muted-fore font-semibold">Início</th>
                      <th className="text-right px-4 py-2 text-muted-fore font-semibold">Duração</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {executions.map(ex => (
                      <tr key={ex.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-foreground">{ex.job_name}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-col gap-0.5">
                            {statusBadge(ex.status)}
                            {ex.error_msg && (
                              <p className="text-[10px] text-destructive truncate max-w-[140px]" title={ex.error_msg}>{ex.error_msg}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-muted-fore">{formatDate(ex.started_at)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-muted-fore">{duration(ex.duration_ms)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
