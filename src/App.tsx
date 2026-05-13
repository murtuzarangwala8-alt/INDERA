import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import { ForgotPassword, ResetPassword } from './pages/ForgotPassword';
import Account from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';
import Returns from './pages/Returns';
import OrderConfirmation from './pages/OrderConfirmation';

// Auth pages use full-screen dark layout — no Navbar/Footer
const AuthLayout = ({ children }: { children: React.ReactNode }) => <>{children}</>;

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Auth routes — standalone dark layout */}
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
            <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />

            {/* Main site routes — with Navbar + Footer */}
            <Route path="/*" element={
              <div className="flex flex-col" style={{ minHeight: '100vh', background: 'transparent' }}>
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/returns" element={<Returns />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                color: '#FAF7F2',
                border: '1px solid rgba(201,168,76,0.2)',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '13px',
                letterSpacing: '0.02em',
              },
            }}
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
