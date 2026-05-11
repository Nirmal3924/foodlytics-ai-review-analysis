import { FiArrowRight } from 'react-icons/fi';

export default function Navbar({ onLogin, onSignUp }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 py-4 bg-white/85 backdrop-blur-md border-b border-gray-100">
      
      {/* LEFT: Logo */}
      <div className="text-2xl font-black tracking-tight cursor-pointer">
        <span className="text-orange-600">Foodly</span>
        <span className="text-gray-900">tics</span>
      </div>

      {/* RIGHT: Links + Buttons */}
      <div className="flex items-center gap-10">
        
        {/* Navigation Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-8 border-r border-gray-200 pr-10">
          <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition">Features</a>
          <a href="#about" className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition">About</a>
          <a href="#help" className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition">Help</a>
        </div>

        {/* Auth Group */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="text-sm font-bold text-gray-700 hover:text-orange-600 transition px-2"
          >
            Sign In
          </button>
          
          <button 
            onClick={onSignUp}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-100"
          >
            Get Started <FiArrowRight size={16} />
          </button>
        </div>

      </div>
    </nav>
  );
} 