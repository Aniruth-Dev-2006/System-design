'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './InteractiveOrb.module.css'

export default function InteractiveOrb({ onUserMessage }) {
  const [isRecording, setIsRecording] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef(null)
  const videoRef = useRef(null)
  
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
      // Stop recording
      if (interimText.trim().length > 0) {
        onUserMessageRef.current(interimText)
        setInterimText('')
      }
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      // Start recording
      setInterimText('')
      recognitionRef.current?.start()
      setIsRecording(true)
    }
  }

  // Handle video play/pause based on recording state
  useEffect(() => {
    if (videoRef.current) {
      if (isRecording) {
        videoRef.current.play().catch(e => console.warn("Video play failed", e))
      } else {
        videoRef.current.pause()
      }
    }
  }, [isRecording])

  return (
    <div className={styles.orbContainer}>
      <button 
        type="button" 
        className={`${styles.orbButton} ${isRecording ? styles.recording : ''}`}
        onClick={toggleRecording}
        title={isRecording ? "Mute" : "Unmute"}
      >
        <video 
          ref={videoRef}
          loop 
          muted 
          playsInline 
          className={styles.orbVideo}
          src="https://cdn.dribbble.com/userupload/15697531/file/original-0242acdc69146d4472fc5e69b48616dc.mp4"
        />
      </button>

      {interimText && (
        <div className={styles.interimText}>
          "{interimText}"
        </div>
      )}
    </div>
  )
}
