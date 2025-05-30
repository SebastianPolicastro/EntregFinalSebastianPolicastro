
const AddItemButton = ({ onAddToCart, cantidad }) => {
  return (
    <button className="btn btn-primary mt-3" onClick={() => onAddToCart(cantidad)}>
      Añadir al carrito ({cantidad} unidades)
    </button>
  );
};

export default AddItemButton;