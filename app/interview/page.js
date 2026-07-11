'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function InterviewValidationPage() {
  const router = useRouter()
  const [linkInput, setLinkInput] = useState('')
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(false)

  const handleValidate = async (e) => {
    e.preventDefault()
    if (!linkInput.trim()) return

    setValidating(true)
    setError('')
    
    try {
      // Extract the ID if the user pastes the full URL
      let linkId = linkInput.trim()
      if (linkId.includes('/interview/')) {
        linkId = linkId.split('/interview/')[1].split('?')[0].split('#')[0]
      }

      // Query the database to check if the link is valid
      const { data, error } = await supabase
        .from('InterviewLink')
        .select('id')
        .eq('id', linkId)
        .single()

      if (error || !data) {
        setError('Invalid Interview Link or ID. Please check and try again.')
      } else {
        router.push(`/interview/${data.id}`)
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred while validating the link.')
    } finally {
      setValidating(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f9fafb', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '48px 40px', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.05)', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="https://xobin.com/wp-content/uploads/2026/04/logo-CQAmVy86.png" alt="Xobin" style={{ width: '120px', marginBottom: '32px' }} />
        
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0', textAlign: 'center' }}>Join Interview</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 32px 0', textAlign: 'center' }}>Please paste your unique interview link or ID provided by your recruiter.</p>
        
        <form onSubmit={handleValidate} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="text" 
            placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '15px',
              color: '#111827',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#111827'}
            onBlur={e => e.target.style.borderColor = '#d1d5db'}
          />
          {error && <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
          <button 
            type="submit" 
            disabled={validating}
            style={{
              width: '100%',
              padding: '14px',
              background: '#111827',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: validating ? 'not-allowed' : 'pointer',
              opacity: validating ? 0.7 : 1,
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.target.style.background = '#374151'}
            onMouseOut={e => e.target.style.background = '#111827'}
          >
            {validating ? 'Validating...' : 'Continue'}
          </button>
        </form>
      </div>
    </main>
  )
}
