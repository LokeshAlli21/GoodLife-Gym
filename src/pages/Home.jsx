import React from 'react';
import { Container } from '../component/index';

function Home() {
  return (
    <div className="w-full">
      <Container noBackground>
        {/* Hero Section */}
        <div className="w-full min-h-[90vh] flex flex-col items-center justify-center relative px-4 text-center">
          
          {/* Title */}
          <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-wide leading-tight drop-shadow-lg animate-fadeInUp">
            Achieve Your <span className="text-yellow-400">Best Shape</span> <br className="hidden md:block" /> with <span className="text-yellow-400">GoodLife Gym</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-2xl text-gray-300 max-w-2xl animate-fadeInUp delay-150">
            Unleash your potential with world-class fitness training, expert coaching, and a community that pushes you further.
          </p>

          {/* Call to Action Button */}
          {/* <div className="mt-10 animate-fadeInUp delay-300">
            <button className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full shadow-md transition duration-300 text-lg">
              Join Now
            </button>
          </div> */}

        </div>
      </Container>
    </div>
  );
}

export default Home;
