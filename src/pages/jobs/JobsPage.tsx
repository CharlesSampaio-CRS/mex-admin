import { useEffect, useState } from 'react'
import { apiAdminJobs, apiAdminTriggerJob } from '@/lib/api'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'
import type { JobStatus } from '@/types'
import { formatRelative } from '@/lib/utils'

function JobIcon({ status }: { status: string }) {
  if (status === 'running') return <IonIcon name="time-outline" size={16} className="text-blue-400 animate-spin" />
  if (status === 'success') return <IonIcon name="checkmark-circle-outline" size={16} className="text-green-400" />
  if (status === 'error')   return <IonIcon name="close-circle-outline" size={16} className="text-red-400" />
  return <IonIcon name="alert-circle-outline" size={16} className="text-gray-400" />
}

export function JobsPage() {
  const [jobs, setJobs] = useState<JobStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState<string | null>(null)

  const load = () => {
    apiAdminJobs()
      .then(d => setJobs(d.jobs))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const trigger = async (jobId: string) => {
    setTriggering(jobId)
    try { await apiAdminTriggerJob(jobId) } catch (e) { console.error(e) }
    setTimeout(() => { load(); setTriggering(null) }, 800)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Status dos jobs agendados</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}>Atualizar</Button>
      </div>

      <div className="space-y-3">
        {jobs.map(job => (
          <Card key={job.job_id}>
            <CardBody className="flex items-center gap-4">
              <JobIcon status={job.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{job.name}</p>
                  <Badge
                    variant={job.status === 'success' ? 'success' : job.status === 'error' ? 'danger' : job.status === 'running' ? 'info' : 'default'}
                    size="sm"
                  >
                    {job.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {job.last_run ? `Último: ${formatRelative(job.last_run)}` : 'Nunca executado'}
                  {job.next_run ? ` · Próximo: ${formatRelative(job.next_run)}` : ''}
                </p>
                {(job.last_error || job.error) && (
                  <p className="text-xs text-red-400 mt-1 truncate">{job.last_error ?? job.error}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="secondary"
                loading={triggering === job.job_id}
                onClick={() => trigger(job.job_id)}
              >
                <IonIcon name="play-outline" size={12} className="mr-1" />
                Executar
              </Button>
            </CardBody>
          </Card>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <IonIcon name="alert-circle-outline" size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum job encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
