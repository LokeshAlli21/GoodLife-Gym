import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { login, logout } from './store/authSlice'
import { Header, Footer } from './component/index'
import { Outlet } from 'react-router-dom'
import { getCurrentUser } from './supabase/auth'
import { ToastContainer } from 'react-toastify'

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGd5bSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D'
]

function App() {
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const dispatch = useDispatch()

  useEffect(() => {
    getCurrentUser()
      .then(userData => dispatch(userData ? login(userData) : logout()))
      .catch(error => console.error("Auth Error:", error))
      .finally(() => setLoading(false))
  }, [dispatch])

  useEffect(() => {
    if (BACKGROUND_IMAGES.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % BACKGROUND_IMAGES.length)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen relative bg-cover bg-center transition-all duration-1000 ease-in-out"
      style={{ backgroundImage: `url(${BACKGROUND_IMAGES[currentImage]})` }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative flex flex-col min-h-screen">
        <Header />
        <ToastContainer 
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="dark"
          className="!top-16"
        />
        <main className="flex-1 px-2 py-2 overflow-x-hidden">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App