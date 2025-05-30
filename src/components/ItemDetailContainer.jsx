import { onAuthStateChanged } from 'firebase/auth';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Importa íconos
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify'; // Importa toast
import CartContext from '../context/CartContext';
import { auth, db } from '../firebase/config';
import AddItemButton from './AddItemButton';
import ItemQuantitySelector from './ItemQuantitySelector';
import './styles/custom.css';


function ItemDetailContainer() {
  const { id } = useParams();
  const { agregarAlCarrito } = useContext(CartContext);
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const obtenerProducto = async () => {
      setCargando(true);
      try {
        const docRef = doc(db, 'items', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProducto(productData);
          setCantidadSeleccionada(1);
          if (productData.opciones && productData.opciones.length > 0) {
            const initialOptions = {};
            productData.opciones.forEach(option => {
              if (option.valores && option.valores.length > 0) {
                initialOptions[option.nombre] = option.valores[0];
              }
            });
            setOpcionesSeleccionadas(initialOptions);
          } else {
            setOpcionesSeleccionadas({});
          }
        } else {
          console.log("No existe el producto!");
          setProducto(null);
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        setProducto(null);
      } finally {
        setCargando(false);
      }
    };
    obtenerProducto();
  }, [id]);

  useEffect(() => {
    const checkWishlist = async () => {
      if (currentUser && producto) {
        try {
          const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);
          const wishlistDocSnap = await getDoc(wishlistDocRef);
          if (wishlistDocSnap.exists()) {
            const wishlistItems = wishlistDocSnap.data().items || [];
            setIsInWishlist(wishlistItems.some(item => item.id === producto.id));
          } else {
            setIsInWishlist(false);
          }
        } catch (error) {
          console.error("Error al verificar wishlist:", error);
          setIsInWishlist(false);
        }
      } else {
        setIsInWishlist(false);
      }
    };
    checkWishlist();
  }, [currentUser, producto]);

  const handleSumar = () => {
    if (producto && cantidadSeleccionada < producto.stock) {
      setCantidadSeleccionada(prev => prev + 1);
    }
  };

  const handleRestar = () => {
    setCantidadSeleccionada(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleOpcionChange = (nombreOpcion, valorSeleccionado) => {
    setOpcionesSeleccionadas(prev => ({
      ...prev,
      [nombreOpcion]: valorSeleccionado
    }));
  };

  const handleAddToCart = (cantidad) => {
    if (producto && cantidad > 0 && cantidad <= producto.stock) {
      const productoParaCarrito = { ...producto, cantidad: cantidad, opcionesSeleccionadas };
      agregarAlCarrito(productoParaCarrito);
      toast.success(`${cantidad} unidades de ${producto.nombre} añadidas.`); // Notificación
    } else if (producto && cantidad > producto.stock) {
        toast.error(`No hay suficiente stock. Solo quedan ${producto.stock} unidades.`); // Notificación
    } else if (producto && producto.stock === 0) {
        toast.error(`Producto sin stock disponible.`); // Notificación
    }
  };

  const handleToggleWishlist = async () => {
    if (!currentUser) {
      toast.warn('Debes iniciar sesión para añadir a tu Wishlist.'); // Notificación
      return;
    }
    if (!producto) return;

    const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);

    try {
      if (isInWishlist) {
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
        setIsInWishlist(false);
        toast.info(`${producto.nombre} removido de Wishlist.`); // Notificación
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
        setIsInWishlist(true);
        toast.success(`${producto.nombre} añadido a Wishlist.`); // Notificación
      }
    } catch (error) {
      console.error('Error al actualizar wishlist:', error);
      toast.error('Hubo un error al actualizar tu wishlist.'); // Notificación
    }
  };

  if (cargando) {
    return <p className="text-center">Cargando...</p>;
  }

  if (!producto) {
    return <p className="text-center">El producto no existe o hubo un error al cargarlo.</p>;
  }

  return (
    <div className="container mt-5 text-center">
      <div className="card item-detail-card">
        <img src={producto.imagen} className="card-img-top" alt={producto.nombre} />
        <div className="card-body">
          <h2 className="card-title">{producto.nombre}</h2>
          <p className="card-text">{producto.descripcion}</p>
          <p className="price">Precio: ${producto.precio}</p>
          {producto.stock > 0 ? (
            <p className="stock">Stock disponible: {producto.stock}</p>
          ) : (
            <p className="stock text-danger fw-bold">Producto sin stock</p>
          )}

          {producto.opciones && producto.opciones.length > 0 && (
            <div className="options-container my-3">
              {producto.opciones.map(option => (
                <div key={option.nombre} className="mb-2">
                  <label htmlFor={`select-${option.nombre}`} className="form-label">{option.nombre}:</label>
                  <select
                    id={`select-${option.nombre}`}
                    className="form-select mx-auto"
                    style={{ maxWidth: '200px' }}
                    value={opcionesSeleccionadas[option.nombre] || ''}
                    onChange={(e) => handleOpcionChange(option.nombre, e.target.value)}
                  >
                    {option.valores.map(valor => (
                      <option key={valor} value={valor}>{valor}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {producto.stock > 0 && (
            <>
              <ItemQuantitySelector
                cantidad={cantidadSeleccionada}
                onSumar={handleSumar}
                onRestar={handleRestar}
              />
              <AddItemButton
                onAddToCart={handleAddToCart}
                cantidad={cantidadSeleccionada}
              />
            </>
          )}
          {currentUser && (
            <button
              className={`btn mt-3 ${isInWishlist ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={handleToggleWishlist}
            >
              {isInWishlist ? <FaHeart className="me-2" /> : <FaRegHeart className="me-2" />}
              {isInWishlist ? 'Remover de Wishlist' : 'Añadir a Wishlist'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetailContainer;