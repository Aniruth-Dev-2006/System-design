'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '../page.module.css'
import { supabase } from '@/lib/supabase'

export default function CandidatesPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase
        .from('InterviewSession')
        .select(`*, InterviewLink (title)`)
        .order('startedAt', { ascending: false })
      
      setSessions(data || [])
      setLoading(false)
    }

    fetchSessions()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>All Candidates</h2>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : sessions.length === 0 ? (
          <div className={styles.emptyState}>No candidates have started any interviews yet.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Interview Role</th>
                <th>Status</th>
                <th>Score</th>
                <th>Started At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr key={session.id}>
                  <td>{session.candidateName || 'Anonymous'}</td>
                  <td>{session.InterviewLink?.title || 'Unknown'}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '11px', 
                      fontWeight: 600,
                      background: session.status === 'completed' ? '#f0fdf4' : '#fffbeb',
                      color: session.status === 'completed' ? '#166534' : '#b45309',
                      border: `1px solid ${session.status === 'completed' ? '#bbf7d0' : '#fde68a'}`
                    }}>
                      {session.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{session.score != null ? `${session.score}/10` : '-'}</td>
                  <td>{session.startedAt ? new Date(session.startedAt).toLocaleString() : '-'}</td>
                  <td>
                    {session.status === 'completed' && (
                      <Link href={`/admin/report/${session.id}`} className={styles.linkBtn}>View Report</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
