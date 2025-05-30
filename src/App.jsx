import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Auth from './components/Auth';
import Carrito from './components/Cart';
import Checkout from './components/Checkout';
import ItemDetailContainer from './components/ItemDetailContainer';
import ItemListContainer from './components/ItemListContainer';
import MyOrders from './components/MyOrders';
import Navbar from './components/NavBar';
import OrderDetail from './components/OrderDetail';
import './components/styles/custom.css';
import Wishlist from './components/Wishlist';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container my-5">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <div className="hero">
                      <h1>Bienvenido a MiTienda</h1>
                      <p>Descubre nuestros increíbles productos y encuentra lo que necesitas.</p>
                    </div>
                    <ItemListContainer />
                  </>
                }
              />
              <Route path="/categoria/:categoryId" element={<ItemListContainer />} />
              <Route path="/item/:id" element={<ItemDetailContainer />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/order/:id" element={<OrderDetail />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/about" element={<h1>Sobre Nosotros</h1>} />
              <Route path="/contact" element={<h1>Contáctanos</h1>} />
            </Routes>
          </div>
          <footer className="footer">
            <p>&copy; 2025 MiTienda. Todos los derechos reservados.</p>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;