import { useContext } from 'react';
import { FaCheckCircle, FaMinus, FaPlus } from 'react-icons/fa'; // Importa íconos
import { Link } from 'react-router-dom';
import CartContext from '../context/CartContext';

function Carrito() {
  const { carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito } = useContext(CartContext);

  const totalCarrito = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);

  const getOptionsString = (options) => {
    if (!options || Object.keys(options).length === 0) {
      return '';
    }
    return ` (${Object.entries(options).map(([key, value]) => `${key}: ${value}`).join(', ')})`;
  };

  return (
    <div className="container mt-5">
      <h2>Carrito de Compras</h2>
      {carrito.length === 0 ? (
        <p>El carrito está vacío. <Link to="/">Explora nuestros productos</Link>.</p>
      ) : (
        <>
          <ul className="list-group mb-3">
            {carrito.map((producto) => (
              <li key={`${producto.id}-${JSON.stringify(producto.opcionesSeleccionadas || {})}`} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  {producto.nombre}
                  {getOptionsString(producto.opcionesSeleccionadas)}
                  {' - $'}
                  {producto.precio}
                </span>
                <div>
                  <button
                    className="btn btn-sm btn-danger me-2"
                    onClick={() => eliminarDelCarrito(producto.id, producto.opcionesSeleccionadas)}
                  >
                    <FaMinus />
                  </button>
                  {producto.cantidad}
                  <button
                    className="btn btn-sm btn-primary ms-2"
                    onClick={() => agregarAlCarrito({ ...producto, cantidad: 1 })}
                  >
                    <FaPlus />
                  </button>
                </div>
              </li>
            ))}
            <li className="list-group-item d-flex justify-content-between fw-bold">
              <span>Total del carrito:</span>
              <span>${totalCarrito.toFixed(2)}</span>
            </li>
          </ul>
          <div className="d-grid gap-2 mt-3">
            <button className="btn btn-outline-danger mb-2" onClick={vaciarCarrito}>
              Vaciar Carrito
            </button>
            <Link to="/checkout" className="btn btn-success btn-lg">
              <FaCheckCircle className="me-2" /> Finalizar Compra
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Carrito;