import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import './Layout.css'

export function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="layoutMain">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
