import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Roadmap from './components/Roadmap'
import Footer from './components/Footer'
import Auth from './components/Auth'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [session, setSession] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Easter egg: console logs
  useEffect(() => {
    console.log("%c🚗 BMW F30 System Initialized", "color: #0082d6; font-size: 20px; font-weight: bold;");
    console.log("%cV-MAX logic unlocked. Ready to drive.", "color: #1e293b; font-size: 12px;");
    console.log("%c🎣 Fishing mode: STANDBY. Bait detected.", "color: #22c55e; font-size: 12px; font-style: italic;");
  }, []);

  return (
    <div className="app-container">
      <Header session={session} onOpenAuth={() => setIsAuthOpen(true)} />
      <Auth isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      
      <main className="main-content">
        <Hero section="#roadmap" />
        <Roadmap session={session} onOpenAuth={() => setIsAuthOpen(true)} />
        <Gallery session={session} onOpenAuth={() => setIsAuthOpen(true)} />
      </main>
      <Footer />
    </div>
  )
}

export default App
