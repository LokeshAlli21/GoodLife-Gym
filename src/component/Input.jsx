import React, { useId } from 'react';

const Input = React.forwardRef(({ label, type = 'text', className = '', noLabelWrap = false , ...props }, ref) => {
  const id = useId();

  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-1 text-gray-700 font-medium  ${noLabelWrap && 'text-nowrap'}`} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        type={type}
        className={`px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 outline-none transition-all duration-200 border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 w-full ${className}`}
        ref={ref}
        id={id}
        {...props}
        placeholder={props.placeholder}
      />
    </div>
  );
});

export default Input;
