import React, { useState, useEffect } from 'react';
import { UserAPI, ProductAPI } from './api/apiService';
import { NotificationProvider } from './context/NotificationContext';
import UserManagement from './components/UserManagement';
import ProductManagement from './components/ProductManagement';

function App() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchData = async () => {
    try {
      const userData = await UserAPI.getAll();
      const productData = await ProductAPI.getAll();
      setUsers(userData);
      setProducts(productData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <NotificationProvider>
      <div className="min-h-screen p-4 md:p-8 bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/10 via-black to-black">
        <header className="mb-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mb-2 tracking-tighter">
              ORANGE DASHBOARD
            </h1>
            <p className="text-[var(--text-muted)] font-medium uppercase tracking-[0.2em] text-xs">
              Premium Bento CRUD System • v2.0
            </p>
          </div>

          <div className="flex gap-4">
            <div className="card-premium py-2 px-6 flex flex-col items-center bg-black/40 backdrop-blur-md border-orange-500/10 shadow-orange-500/5">
              <span className="text-[var(--color-accent)] font-bold text-xl">{users.length}</span>
              <span className="text-[10px] uppercase font-bold text-gray-500">Total Users</span>
            </div>
            <div className="card-premium py-2 px-6 flex flex-col items-center bg-black/40 backdrop-blur-md border-orange-500/10 shadow-orange-500/5">
              <span className="text-[var(--color-accent)] font-bold text-xl">{products.length}</span>
              <span className="text-[10px] uppercase font-bold text-gray-500">Stock Items</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <UserManagement
              users={users}
              onUpdate={fetchData}
            />
          </div>
          <div className="lg:col-span-12 xl:col-span-7">
            <ProductManagement
              products={products}
              onUpdate={fetchData}
            />
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}

export default App;
