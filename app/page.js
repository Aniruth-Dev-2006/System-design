'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Landing.module.css'

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = ['/slide_new_1.png', '/slide_new_2.png', '/slide_new_3.png']

  const testimonials = [
    {
      quote: "The real-time feedback completely changed how I approach distributed systems. I landed an L5 offer at Google a week after practicing here.",
      author: "Sarah J.",
      role: "Senior Software Engineer"
    },
    {
      quote: "It actually feels like you're talking to a Staff Engineer. The follow-up questions caught edge cases I didn't even know existed.",
      author: "Michael T.",
      role: "Backend Developer"
    },
    {
      quote: "Drawing the architecture on the digital whiteboard while the AI evaluated my choices was the exact preparation I needed for my Meta onsite.",
      author: "David L.",
      role: "Systems Engineer"
    },
    {
      quote: "Worth every minute. It eliminated my interview anxiety because I knew exactly what level of detail the interviewers expected.",
      author: "Emily R.",
      role: "Technical Lead"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div className={styles.container}>
      {/* Background Glow */}
      <div className={styles.backgroundGlow} />

      <div className={styles.contentWrapper}>
        {/* Navbar */}
        <nav className={styles.navbar}>
          <Link href="/" className={styles.logo}>
            AI Interviewer
          </Link>
          <div className={styles.navLinks}>
            <Link href="#" className={styles.navLink}>Home</Link>
            <Link href="#features" className={styles.navLink}>Features</Link>
            <Link href="#testimonials" className={styles.navLink}>Testimonials</Link>
          </div>
          <Link href="/interview" className={styles.signUpBtn}>
            Start Interview
            <span>→</span>
          </Link>
        </nav>

        {/* Hero Section */}
        <main className={styles.hero}>
          {/* Hero Left: Content */}
          <div className={styles.heroLeft}>
            <div className={styles.socialProof}>
              <div className={styles.stars}>
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              Rated 4.9/5 by 2700+ candidates
            </div>
            
            <h1 className={styles.headline}>
              Master your system<br />design interviews
            </h1>
            
            <p className={styles.subheadline}>
              Practice with an elite AI engineering manager. Draw architectures on a digital whiteboard, get real-time feedback, and land your dream job at a top-tier tech company.
            </p>
            
            <div className={styles.ctaWrapper}>
              <Link href="/interview" className={styles.primaryCta}>
                Get Started Now
                <div className={styles.ctaArrow}>→</div>
              </Link>
            </div>
          </div>

          {/* Hero Right: Orb Video */}
          <div className={styles.heroRight}>
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className={styles.orbVideo}
              src="https://future.co/images/homepage/glassy-orb/orb-purple.webm"
            />
          </div>
        </main>

        {/* Features Section */}
        <section id="features" className={styles.featuresSection}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.featuresTitle}>Experience the Interview</h2>
            <p className={styles.featuresSubtitle}>
              Our AI evaluates your architecture in real-time as you draw on the whiteboard, simulating a real Staff-level engineering interview at top-tier companies.
            </p>
          </div>

          <div className={styles.mockupContainer}>
            <div className={styles.motionalVideoWrapper}>
              {slides.map((slide, index) => (
                <img 
                  key={slide}
                  src={slide}
                  alt={`Walkthrough Step ${index + 1}`}
                  className={`${styles.mockupImage} ${styles.motionalSlide} ${currentSlide === index ? styles.activeSlide : ''}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className={styles.testimonialsSection}>
          <h2 className={styles.sectionTitle}>Success Stories</h2>
          <div className={styles.testimonialsMarqueeWrapper}>
            <div className={styles.testimonialsMarqueeContent}>
              {testimonials.map((test, i) => (
                <div key={`test1-${i}`} className={styles.testimonialCard}>
                  <div className={styles.stars}>
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <p className={styles.testimonialQuote}>"{test.quote}"</p>
                  <div className={styles.testimonialAuthor}>
                    <strong>{test.author}</strong>
                    <span>{test.role}</span>
                  </div>
                </div>
              ))}
              {/* Duplicate for infinite loop */}
              {testimonials.map((test, i) => (
                <div key={`test2-${i}`} className={styles.testimonialCard}>
                  <div className={styles.stars}>
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <p className={styles.testimonialQuote}>"{test.quote}"</p>
                  <div className={styles.testimonialAuthor}>
                    <strong>{test.author}</strong>
                    <span>{test.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Logos */}
        <footer className={styles.footerLogos}>
          <span className={styles.footerTitle}>Trusted by engineers from top-tier product companies</span>
          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeContent}>
              <span className={styles.companyName}>Google</span>
              <span className={styles.companyName}>Meta</span>
              <span className={styles.companyName}>Amazon</span>
              <span className={styles.companyName}>Netflix</span>
              <span className={styles.companyName}>Apple</span>
              <span className={styles.companyName}>Uber</span>
              <span className={styles.companyName}>Stripe</span>
              <span className={styles.companyName}>Airbnb</span>
              {/* Duplicate for infinite loop */}
              <span className={styles.companyName}>Google</span>
              <span className={styles.companyName}>Meta</span>
              <span className={styles.companyName}>Amazon</span>
              <span className={styles.companyName}>Netflix</span>
              <span className={styles.companyName}>Apple</span>
              <span className={styles.companyName}>Uber</span>
              <span className={styles.companyName}>Stripe</span>
              <span className={styles.companyName}>Airbnb</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
