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
    console.log("%c🌅 BMW F30 Golden Hour Initialized", "color: #f59e0b; font-size: 20px; font-weight: bold;");
    console.log("%cV-MAX logic unlocked. Driving into the sunset.", "color: #451a03; font-size: 12px;");
    console.log("%c🎣 Fishing mode: STANDBY. Bait detected in golden waters.", "color: #16a34a; font-size: 12px; font-style: italic;");
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
