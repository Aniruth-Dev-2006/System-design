'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import styles from '../../page.module.css'
import { supabase } from '@/lib/supabase'

const Excalidraw = dynamic(
  async () => {
    const mod = await import('@excalidraw/excalidraw')
    return mod.Excalidraw
  },
  { ssr: false }
)

export default function ReportDetails({ params }) {
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase
        .from('interview_sessions')
        .select(`*, interview_links (title, level, duration_min)`)
        .eq('id', params.sessionId)
        .single()
      
      setSessionData(data)
      setLoading(false)
    }
    fetchSession()
  }, [params.sessionId])

  if (loading) return <div className={styles.container}><div className={styles.emptyState}>Loading...</div></div>
  if (!sessionData) return <div className={styles.container}><div className={styles.emptyState}>Session not found</div></div>

  const report = sessionData.report_json || {}
  const transcript = sessionData.transcript_json || []

  return (
    <div className={styles.container}>
      <Link href={`/admin/link/${sessionData.link_id}`} className={styles.linkBtn} style={{ width: 'fit-content', marginBottom: '-16px' }}>
        &larr; Back to Link Details
      </Link>
      
      <div className={styles.card}>
        <h2 className={styles.title}>Candidate Report: {sessionData.candidate_name || 'Anonymous'}</h2>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', color: '#a0a0a0', fontSize: '14px' }}>
          <div><strong>Status:</strong> {sessionData.status}</div>
          <div><strong>Score:</strong> {sessionData.score != null ? `${sessionData.score}/10` : 'N/A'}</div>
          <div><strong>Started:</strong> {sessionData.started_at ? new Date(sessionData.started_at).toLocaleString() : '-'}</div>
          <div><strong>Completed:</strong> {sessionData.completed_at ? new Date(sessionData.completed_at).toLocaleString() : '-'}</div>
        </div>

        {report.decision && (
          <div style={{ padding: '20px', background: report.decision.toLowerCase() === 'hire' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${report.decision.toLowerCase() === 'hire' ? '#bbf7d0' : '#fecaca'}`, borderRadius: '8px', marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: report.decision.toLowerCase() === 'hire' ? '#166534' : '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Decision: {report.decision}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>{report.feedback}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '32px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#111827', fontSize: '15px' }}>Strengths</h4>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>
              {report.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>No strengths recorded</li>}
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#111827', fontSize: '15px' }}>Areas for Improvement</h4>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>
              {report.weaknesses?.map((w, i) => <li key={i}>{w}</li>) || <li>No weaknesses recorded</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Final Architecture Diagram</h2>
        <div style={{ height: '500px', border: '1px solid #eaeaea', borderRadius: '8px', overflow: 'hidden', background: '#fafafa' }}>
          {sessionData.canvas_json ? (
            <Excalidraw
              initialData={{ elements: sessionData.canvas_json }}
              viewModeEnabled={true}
              zenModeEnabled={true}
            />
          ) : (
            <div className={styles.emptyState} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              No canvas data found
            </div>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Interview Transcript</h2>
        <div style={{ background: '#f9fafb', padding: '24px', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto', border: '1px solid #eaeaea' }}>
          {transcript.length === 0 ? (
            <div className={styles.emptyState}>No transcript recorded</div>
          ) : (
            transcript.map((msg, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <strong style={{ color: msg.role === 'agent' ? '#2563eb' : '#059669', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {msg.role === 'agent' ? 'Interviewer' : sessionData.candidate_name || 'Candidate'}
                </strong>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>{msg.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
