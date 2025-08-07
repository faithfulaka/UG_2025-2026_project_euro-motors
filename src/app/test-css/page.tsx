// Test page to verify CSS is working
export default function TestCSS() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold text-white mb-8 text-center animate-pulse">
          CSS Test Page
        </h1>
        
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            ✅ If you can see this styled correctly, Tailwind is working!
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-red-500 text-white p-4 rounded text-center font-bold">
              Red Box
            </div>
            <div className="bg-green-500 text-white p-4 rounded text-center font-bold">
              Green Box
            </div>
            <div className="bg-blue-500 text-white p-4 rounded text-center font-bold">
              Blue Box
            </div>
          </div>
          
          <div className="space-y-4">
            <button className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:scale-105 transform transition">
              Gradient Button (Hover Me!)
            </button>
            
            <div className="flex space-x-4">
              <button className="flex-1 bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition">
                Dark Button
              </button>
              <button className="flex-1 border-2 border-gray-800 text-gray-800 py-2 px-4 rounded hover:bg-gray-800 hover:text-white transition">
                Outline Button
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
          <h3 className="text-2xl font-semibold mb-3">Glass Effect Card</h3>
          <p className="text-white/80">
            This card uses backdrop blur and transparency. If you see a frosted glass effect, 
            advanced CSS features are working!
          </p>
        </div>
        
        <div className="mt-8 text-center text-white">
          <p className="text-lg">
            Check the browser console for any errors (F12 → Console tab)
          </p>
        </div>
      </div>
    </div>
  );
}
