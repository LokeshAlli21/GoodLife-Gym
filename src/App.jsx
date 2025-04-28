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

  const images = [
    'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGd5bSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D',
    'https://png.pngtree.com/thumb_back/fh260/background/20240329/pngtree-rows-of-dumbbells-in-the-gym-image_15662386.jpg',
    'https://w0.peakpx.com/wallpaper/315/293/HD-wallpaper-sports-weightlifting-bodybuilder-gym-man-muscle.jpg',
    'https://images.hdqwalls.com/wallpapers/dwayne-johnson-workout-new.jpg',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z3ltfGVufDB8fDB8fHww',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAMyeb9e_V5CVAMzS4433FsvUejaW6-0qoig&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTssr0slhmShZ5DvrbihAar-4DNIZLHNA1nrg&s',
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return !loading ? (
<div
      className="min-h-screen relative bg-cover bg-center relative transition-all bg-fixed duration-1000 ease-in-out"
      style={{ backgroundImage: `url(${images[currentImage]})` }}
    >
  {/* Black overlay */}
  <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative w-full">
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
