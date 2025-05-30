# MiTienda E-commerce

Este es mi proyecto de e-commerce, desarrollado con React y Vite. La idea principal era crear una plataforma donde los usuarios pudieran navegar por productos, ver sus detalles, añadirlos al carrito y pasar por un proceso de compra sencillo.

## ¿Cómo está construido? Mi Enfoque:

Mi objetivo fue construir una aplicación robusta y fácil de mantener. Estas son algunas de las decisiones clave y características que implementé:

- **Datos en la Nube con Firebase Firestore**: Decidí usar Firebase Firestore para manejar toda la información importante: los productos disponibles en el catálogo (`items`) y cada orden de compra que se genera (`orders`). Me pareció una solución superpráctica para tener los datos en tiempo real y gestionarlos de forma dinámica.
- **Diseño Modular con Componentes**: Para mantener el código ordenado y reutilizable, dividí la interfaz en componentes más pequeños. Así, tengo partes específicas para la `Navbar`, las listas de productos (`ItemListContainer`), los detalles (`ItemDetailContainer`), el carrito (`Cart`) y el proceso de pago (`Checkout`). Esto hace que sea mucho más fácil entender y expandir el proyecto.
- **Carrito de Compras Centralizado**: La información del carrito es crucial, así que la gestioné con un Context de React (`CartContext`). Esto me permite acceder y modificar el carrito desde cualquier parte de la app sin pasar props por todos lados, lo cual es muy cómodo.
- **Navegación Fluida con React Router**: Para que la experiencia de usuario fuera buena y no se recargara toda la página cada vez, implementé `react-router-dom`. Así, puedo tener rutas limpias como `/`, `/categoria/:categoryId` o `/item/:id`, y el usuario se mueve por la tienda de forma instantánea.
- **Mejoras en la Experiencia de Compra**: Agregué un selector de cantidad en la vista de detalle del producto para que el usuario elija cuántas unidades quiere desde el principio. También ajusté la lógica del carrito para que sumar y restar productos sea preciso y sin errores.

## ¿Qué librerías extra usé y por qué?

Además de lo que ya viene con React y Vite, sumé algunas librerías clave que me ayudaron mucho:

- **`firebase`**:
  - [Link al Proyecto](https://firebase.google.com/docs/web/setup)
  - **¿Por qué la elegí?**: Firebase es una plataforma muy completa. Me decidí por ella principalmente por **Firestore**, su base de datos NoSQL. Me permitió guardar y obtener todos los productos y las órdenes de compra de forma muy sencilla y eficiente. Su integración fue bastante directa y eso aceleró mucho el desarrollo.
- **`react-router-dom`**:
  - [Link al Proyecto](https://reactrouter.com/web/guides/quick-start)
  - **¿Por qué la elegí?**: Es el estándar para manejar rutas en React. Sin `react-router-dom`, mi aplicación sería un montón de recargas de página. Con ella, logré que la navegación entre la página principal, las categorías, los detalles de los productos y el carrito fuera totalmente fluida, como en una aplicación moderna.
- **`bootstrap`**:
  - [Link al Proyecto](https://getbootstrap.com/)
  - **¿Por qué la elegí?**: Quería que la tienda se viera bien sin tener que escribir todo el CSS desde cero. Bootstrap me dio un montón de componentes predefinidos y clases de utilidad que me permitieron darle un estilo responsivo y prolijo a la `Navbar`, las tarjetas de productos, los formularios y los botones de una manera muy rápida.

---
