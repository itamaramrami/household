import React, { useState } from 'react';

const ForgotPassword = () => {
 const [email, setEmail] = useState('');
 const [message, setMessage] = useState('');
 const [loading, setLoading] = useState(false);

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
   e.preventDefault();
   setLoading(true);
   try {
     const response = await fetch('http://localhost:5001/api/House/forgot-password', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ email }),
     });
     
     if (!response.ok) throw new Error('Failed to send email');
     
     setMessage('נשלח מייל! בדוק את תיבת הדואר שלך');
   } catch (error) {
     setMessage('שגיאה בשליחת המייל. נסה שוב.');
   } finally {
     setLoading(false);
   }
 };

 return (
   <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
     <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
       <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
         שכחת סיסמה?
       </h2>

       <form onSubmit={handleSubmit} className="space-y-6">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
             אימייל
           </label>
           <input
             type="email"
             id="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
             placeholder="הכנס את האימייל שלך"
           />
         </div>

         {message && (
           <div className={`p-3 rounded-lg text-center text-sm ${
             message.includes('שגיאה') 
               ? 'bg-red-100 text-red-800' 
               : 'bg-green-100 text-green-800'
           }`}>
             {message}
           </div>
         )}

         <button
           type="submit"
           disabled={loading}
           className={`w-full py-3 px-4 ${
             loading 
               ? 'bg-gray-400 cursor-not-allowed' 
               : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-[1.02]'
           } text-white rounded-lg font-medium transition-all duration-200`}
         >
           {loading ? (
             <div className="flex items-center justify-center">
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
               שולח...
             </div>
           ) : (
             'שלח קישור לאיפוס סיסמה'
           )}
         </button>

         <div className="text-center mt-4">
           <a href="/login" className="text-sm text-blue-600 hover:text-blue-800">
             חזרה להתחברות
           </a>
         </div>
       </form>
     </div>
   </div>
 );
};

export default ForgotPassword;