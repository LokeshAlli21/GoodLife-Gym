import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login, logout} from './store/authSlice'
import {Header, Footer} from './component/index'
import { Outlet } from 'react-router-dom'
import { getCurrentUser } from './supabase/auth'

function App() {

  const userData = useSelector(state => state.auth)
  console.log(userData);
  

  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  // const obj = {
  //   email: 'abc@gmail.com',
  //   password: '12345678'
  // }
  // authService.login(obj).then((userData) => console.log('login successful')) // test login // working

  useEffect(() => {
    getCurrentUser()
    .then((userData) => {
      if(userData) {
        dispatch(login(userData))
      } else {
        dispatch(logout())
      }
      console.log("userData : ",userData);
    })
    .catch((error) => console.log("Login Error : ",error))
    .finally(() => setLoading(false))
  }, [])

  return !loading ? (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      <div className="w-full">
        <Header />
        <main className="flex-grow p-4">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
) : (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading...
    </div>
);
}

export default App
