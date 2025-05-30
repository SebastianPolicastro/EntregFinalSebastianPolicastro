import { onAuthStateChanged } from 'firebase/auth';
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { FaEye, FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CartContext from '../context/CartContext';
import { auth, db } from '../firebase/config';
import './styles/custom.css';


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

function ItemListContainer() {
  const { categoryId } = useParams();
  const { agregarAlCarrito } = useContext(CartContext);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const obtenerProductos = async () => {
      setCargando(true);
      try {
        const productosRef = collection(db, 'items');
        const q = categoryId
          ? query(productosRef, where('categoria', '==', categoryId))
          : productosRef;

        const querySnapshot = await getDocs(q);
        const productosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (currentUser) {
            const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);
            const wishlistDocSnap = await getDoc(wishlistDocRef);
            if (wishlistDocSnap.exists()) {
                const wishlistItems = wishlistDocSnap.data().items || [];
                const productosConWishlistStatus = productosData.map(p => ({
                    ...p,
                    isInWishlist: wishlistItems.some(item => item.id === p.id)
                }));
                setProductos(productosConWishlistStatus);
            } else {
                setProductos(productosData.map(p => ({ ...p, isInWishlist: false })));
            }
        } else {
            setProductos(productosData.map(p => ({ ...p, isInWishlist: false })));
        }

      } catch (error) {
        console.error("Error al obtener productos:", error);
        toast.error("Error al cargar los productos. Inténtalo de nuevo."); // Notificación de error
      } finally {
        setCargando(false);
      }
    };

    obtenerProductos();
  }, [categoryId, currentUser]);

  const handleToggleWishlist = async (producto) => {
    if (!currentUser) {
      toast.warn('Debes iniciar sesión para añadir a tu Wishlist.');
      return;
    }

    const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);

    try {
      if (producto.isInWishlist) {
        await updateDoc(wishlistDocRef, {
          items: arrayRemove({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            categoria: producto.categoria,
            descripcion: producto.descripcion,
            stock: producto.stock
          })
        });
        toast.info(`${producto.nombre} removido de Wishlist.`);
      } else {
        await setDoc(wishlistDocRef, {
          items: arrayUnion({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            categoria: producto.categoria,
            descripcion: producto.descripcion,
            stock: producto.stock
          })
        }, { merge: true });
        toast.success(`${producto.nombre} añadido a Wishlist.`);
      }
      setProductos(prevProductos =>
        prevProductos.map(p =>
          p.id === producto.id ? { ...p, isInWishlist: !p.isInWishlist } : p
        )
      );
    } catch (error) {
      console.error('Error al actualizar wishlist:', error);
      toast.error('Hubo un error al actualizar tu wishlist.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="products-grid">
        <h2 className="section-title">
          {categoryId ? `Categoría: ${categoryId}` : 'Todos los productos'}
        </h2>
        {cargando ? (
          <div className="row g-4">
            {[...Array(8)].map((_, i) => ( // Muestra 8 skeletons
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="row g-4">
            {productos.map((producto) => (
              <div key={producto.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card product-card">
                  <img src={producto.imagen} className="card-img-top" alt={producto.nombre} />
                  <div className="card-body">
                    <h5 className="card-title">{producto.nombre}</h5>
                    <p className="card-text">${producto.precio}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <Link to={`/item/${producto.id}`} className="btn btn-secondary btn-sm">
                        <FaEye className="me-1" /> Detalles
                      </Link>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => agregarAlCarrito({ ...producto, cantidad: 1 })}
                      >
                        <FaShoppingCart className="me-1" /> Añadir
                      </button>
                    </div>
                    {currentUser && (
                      <button
                        className={`btn mt-2 w-100 ${producto.isInWishlist ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => handleToggleWishlist(producto)}
                      >
                        {producto.isInWishlist ? <FaHeart className="me-2" /> : <FaRegHeart className="me-2" />}
                        {producto.isInWishlist ? 'En Wishlist' : 'Añadir a Wishlist'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!cargando && productos.length === 0 && (
          <p>No se encontraron productos en esta categoría.</p>
        )}
      </div>
    </div>
  );
}

export default ItemListContainer;