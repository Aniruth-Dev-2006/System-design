'use client'

import styles from './Avatar.module.css'

export default function Avatar({ isSpeaking = false }) {
  return (
    <div className={styles.avatarContainer}>
      <div className={`${styles.imageWrapper} ${isSpeaking ? styles.speaking : ''}`}>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className={styles.avatarImage}
          src="https://future.co/images/homepage/glassy-orb/orb-purple.webm"
        />
      </div>
    </div>
  )
}
