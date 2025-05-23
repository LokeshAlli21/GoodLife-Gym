import React from 'react'
import { Container } from '../component/index'

function Home() {
  return (
    <Container noBackground>
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 text-center -mt-16">
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          Achieve Your{' '}
          <span className="text-yellow-400 block sm:inline">Best Shape</span>
          <br className="hidden sm:block" />
          with{' '}
          <span className="text-yellow-400 font-bold block sm:inline">
            GoodLife Gym
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-xl sm:max-w-2xl leading-relaxed">
          Unleash your potential with world-class fitness training, expert coaching, 
          and a community that pushes you further.
        </p>
      </div>
    </Container>
  )
}

export default Home