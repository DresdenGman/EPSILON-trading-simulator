# Updated Features Description

## Overview
This document describes the major updates and new features added to the EPSILON Trading Simulator website, focusing on scroll-driven animations and enhanced user experience.

## Major Updates

### 1. Scroll Animation System
A complete scroll-driven animation system has been implemented using GSAP (GreenSock Animation Platform) and ScrollTrigger, inspired by modern portfolio websites like OVA Investment.

#### 1.1 Scroll Animation Components
Created a modular animation component system in `website/components/scroll-animations/`:

- **ScrollSection.tsx**: Wrapper component for sections that need scroll-triggered animations
- **HeroSection.tsx**: Hero section with title animation, subtitle fade-in, and parallax background effects
- **ImageFlow.tsx**: Horizontal image carousel with scroll-driven movement
- **TextReveal.tsx**: Text reveal animations with fade-in and slide-up effects
- **SideNavigation.tsx**: Side navigation with active section highlighting
- **ScrollProvider.tsx**: Client-side provider for ScrollTrigger initialization

#### 1.2 Hero Section Auto-Scrolling Background
- **Auto-scroll feature**: Background images automatically scroll horizontally when user is not actively scrolling
- **Dual-layer background**: Two background layers that transition smoothly based on scroll position
- **CSS variable control**: Uses CSS custom properties (`--bgsProgress`, `--bgEndProgress`) for smooth transitions
- **Immediate start**: Auto-scroll begins immediately on page load without delay
- **Scroll detection**: Automatically pauses when user scrolls, resumes when idle

#### 1.3 Portfolio Section Horizontal Scroll
- **Scroll-driven carousel**: Horizontal image gallery that moves based on vertical scroll position
- **Reduced sensitivity**: Optimized scroll sensitivity with `scrub: 4` and extended scroll distance
- **Image aspect ratio preservation**: Images maintain original aspect ratios with consistent height (75vh)
- **Adjacent image preview**: Shows edges of adjacent images (2nd and 4th images) when viewing the 3rd image
- **Smooth transitions**: Fade-in/fade-out and scale effects for individual images
- **Pin behavior**: Section pins during scroll for immersive experience

### 2. Text Reveal Animations
Enhanced text display with progressive reveal animations:

- **Early trigger**: Text animations start at `top 90%` (earlier than before) for more natural appearance
- **Extended animation range**: Animation spans from `top 90%` to `top 40%` for smoother transitions
- **Word-by-word animation**: Text with `data-split="words"` attribute animates word-by-word
- **CSS variable control**: Uses `--revealProgress` CSS variable for smooth opacity and transform transitions
- **Optimized scrub**: Increased scrub value to `1.5` for smoother animation

### 3. Navigation System

#### 3.1 Top Navigation Bar
- **Left side**: Contact and About US links
- **Right side**: EPSILON logo and Menu button
- **Full-screen menu**: Clicking Menu opens a full-screen overlay with all section links
- **Smooth transitions**: Menu opens/closes with smooth animations

#### 3.2 Side Navigation
- **Fixed position**: Right-side navigation bar that stays visible during scroll
- **Active section highlighting**: Automatically highlights current section based on scroll position
- **Progress indicator**: Visual progress bar showing scroll progress through sections
- **Smooth scrolling**: Clicking navigation items smoothly scrolls to target section
- **Optimized trigger**: Navigation updates at `top 60%` for more natural section detection

### 4. Section Transitions and Spacing

#### 4.1 Smooth Section Transitions
- **Gradient overlays**: Added gradient transitions between sections for visual continuity
- **Consistent padding**: Added `py-20` or `py-24` vertical padding to all sections
- **Gradient backgrounds**: Sections use gradient backgrounds (`from-white via-white to-gray-50`) for smooth transitions
- **Scroll margin**: Added `scroll-margin-top: 80px` for fixed navigation bar spacing

