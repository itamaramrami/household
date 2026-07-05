import React, { useEffect, useState , useCallback} from "react";
import {
  fetchShoppingItems,
  addShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
} from "../api/shoppingApi";

import {ShoppingItem} from '../interfaces/ShoppingItem'

 interface AlertType {
  type: 'success' | 'error';
  message: string;
}

const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>("יחידות");
  const [category, setCategory] = useState<string>("כללי");
  const [loading, setLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("הכל");

    const categories = [
      "ירקות ופירות",
      "מוצרי חלב",
      "בשר ודגים",
      "מזון יבש",
      "משקאות",
      "ניקיון",
      "כללי"
    ];
  
    const units = [
      "יחידות",
      "ק״ג",
      "גרם",
      "ליטר",
      "מ״ל",
      "חבילות"
    ];
  


    const showAlert = (message: string, type: 'success' | 'error') => {
      setAlert({ message, type });
      setTimeout(() => setAlert(null), 3000);
    };
  
  
    const loadItems = useCallback(async () => {
      try {
        setLoading(true);
        const fetchedItems = await fetchShoppingItems();
        const updatedItems = fetchedItems.map((item: ShoppingItem) => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity,
          isPurchased: item.isPurchased,
          itemGroupId: item.itemGroupId,
          category: item.category ?? 'כללי',     
          unit: item.unit ?? 'יחידות'             
        }));
        setItems(updatedItems);
      } catch (err) {
        showAlert("שגיאה בטעינת הפריטים", "error");
      } finally {
        setLoading(false);
      }
    }, []);
  
    useEffect(() => {
      loadItems();
    }, []);
  
    const handleAddItem = async () => {
      if (!name.trim()) {
        showAlert("אנא הכנס שם פריט", "error");
        return;
      }
      try {
        setLoading(true);
        const newItem = await addShoppingItem(
          name.trim(),
          quantity,
          category,
          unit
        );
        if (newItem) {
          setItems(prev => [...prev, newItem]);
          setName("");
          setQuantity(1);
          showAlert("הפריט נוסף בהצלחה", "success");
        }
      } catch (err) {
        showAlert("שגיאה בהוספת הפריט", "error");
      } finally {
        setLoading(false);
      }
    };
  
    const handleUpdateItem = async () => {
      if (!editingItemId || !name.trim()) {
        showAlert("אנא מלא את כל השדות", "error");
        return;
      }
      try {
        setLoading(true);
        const item = items.find(i => i._id === editingItemId);
        if (!item) {
          throw new Error("הפריט לא נמצא");
        }
    
        const updatedItem = await updateShoppingItem(
          editingItemId,
          name.trim(),
          quantity,
          category || 'כללי',    
          unit || 'יחידות',      
          item.isPurchased
        );
    
        if (updatedItem) {
          setItems(prevItems => prevItems.map(item => 
            item._id === editingItemId ? updatedItem : item
          ));
          setEditingItemId(null);
          setName("");
          setQuantity(1);
          showAlert("הפריט עודכן בהצלחה", "success");
        }
      } catch (err) {
        showAlert("שגיאה בעדכון הפריט", "error");
      } finally {
        setLoading(false);
      }
    };
    const toggleItemPurchased = async (itemId: string) => {
      const item = items.find(i => i._id === itemId);
      if (item) {
        try {
          await updateShoppingItem(
            itemId,
            item.name,
            item.quantity,
            item.category || 'כללי',     
            item.unit || 'יחידות',       
            !item.isPurchased
          );
          setItems(items.map(i => 
            i._id === itemId ? { ...i, isPurchased: !i.isPurchased } : i
          ));
        } catch (err) {
          showAlert("שגיאה בעדכון הפריט", "error");
        }
      }
    };
 

    const handleDeleteItem = async (itemId: string) => {
      try {
        await deleteShoppingItem(itemId);
        setItems(prevItems => prevItems.filter(item => item._id !== itemId));
        showAlert("הפריט נמחק בהצלחה", "success");
      } catch (err) {
        showAlert("שגיאה במחיקת הפריט", "error");
      }
    };
  






  const sortItems = (items: ShoppingItem[]) => {
    return [...items].sort((a, b) => {
      // קודם כל ממיינים לפי סטטוס הקנייה
      if (a.isPurchased === b.isPurchased) {
        // אם שניהם קנויים או שניהם לא קנויים, נמיין לפי קטגוריה
        const categoryA = a.category || 'כללי';
        const categoryB = b.category || 'כללי';

        if (categoryA === categoryB) {
          // אם הקטגוריה זהה, נמיין לפי שם הפריט
          return a.name.localeCompare(b.name);
        }
        return categoryA.localeCompare(categoryB);
      }
      // פריטים שנקנו יופיעו בסוף
      return a.isPurchased ? 1 : -1;
    });
  };
  

  


  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => (window.location.href = "/home")}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
          >
            חזרה לדף הבית
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">רשימת קניות</h1>
            <p className="text-blue-100">ניהול חכם של רשימת הקניות המשפחתית</p>
          </div>
        </div>
      </div>

        {/* Alert Component */}
        {alert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg ${
            alert.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {alert.type === 'success' ? '✓' : '⚠️'}
              </span>
              <span className="font-medium">{alert.message}</span>
            </div>
          </div>
        </div>
      )}

       
  
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Add Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם המוצר"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex gap-2">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-24 p-3 border rounded-lg"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="flex-1 p-3 border rounded-lg"
              >
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
  
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-3 border rounded-lg"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
  
            <button
              onClick={editingItemId ? handleUpdateItem : handleAddItem}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {editingItemId ? "עדכן מוצר" : "הוסף מוצר"}
            </button>
          </div>
        </div>
  
        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("הכל")}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === "הכל"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            הכל
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
  
        {/* Shopping List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שם המוצר</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">כמות</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">קטגוריה</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
  {sortItems(items)
    .filter(item => selectedCategory === "הכל" || item.category === selectedCategory)
    .map((item) => (
      <tr 
        key={item._id} 
        className={`${item.isPurchased ? "bg-gray-50" : ""} transition-all duration-200`}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={item.isPurchased}
            onChange={() => toggleItemPurchased(item._id)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 cursor-pointer
              focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </td>
        <td className={`px-6 py-4 whitespace-nowrap ${
          item.isPurchased ? "line-through text-gray-400" : ""
        }`}>
          {item.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {item.quantity} {item.unit}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 py-1 text-sm rounded-full bg-gray-100">
            {item.category || 'כללי'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setName(item.name);
                setQuantity(item.quantity);
                setUnit(item.unit || 'יחידות');
                setCategory(item.category || 'כללי');
                setEditingItemId(item._id);
              }}
              className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 
                rounded-lg transition-all"
              title="ערוך פריט"
            >
              ✏️
            </button>
            <button
              onClick={() => handleDeleteItem(item._id)}
              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 
                rounded-lg transition-all"
              title="מחק פריט"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
  ))}
</tbody>
          </table>
          {items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">הרשימה ריקה, התחל להוסיף פריטים</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;