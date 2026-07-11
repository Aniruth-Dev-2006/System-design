'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    level: 'medium',
    durationMin: 30,
    problemDesc: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const { data, error } = await supabase
      .from('InterviewLink')
      .insert([{ id: crypto.randomUUID(), ...formData }])
      .select()

    if (error) {
      console.error('Error creating link:', error)
      alert('Failed to create link')
      setSubmitting(false)
    } else {
      if (data && data[0]) {
        router.push(`/admin/link/${data[0].id}`)
      }
    }
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Welcome to Workspace</h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>Create a new interview project to get started, or select an existing one from the sidebar.</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Create New Interview</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.formGroup}>
            <label>Interview Role / Title</label>
            <input 
              required
              placeholder="e.g. Senior Backend Engineer - Stripe"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Seniority Level</label>
              <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                <option value="easy">Junior (Easy)</option>
                <option value="medium">Mid-Level (Medium)</option>
                <option value="hard">Senior (Hard)</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Duration (Minutes)</label>
              <input 
                type="number" 
                min="5" 
                max="180" 
                required
                value={formData.durationMin}
                onChange={e => {
                  const val = parseInt(e.target.value)
                  setFormData({...formData, durationMin: isNaN(val) ? '' : val})
                }}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Custom Scenario Description (Optional)</label>
            <textarea 
              rows={4}
              placeholder="Leave blank to use a random problem from the selected level, or provide a specific system design scenario."
              value={formData.problemDesc}
              onChange={e => setFormData({...formData, problemDesc: e.target.value})}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Interview Link'}
          </button>
        </form>
      </div>
    </div>
  )
}
