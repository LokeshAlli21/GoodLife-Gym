import React from 'react'

function Container({ 
  children, 
  className = '', 
  noPaddingY = false 
}) {
  return (
    <div className={`w-full max-w-6xl mx-auto px-3 sm:px-4 rounded-xl ${className} ${noPaddingY ? 'py-0' : 'py-3 sm:py-4'}`}>
      {children}
    </div>
  )
}

export default Container