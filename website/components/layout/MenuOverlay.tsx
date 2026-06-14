'use client'

import { NavItem } from '@/lib/types'
import styles from './MenuOverlay.module.css'

interface MenuOverlayProps {
  isOpen: boolean
  onClose: () => void
  items: NavItem[]
}

export default function MenuOverlay({ isOpen, onClose, items }: MenuOverlayProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
        <div className={styles.description}>
          EPSILON embodies a central promise. A promise which, in reality, is a declaration of intent: 
          to provide only the most valuable, the most promising and the most resilient trading education experience.
        </div>
        <div className={styles.divider} />
        <div className={styles.navList}>
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={onClose}
              className={styles.navLink}
            >
              {item.label} - {item.id.charAt(0).toUpperCase() + item.id.slice(1)}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}