#### 4.2 Hero Section Fade-Out
- **Content fade-out**: Hero section title and text gradually fade out as user scrolls away
- **Smooth transitions**: Uses GSAP animations with scrub for scroll-linked effects
- **Background transition**: Background layers transition smoothly using CSS variables

### 5. Image Management

#### 5.1 Image Resources
- **18 high-quality images**: Added professional stock images from Pexels and Unsplash
- **Optimized loading**: Images use Next.js Image component with priority loading for above-the-fold content
- **Proper sizing**: Images sized appropriately with `sizes="100vw"` for responsive loading

#### 5.2 Image Display
- **Portfolio section**: Images displayed in horizontal scroll with consistent 75vh height
- **Aspect ratio preservation**: Images maintain original aspect ratios using `object-contain`
- **Edge preview**: Adjacent images visible at edges for better visual context
- **Low opacity backgrounds**: Hero section images use 15% opacity for subtle background effect

### 6. Content Sections

#### 6.1 Section Structure
The homepage now includes 8 main sections:
1. **Hero** (01): Main landing section with auto-scrolling background
2. **Portfolio** (02): Horizontal image carousel
3. **About** (03): Company information with text reveal
4. **Purpose** (04): Mission statement with background images
5. **Features** (05): Feature highlights with animations
6. **Interface** (06): Screenshot showcase
7. **Downloads** (07): Video player, business plan download, and app download placeholders
8. **Contact** (08): Contact information

#### 6.2 Downloads Section
- **Video player**: Embedded video player for `epsilon-intro.mp4`
- **Business plan**: Download link for `epsilon-business-plan.pdf`
- **App downloads**: Placeholders for macOS, Windows, and Linux downloads

### 7. Performance Optimizations

#### 7.1 Animation Performance
- **ScrollTrigger refresh**: Automatic refresh on component mount and window resize
- **Cleanup**: Proper cleanup of GSAP animations and ScrollTriggers to prevent memory leaks
- **Passive scroll listeners**: Uses passive event listeners for better scroll performance
- **Will-change optimization**: CSS `will-change` property for smooth animations

#### 7.2 Code Organization
- **Modular components**: Animation logic separated into reusable components
- **TypeScript**: Full TypeScript support for type safety
- **Client-side rendering**: Proper use of `'use client'` directive for interactive components

### 8. Configuration Updates

#### 8.1 Dependencies
- **GSAP**: Added `gsap@^3.14.2` for animations
- **ScrollTrigger**: Integrated GSAP ScrollTrigger plugin
- **Next.js Image**: Optimized image loading and display

#### 8.2 Git Configuration
- **Updated .gitignore**: Added Node.js related ignores (node_modules, .next, out)
- **Environment files**: Added .env file patterns to gitignore
- **Project cleanup**: Removed test pages and reference files

## Technical Implementation Details

### GSAP ScrollTrigger Integration
- All animations use GSAP ScrollTrigger for scroll-driven effects
- Proper plugin registration with `gsap.registerPlugin(ScrollTrigger)`
- Context-based cleanup using `gsap.context()` for memory management

### CSS Variables for Animation Control
- `--bgsProgress`: Controls first background layer opacity
- `--bgEndProgress`: Controls second background layer opacity
- `--revealProgress`: Controls text reveal animation progress
- `--navProgress`: Controls navigation progress bar height

### Responsive Design
- Mobile-friendly navigation (hamburger menu)
- Responsive image sizing
- Adaptive text sizes for different screen sizes
- Touch-friendly interactions

## Browser Compatibility
- Modern browsers with ES6+ support
- CSS custom properties support required
- Smooth scrolling support recommended

## Future Enhancements
Potential improvements for future versions:
- WebGL effects for enhanced visual appeal
- Lenis smooth scrolling library integration
- More granular animation controls
- Performance monitoring and optimization
- Accessibility improvements (ARIA labels, keyboard navigation)
