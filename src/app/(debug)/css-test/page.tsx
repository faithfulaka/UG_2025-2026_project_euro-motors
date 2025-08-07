'use client';

import { useEffect, useState } from 'react';

export default function CSSTestPage() {
  const [diagnostics, setDiagnostics] = useState<any>({
    loading: true,
    tailwindDetected: false,
    stylesheetsCount: 0,
    imagesCount: 0,
    errors: []
  });

  useEffect(() => {
    // Diagnostic checks
    const runDiagnostics = () => {
      const errors: string[] = [];
      
      // Check for Tailwind
      const tailwindDetected = 
        !!document.querySelector('[class*="bg-"]') ||
        !!document.querySelector('[class*="text-"]') ||
        !!document.querySelector('[class*="p-"]');
      
      // Check stylesheets
      const stylesheets = Array.from(document.styleSheets);
      const stylesheetsInfo = stylesheets.map(sheet => {
        try {
          return {
            href: sheet.href,
            rules: sheet.cssRules?.length || 0,
            disabled: sheet.disabled
          };
        } catch (e) {
          errors.push(`Cannot access stylesheet: ${sheet.href}`);
          return { href: sheet.href, error: true };
        }
      });
      
      // Check images
      const images = Array.from(document.images);
      const brokenImages = images.filter(img => !img.complete || img.naturalWidth === 0);
      
      if (brokenImages.length > 0) {
        errors.push(`${brokenImages.length} broken images found`);
      }
      
      // Check for common issues
      if (!document.querySelector('style') && stylesheets.length === 0) {
        errors.push('No stylesheets or style tags found!');
      }
      
      const bodyClasses = document.body.className;
      const htmlClasses = document.documentElement.className;
      
      console.log('=== CSS DEBUG REPORT ===');
      console.log('Tailwind Detected:', tailwindDetected);
      console.log('Stylesheets:', stylesheetsInfo);
      console.log('Body Classes:', bodyClasses);
      console.log('HTML Classes:', htmlClasses);
      console.log('Images Total:', images.length);
      console.log('Broken Images:', brokenImages.length);
      console.log('Errors:', errors);
      
      setDiagnostics({
        loading: false,
        tailwindDetected,
        stylesheetsCount: stylesheets.length,
        stylesheetsInfo,
        imagesCount: images.length,
        brokenImagesCount: brokenImages.length,
        bodyClasses,
        htmlClasses,
        errors
      });
    };
    
    // Run diagnostics after page loads
    if (document.readyState === 'complete') {
      runDiagnostics();
    } else {
      window.addEventListener('load', runDiagnostics);
    }
    
    return () => window.removeEventListener('load', runDiagnostics);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">🔧 CSS Debug Page</h1>
      
      {/* Status Bar */}
      <div className="mb-8 p-4 rounded-lg border-2" style={{
        backgroundColor: diagnostics.tailwindDetected ? '#10b981' : '#ef4444',
        color: 'white'
      }}>
        <h2 className="text-xl font-bold">
          Status: {diagnostics.tailwindDetected ? '✅ CSS Detected' : '❌ CSS NOT Working'}
        </h2>
        <p>Stylesheets: {diagnostics.stylesheetsCount} | Images: {diagnostics.imagesCount}</p>
        {diagnostics.errors.length > 0 && (
          <div className="mt-2">
            <strong>Errors:</strong>
            <ul>
              {diagnostics.errors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Visual CSS Tests */}
      <div className="space-y-8">
        {/* Test 1: Inline Styles (Always Works) */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Test 1: Inline Styles (Should Always Work)</h2>
          <div style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            ✅ If this box is RED with white text, basic CSS works
          </div>
        </section>

        {/* Test 2: Tailwind Classes */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Test 2: Tailwind Classes</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-500 text-white p-4 rounded-lg text-center">
              Blue Box (bg-blue-500)
            </div>
            <div className="bg-green-500 text-white p-4 rounded-lg text-center">
              Green Box (bg-green-500)
            </div>
            <div className="bg-purple-500 text-white p-4 rounded-lg text-center">
              Purple Box (bg-purple-500)
            </div>
          </div>
          <p className="text-gray-600">
            ✅ If these boxes have colors, Tailwind is working<br/>
            ❌ If they're plain/white, Tailwind is NOT loading
          </p>
        </section>

        {/* Test 3: CSS-in-JS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Test 3: Style Tag CSS</h2>
          <style jsx>{`
            .css-in-js-test {
              background-color: #f59e0b;
              color: white;
              padding: 20px;
              border-radius: 8px;
              font-weight: bold;
            }
          `}</style>
          <div className="css-in-js-test">
            ✅ If this is ORANGE, CSS-in-JS works
          </div>
        </section>

        {/* Test 4: Images */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Test 4: Image Loading</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-semibold mb-2">Local Image Test</p>
              <img 
                src="/favicon.ico" 
                alt="Favicon"
                width="50"
                height="50"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.border = '2px solid red';
                  img.alt = '❌ Failed to load';
                }}
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.border = '2px solid green';
                }}
                style={{ display: 'block', padding: '10px' }}
              />
            </div>
            <div>
              <p className="font-semibold mb-2">External Image Test</p>
              <img 
                src="https://via.placeholder.com/50" 
                alt="External"
                width="50"
                height="50"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.border = '2px solid red';
                  img.alt = '❌ Failed';
                }}
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.border = '2px solid green';
                }}
                style={{ display: 'block', padding: '10px' }}
              />
            </div>
            <div>
              <p className="font-semibold mb-2">Data URL Test</p>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: '#22c55e',
                border: '2px solid green',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                ✓
              </div>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Green border = loaded | Red border = failed
          </p>
        </section>

        {/* Test 5: Responsive Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Test 5: Responsive Grid (Tailwind)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-200 p-4 rounded">Box 1</div>
            <div className="bg-gray-300 p-4 rounded">Box 2</div>
            <div className="bg-gray-400 p-4 rounded">Box 3</div>
            <div className="bg-gray-500 p-4 rounded text-white">Box 4</div>
          </div>
          <p className="text-gray-600 mt-2">
            Should show: 1 col on mobile, 2 on tablet, 4 on desktop
          </p>
        </section>

        {/* Diagnostic Data */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">📊 Diagnostic Data</h2>
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '20px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            overflow: 'auto'
          }}>
            <pre>{JSON.stringify(diagnostics, null, 2)}</pre>
          </div>
        </section>

        {/* Quick Fix Commands */}
        <section className="mt-8" style={{
          backgroundColor: '#fef3c7',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #fbbf24'
        }}>
          <h2 className="text-2xl font-bold mb-4">🛠️ Quick Fix Commands</h2>
          <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            <p className="mb-2">Run these in your terminal:</p>
            <ol>
              <li className="mb-2">1. <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>rm -rf .next node_modules</code></li>
              <li className="mb-2">2. <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>npm install</code></li>
              <li className="mb-2">3. <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>npm run dev</code></li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
