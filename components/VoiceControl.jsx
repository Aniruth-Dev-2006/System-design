'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './VoiceControl.module.css'

export default function VoiceControl({ onUserMessage }) {
  const [isRecording, setIsRecording] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef(null)
  
  const onUserMessageRef = useRef(onUserMessage)
  useEffect(() => {
    onUserMessageRef.current = onUserMessage
  }, [onUserMessage])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let final = ''
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript
          } else {
            interim += event.results[i][0].transcript
          }
        }
        
        setInterimText(interim)
        
        if (final) {
          onUserMessageRef.current(final)
          setInterimText('')
          recognition.stop()
          setIsRecording(false)
        }
      }

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error', event.error)
        }
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const toggleRecording = () => {
    if (isRecording) {
      // If user stops manually, flush the interim text as a final message if any
      if (interimText.trim().length > 0) {
        onUserMessageRef.current(interimText)
        setInterimText('')
      }
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      setInterimText('')
      recognitionRef.current?.start()
      setIsRecording(true)
    }
  }

  return (
    <div className={styles.controlContainer}>
      {interimText && (
        <div className={styles.interimText}>
          "{interimText}"
        </div>
      )}
      
      <div className={styles.micWrapper}>
        <button 
          type="button"
          className={`${styles.micButton} ${isRecording ? styles.recording : ''}`}
          onClick={toggleRecording}
          title="Tap to Speak"
        >
          <div className={styles.buttonContent}>
            {isRecording ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
                </svg>
                Stop Recording
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                Tap to Speak
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
