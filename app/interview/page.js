'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import CanvasArea from '@/components/CanvasArea'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  const [canvasState, setCanvasState] = useState([])
  const [transcript, setTranscript] = useState([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [started, setStarted] = useState(false)
  const [theme, setTheme] = useState('light')
  const router = useRouter()

  const handleEndInterview = () => {
    // Serialize data and store it in sessionStorage
    const interviewData = {
      transcript,
      shapes: canvasState.shapes || [],
      bindings: canvasState.bindings || []
    }
    sessionStorage.setItem('interview_data', JSON.stringify(interviewData))
    router.push('/report')
  }

  const handleStart = () => {
    setStarted(true)
    // Send an initial system prompt to trigger the welcome message
    evaluateState([], "Hello, I am ready to begin the interview.")
  }

  const handleCanvasUpdate = async (payload) => {
    const canvasShapes = Array.isArray(payload) ? payload : (payload.shapes || [])
    const canvasBindings = Array.isArray(payload) ? [] : (payload.bindings || [])
    
    // Prevent evaluating state if the canvas elements haven't changed (e.g., just mouse panning)
    const newShapesStr = JSON.stringify(canvasShapes)
    const oldShapesStr = JSON.stringify(canvasState.shapes || [])
    if (newShapesStr === oldShapesStr) return
    
    setCanvasState({ shapes: canvasShapes, bindings: canvasBindings })
    
    if (canvasShapes.length > 0) {
      evaluateState({ shapes: canvasShapes, bindings: canvasBindings }, null)
    }
  }

  const handleUserMessage = async (text) => {
    setTranscript(prev => [...prev, { role: 'user', text }])
    evaluateState(canvasState, text)
  }

  const evaluateState = async (state, userText) => {
    try {
      const payloadShapes = Array.isArray(state) ? state : (state.shapes || [])
      const payloadBindings = Array.isArray(state) ? [] : (state.bindings || [])
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shapes: payloadShapes,
          bindings: payloadBindings,
          userText,
          transcript
        })
      })

      const data = await response.json()
      
      if (data.reply) {
        setTranscript(prev => [...prev, { role: 'agent', text: data.reply }])
        
        // Trigger TTS (Web Speech API)
        const utterance = new SpeechSynthesisUtterance(data.reply)
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error("Evaluation failed", error)
    }
  }

  return (
    <main className={`${styles.container} ${theme === 'dark' ? styles.darkTheme : ''}`}>
      <div className={styles.canvasWrapper}>
        <CanvasArea 
          onCanvasUpdate={handleCanvasUpdate} 
          onThemeChange={(t) => setTheme(t)}
        />
      </div>
      <div className={styles.sidebarWrapper}>
        <Sidebar 
          transcript={transcript} 
          isSpeaking={isSpeaking} 
          onUserMessage={handleUserMessage}
          started={started}
          onStart={handleStart}
        />
      </div>
      {started && (
        <button 
          className={styles.submitButton}
          onClick={handleEndInterview}
        >
          Submit
        </button>
      )}
    </main>
  )
}
