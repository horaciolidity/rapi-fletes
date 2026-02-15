import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navigation could go here */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* Future routes:
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/driver" element={<DriverDashboard />} />
            */}
          </Routes>
        </main>

        <footer className="py-12 bg-slate-950 border-t border-slate-900">
          <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
            <p>© 2026 Rapi Fletes. Todos los derechos reservados.</p>
            <p className="mt-2">Desarrollado con ❤️ para mover el mundo.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
