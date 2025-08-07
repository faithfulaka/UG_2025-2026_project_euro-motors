// Emergency CSS fix - adds inline styles as fallback
// Place this in any component that needs emergency styling

export const emergencyStyles = {
  // Container
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  
  // Navigation
  navbar: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 50,
    padding: '1rem 0'
  },
  
  navLink: {
    padding: '0.5rem 1rem',
    color: '#374151',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'color 0.2s'
  },
  
  navLinkHover: {
    color: '#dc2626'
  },
  
  // Hero Section
  hero: {
    position: 'relative' as const,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },
  
  heroOverlay: {
    position: 'absolute' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  
  heroContent: {
    position: 'relative' as const,
    zIndex: 10,
    textAlign: 'center' as const,
    color: 'white',
    padding: '2rem'
  },
  
  // Typography
  h1: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    lineHeight: 1.2
  },
  
  h2: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    lineHeight: 1.3
  },
  
  h3: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    lineHeight: 1.4
  },
  
  // Buttons
  btnPrimary: {
    display: 'inline-block',
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none'
  },
  
  btnSecondary: {
    display: 'inline-block',
    backgroundColor: '#374151',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none'
  },
  
  // Cards
  carCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.3s',
    cursor: 'pointer'
  },
  
  carCardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
  },
  
  carCardImage: {
    width: '100%',
    height: '250px',
    objectFit: 'cover' as const
  },
  
  carCardContent: {
    padding: '1.5rem'
  },
  
  carCardTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: '#111827'
  },
  
  carCardPrice: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#dc2626',
    marginBottom: '1rem'
  },
  
  // Grid layouts
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    padding: '1.5rem'
  },
  
  // Flex layouts
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  // Footer
  footer: {
    backgroundColor: '#111827',
    color: 'white',
    padding: '3rem 0',
    marginTop: 'auto'
  },
  
  // Gallery
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block'
  },
  
  // Forms
  formInput: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: '#374151'
  }
};

// Usage example:
// <div style={emergencyStyles.container}>
//   <h1 style={emergencyStyles.h1}>Title</h1>
//   <button style={emergencyStyles.btnPrimary}>Click Me</button>
// </div>
