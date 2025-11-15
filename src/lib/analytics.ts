// Google Analytics 4 configuration and tracking functions

// GA4 Measurement ID - replace with your actual GA4 ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

// Initialize Google Analytics
// Define gtag function outside of any block to avoid ES5 strict mode issues
const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(args)
  }
}

export const initGA = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // Load Google Analytics script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.async = true
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    gtag('js', new Date())
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })

    // Make gtag globally available
    window.gtag = gtag
  }
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
    })
  }
}

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// SaaS-specific tracking events
export const trackContractUpload = (fileType: string, fileSize: number) => {
  trackEvent('contract_upload', 'engagement', fileType, fileSize)
}

export const trackAnalysisComplete = (analysisType: string, duration: number) => {
  trackEvent('analysis_complete', 'conversion', analysisType, duration)
}

export const trackFeatureUsage = (featureName: string) => {
  trackEvent('feature_usage', 'engagement', featureName)
}

export const trackUserSignup = (method: string) => {
  trackEvent('sign_up', 'conversion', method)
}

export const trackSubscription = (plan: string, value: number) => {
  trackEvent('purchase', 'conversion', plan, value)
}

// Declare global gtag type
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}