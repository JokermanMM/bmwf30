import { useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Roadmap from './components/Roadmap'
import Footer from './components/Footer'
import './App.css'

function App() {
  // Easter egg: console logs
  useEffect(() => {
    console.log("%c🚗 BMW F30 System Initialized", "color: #0082d6; font-size: 20px; font-weight: bold;");
    console.log("%cV-MAX logic unlocked. Ready to drive.", "color: #fff; font-size: 12px;");
  }, []);

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Hero />
        <Roadmap />
        <Gallery />
      </main>
      <Footer />
    </div>
  )
}

export default App
