import { onAuthStateChanged } from 'firebase/auth';
import { arrayRemove, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { FaShoppingCart, FaTrashAlt } from 'react-icons/fa'; // Importa íconos
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import CartContext from '../context/CartContext';
import { auth, db } from '../firebase/config';

// Componente SkeletonCard simple (puedes reutilizar el de ItemListContainer si quieres)
const SkeletonCard = () => (
  <div className="col-12 col-sm-6 col-md-4 col-lg-3">
    <div className="card product-card skeleton-card">
      <div className="skeleton-img"></div>
      <div className="card-body">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-button"></div>
        <div className="skeleton-button-small"></div>
      </div>
    </div>
  </div>
);


function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { agregarAlCarrito } = useContext(CartContext);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (currentUser) {
        setLoadingWishlist(true);
        try {
          const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);
          const wishlistDocSnap = await getDoc(wishlistDocRef);
          if (wishlistDocSnap.exists()) {
            setWishlistItems(wishlistDocSnap.data().items || []);
          } else {
            setWishlistItems([]);
          }
        } catch (error) {
          console.error("Error al obtener wishlist:", error);
          toast.error("Error al cargar tu Wishlist. Inténtalo de nuevo.");
          setWishlistItems([]);
        } finally {
          setLoadingWishlist(false);
        }
      } else if (!loadingAuth) {
        setWishlistItems([]);
        setLoadingWishlist(false);
      }
    };

    if (!loadingAuth) {
      fetchWishlist();
    }
  }, [currentUser, loadingAuth]);

  const handleRemoveFromWishlist = async (itemToRemove) => {
    if (!currentUser) return;

    try {
      const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);
      await updateDoc(wishlistDocRef, {
        items: arrayRemove(itemToRemove)
      });
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemToRemove.id));
      toast.info(`"${itemToRemove.nombre}" removido de Wishlist.`);
    } catch (error) {
      console.error('Error al remover de wishlist:', error);
      toast.error('Hubo un error al remover el producto de tu wishlist.');
    }
  };

  const handleAddToCarAndRemoveFromWishlist = (item) => {
    if (item.stock === 0) {
        toast.error(`"${item.nombre}" no tiene stock disponible para añadir al carrito.`);
        return;
    }
    agregarAlCarrito({ ...item, cantidad: 1 });
    handleRemoveFromWishlist(item);
  };


  if (loadingAuth || loadingWishlist) {
    return (
      <div className="container mt-5">
        <h2 className="mb-4">Mi Wishlist</h2>
        <div className="row g-4">
          {[...Array(4)].map((_, i) => ( // Muestra 4 skeletons para wishlist
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mt-5 text-center">
        <h2>Acceso Denegado</h2>
        <p>Debes iniciar sesión para ver tu Wishlist.</p>
        <Link to="/auth" className="btn btn-primary mt-3">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Mi Wishlist</h2>
      {wishlistItems.length === 0 ? (
        <p>Tu Wishlist está vacía. <Link to="/">¡Explora productos para añadir!</Link></p>
      ) : (
        <div className="row g-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card product-card">
                <img src={item.imagen} className="card-img-top" alt={item.nombre} />
                <div className="card-body">
                  <h5 className="card-title">{item.nombre}</h5>
                  <p className="card-text">${item.precio}</p>
                  <p className="card-text">Stock: {item.stock > 0 ? `Disponible: ${item.stock}` : 'Sin Stock'}</p>
                  <div className="d-flex justify-content-between mt-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddToCarAndRemoveFromWishlist(item)}
                      disabled={item.stock === 0}
                    >
                      {item.stock > 0 ? <FaShoppingCart className="me-1" /> : ''}
                      {item.stock > 0 ? 'Añadir al Carrito' : 'Sin Stock'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveFromWishlist(item)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;