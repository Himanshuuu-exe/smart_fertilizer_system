import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Predict from './pages/Predict'

export default function App() {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) setDarkMode(JSON.parse(saved))
  }, [])

  const toggleDark = () => {
    setDarkMode(d => {
      localStorage.setItem('darkMode', JSON.stringify(!d))
      return !d
    })
  }

  return (
    <div className={darkMode ? 'dark' : 'light'} style={{ minHeight: '100vh' }}>
      <div style={{ minHeight: '100vh', background: darkMode
        ? 'radial-gradient(ellipse at top, #0d2818 0%, #0a0f1e 50%, #06090f 100%)'
        : 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #dcfce7 100%)'
      }}>
        <Navbar darkMode={darkMode} toggleDark={toggleDark} />
        <main>
          <Predict darkMode={darkMode} />
        </main>
        <Footer darkMode={darkMode} />
      </div>
    </div>
  )
}
