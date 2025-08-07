export default function MinimalTest() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: '3rem',
        color: 'white',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        Inline Styles Test
      </h1>
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Card 1</h2>
          <p>This uses inline styles only</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Card 2</h2>
          <p className="text-gray-600">This uses Tailwind classes</p>
        </div>
        
        <div style={{
          background: '#EF4444',
          color: 'white',
          padding: '2rem',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Card 3</h2>
          <p>Red card with inline styles</p>
        </div>
      </div>
      
      <div style={{
        marginTop: '2rem',
        padding: '2rem',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0.5rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '1.25rem' }}>
          Card 1 and 3 should be styled (inline styles).
          <br />
          Card 2 will only be styled if Tailwind is working.
        </p>
      </div>
    </div>
  );
}
