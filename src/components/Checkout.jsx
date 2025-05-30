import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { FaArrowLeft, FaCheckCircle, FaShoppingBag, FaSpinner } from 'react-icons/fa'; // Importa íconos
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Importa toast
import CartContext from '../context/CartContext';
import { auth, db } from '../firebase/config';

function Checkout() {
  const { carrito, vaciarCarrito } = useContext(CartContext);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirmacion, setEmailConfirmacion] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setEmail(user.email);
        setEmailConfirmacion(user.email);
      } else {
        setEmail('');
        setEmailConfirmacion('');
      }
    });
    return () => unsubscribe();
  }, []);

  const totalCompra = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);

  const getOptionsString = (options) => {
    if (!options || Object.keys(options).length === 0) {
      return '';
    }
    return ` (${Object.entries(options).map(([key, value]) => `${key}: ${value}`).join(', ')})`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !nombre ||
      !apellido ||
      !telefono ||
      !email ||
      (!currentUser && email !== emailConfirmacion)
    ) {
      toast.error('Por favor, completa todos los campos y/o verifica que los correos coincidan.'); // Notificación
      setLoading(false);
      return;
    }

    if (carrito.length === 0) {
      toast.warn('Tu carrito está vacío. Agrega productos para realizar una compra.'); // Notificación
      setLoading(false);
      return;
    }

    const orden = {
      comprador: {
        nombre,
        apellido,
        telefono,
        email: currentUser ? currentUser.email : email,
      },
      items: carrito.map((prod) => ({
        id: prod.id,
        nombre: prod.nombre,
        precio: prod.precio,
        cantidad: prod.cantidad,
        descripcion: prod.descripcion || 'Sin descripción',
        opcionesSeleccionadas: prod.opcionesSeleccionadas || {},
      })),
      total: totalCompra,
      fecha: Timestamp.fromDate(new Date()),
      estado: 'generada',
      userId: currentUser ? currentUser.uid : null,
    };

    const batch = writeBatch(db);
    const outOfStock = [];

    for (const prod of carrito) {
      const docRef = doc(db, 'items', prod.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().stock >= prod.cantidad) {
        batch.update(docRef, {
          stock: docSnap.data().stock - prod.cantidad,
        });
      } else {
        outOfStock.push(prod);
      }
    }

    if (outOfStock.length > 0) {
      toast.error(`Los siguientes productos no tienen stock suficiente: ${outOfStock.map(p => p.nombre + getOptionsString(p.opcionesSeleccionadas)).join(', ')}`); // Notificación
      setLoading(false);
      return;
    }

    try {
      await batch.commit();
      const docRef = await addDoc(collection(db, 'orders'), orden);
      setOrderId(docRef.id);
      vaciarCarrito();
      toast.success('¡Compra realizada con éxito!'); // Notificación
    } catch (error) {
      console.error('Error al generar la orden o actualizar stock:', error);
      toast.error('Hubo un error al procesar tu compra. Por favor, inténtalo de nuevo.'); // Notificación
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="container mt-5 text-center">
        <h2>¡Gracias por tu compra!</h2>
        <p>Tu orden ha sido generada con éxito.</p>
        <p>Tu número de orden es: <strong>{orderId}</strong></p>
        <Link to="/" className="btn btn-primary mt-3">
          <FaArrowLeft className="me-2" /> Volver al inicio
        </Link>
        {currentUser && (
          <Link to="/my-orders" className="btn btn-secondary mt-3 ms-2">
            <FaShoppingBag className="me-2" /> Ver mis órdenes
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Finalizar Compra</h2>
      <div className="row">
        <div className="col-md-8">
          <h4>Resumen de tu compra:</h4>
          {carrito.length === 0 ? (
            <p>El carrito está vacío. <Link to="/">Explora nuestros productos</Link>.</p>
          ) : (
            <ul className="list-group mb-3">
              {carrito.map((prod) => (
                <li key={`${prod.id}-${JSON.stringify(prod.opcionesSeleccionadas || {})}`} className="list-group-item d-flex justify-content-between">
                  <span>
                    {prod.nombre}
                    {getOptionsString(prod.opcionesSeleccionadas)}
                    {' (x'}
                    {prod.cantidad})
                  </span>
                  <span>${(prod.precio * prod.cantidad).toFixed(2)}</span>
                </li>
              ))}
              <li className="list-group-item d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>${totalCompra.toFixed(2)}</span>
              </li>
            </ul>
          )}

          {carrito.length > 0 && (
            <>
              {currentUser ? (
                <p className="alert alert-info">Comprando como: <strong>{currentUser.email}</strong></p>
              ) : (
                <h4>Datos del comprador:</h4>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="apellido" className="form-label">Apellido</label>
                  <input
                    type="text"
                    className="form-control"
                    id="apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="telefono" className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>

                {!currentUser && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="emailConfirmacion" className="form-label">Confirmar Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="emailConfirmacion"
                        value={emailConfirmacion}
                        onChange={(e) => setEmailConfirmacion(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                <button type="submit" className="btn btn-success" disabled={carrito.length === 0 || loading}>
                  {loading ? (
                    <>
                      <FaSpinner className="spinner-border spinner-border-sm me-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="me-2" /> Realizar Compra
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;