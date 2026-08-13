export interface NavItem {
  id: string
  label: string
}

export interface SectionProps {
  id: string
  children: React.ReactNode
  className?: string
}

export interface ImageItem {
  src: string
  alt: string
  priority?: boolean
}

export interface FeatureItem {
  title: string
  description: string
}

export interface DownloadItem {
  platform: string
  emoji: string
  status: 'available' | 'coming-soon'
  onClick?: () => void
}

export interface ScrollAnimationConfig {
  trigger: string
  start?: string
  end?: string
  scrub?: number | boolean
  toggleActions?: string
}

export interface HeroAnimationRefs {
  titleRef: React.RefObject<HTMLHeadingElement>
  textRef: React.RefObject<HTMLParagraphElement>
  imageFlowRef: React.RefObject<HTMLDivElement>
}