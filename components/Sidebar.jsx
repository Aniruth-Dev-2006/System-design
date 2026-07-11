'use client'

import { useRef, useEffect } from 'react'
import Avatar from './Avatar'
import VoiceControl from './VoiceControl'
import styles from './Sidebar.module.css'

export default function Sidebar({ transcript, isSpeaking, onUserMessage, started, onStart, onEndInterview }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript])

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2>System Design Interview</h2>
        <span className={styles.statusBadge}>Live</span>
      </div>
      
      <Avatar isSpeaking={isSpeaking} />
      
      <div className={styles.transcriptArea} ref={scrollRef}>
        {!started ? (
          <div className={styles.startOverlay}>
            <button className={styles.startButton} onClick={onStart}>Start Interview</button>
          </div>
        ) : (
          transcript.map((msg, idx) => (
            <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
              <strong>{msg.role === 'agent' ? 'AI Interviewer' : 'You'}: </strong>
              {msg.text}
            </div>
          ))
        )}
      </div>
      
      <VoiceControl onUserMessage={onUserMessage} />
    </div>
  )
}
