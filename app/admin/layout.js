'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './layout.module.css'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children }) {
  const [links, setLinks] = useState([])
  const pathname = usePathname()

  useEffect(() => {
    const fetchLinks = async () => {
      const { data } = await supabase
        .from('interview_links')
        .select('id, title')
        .order('created_at', { ascending: false })
      setLinks(data || [])
    }
    fetchLinks()
  }, [pathname]) // Re-fetch occasionally

  return (
    <div className={styles.adminLayout}>
      {/* Primary Sidebar (Slim) */}
      <aside className={styles.primarySidebar}>
        <div className={styles.logoWrapper}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
        </div>
        <nav className={styles.primaryNav}>
          <Link href="/admin" className={`${styles.iconLink} ${pathname === '/admin' ? styles.activeIcon : ''}`} title="Dashboard">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </Link>
          <Link href="/admin/candidates" className={`${styles.iconLink} ${pathname === '/admin/candidates' ? styles.activeIcon : ''}`} title="All Candidates">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </Link>
          <div className={styles.iconLink} style={{ marginTop: 'auto', opacity: 0.5, cursor: 'not-allowed' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </div>
        </nav>
      </aside>

      {/* Secondary Sidebar (Projects/Links List) */}
      <aside className={styles.secondarySidebar}>
        <div className={styles.searchWrapper}>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="#9ca3af" strokeWidth="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search..." className={styles.searchInput} />
        </div>
        
        <div className={styles.sidebarSection}>
          <div className={styles.sectionHeader}>ALL INTERVIEWS</div>
          <div className={styles.projectList}>
            {links.map(link => {
              const isActive = pathname === `/admin/link/${link.id}`
              return (
                <Link key={link.id} href={`/admin/link/${link.id}`} className={`${styles.projectLink} ${isActive ? styles.activeProject : ''}`}>
                  <div className={styles.projectIcon}>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <span className={styles.projectTitle}>{link.title}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>Workspace</div>
          <div className={styles.headerUser}>
            <div className={styles.avatar}>A</div>
          </div>
        </header>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  )
}
