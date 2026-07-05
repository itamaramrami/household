import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeMain = () => {
 const navigate = useNavigate();

 return (
   <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700">
     {/* Header */}
     <header className="p-4">
     <div className="max-w-7xl mx-auto flex justify-end gap-4">
  <button
    onClick={() => navigate('/login')}
    className="px-6 py-2 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white hover:text-blue-600 transition-all"
  >
    התחברות
  </button>
  <button
    onClick={() => navigate('/signUp')}
    className="px-6 py-2 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white hover:text-blue-600 transition-all"
  >
    הרשמה
  </button>
</div>
     </header>

     {/* Main Content */}
     <main className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
       <h1 className="text-5xl font-bold mb-6">
         ברוכים הבאים לניהול משק הבית החכם
       </h1>
       
       <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-12">
         הדרך הקלה והיעילה לנהל את משק הבית שלכם בצורה חכמה ומסודרת
       </p>

       {/* Features Grid */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
         <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm">
           <div className="text-4xl mb-4">📝</div>
           <h3 className="text-xl font-semibold mb-2">ניהול משימות</h3>
           <p className="text-blue-100">
             נהלו את כל המשימות הביתיות במקום אחד, עם אפשרות לשיתוף ומעקב
           </p>
         </div>
         
         <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm">
           <div className="text-4xl mb-4">🛒</div>
           <h3 className="text-xl font-semibold mb-2">רשימות קניות</h3>
           <p className="text-blue-100">
             צרו ושתפו רשימות קניות, עקבו אחר מוצרים ברשימת  הקניות המשותפת שלכם
           </p>
         </div>
         
         <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm">
           <div className="text-4xl mb-4">📅</div>
           <h3 className="text-xl font-semibold mb-2">ניהול אירועים</h3>
           <p className="text-blue-100">
             תכננו ונהלו אירועים משפחתיים וביתיים בקלות ובנוחות
           </p>
         </div>

         <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm">
           <div className="text-4xl mb-4">💰</div>
           <h3 className="text-xl font-semibold mb-2">הוצאות והכנסות</h3>
           <p className="text-blue-100">
             נהלו את התקציב המשפחתי בצורה חכמה ומסודרת
           </p>
         </div>
       </div>

       {/* Benefits Section */}
       <div className="bg-white bg-opacity-5 rounded-2xl p-8 backdrop-blur-sm">
         <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
         <span>?</span>
           <span>למה להשתמש במערכת שלנו</span>
           
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
           <div className="flex items-center justify-center gap-3">
             <span className="text-2xl">✨</span>
             <div>
               <h4 className="font-semibold mb-1">ממשק ידידותי</h4>
               <p className="text-blue-100">פשוט וקל לשימוש, בדיוק כמו שצריך</p>
             </div>
           </div>
           <div className="flex items-center justify-center gap-3">
             <span className="text-2xl">🤝</span>
             <div>
               <h4 className="font-semibold mb-1">שיתוף פעולה</h4>
               <p className="text-blue-100">שתפו משימות ורשימות עם בני המשפחה</p>
             </div>
           </div>
           <div className="flex items-center justify-center gap-3">
             <span className="text-2xl">📱</span>
             <div>
               <h4 className="font-semibold mb-1">גישה מכל מקום</h4>
               <p className="text-blue-100">השתמשו במערכת מכל מכשיר ובכל זמן</p>
             </div>
           </div>
           <div className="flex items-center justify-center gap-3">
             <span className="text-2xl">🔒</span>
             <div>
               <h4 className="font-semibold mb-1">אבטחה מלאה</h4>
               <p className="text-blue-100">המידע שלכם מאובטח ומוגן באופן מלא</p>
             </div>
           </div>
         </div>
       </div>

       {/* Call to Action */}
       <div className="mt-16">
         <button
           onClick={() => navigate('/signUp')}
           className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-medium
                    hover:bg-blue-50 transform hover:scale-105 transition-all"
         >
           התחל עכשיו - חינם
         </button>
       </div>
     </main>
   </div>
 );
};

export default HomeMain;