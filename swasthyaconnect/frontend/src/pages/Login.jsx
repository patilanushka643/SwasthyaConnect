import { useState } from 'react';

export default function App() {
  const [phone, setPhone] = useState('');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden">
        <div className="px-6 pt-16 pb-10 flex flex-col items-center">
          <div className="w-48 h-48 mb-10">
            <img
              src="https://csspicker.dev/api/image/?q=caduceus+medical+symbol&image_type=photo"
              alt="Medical Symbol"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="w-full flex items-center gap-3 mb-10">
            <span className="text-amber-500 font-semibold text-lg">+91</span>
            <div className="flex-1">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your mobile number t..."
                className="w-full text-lg text-gray-500 placeholder-gray-400 border-b border-gray-400 pb-1 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg py-4 rounded-2xl mb-6 transition-colors">
            Login as Patient
          </button>

          <span className="text-gray-500 text-2xl font-normal mb-6">Or</span>

          <button className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold text-lg py-4 rounded-2xl transition-colors">
            Staff Login
          </button>
        </div>
      </div>
    </div>
  );
}
