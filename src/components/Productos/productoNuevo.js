import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ProductoNuevo = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    cantidad: 1,
    enUso: 0,
    enStock: 0,
    id: '',
    image: null,
    img1: null,
    img2: null,
    img3: null,
    price: 0,
    size: '',
  });

  const [error, setError] = useState('');

  const history = useNavigate();

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validación de precio no negativo
    if (formData.price < 0) {
      setError('El precio no puede ser negativo');
      return;
    }

    // Procesa los datos del formulario como lo necesites
    // ...

    // Cierra el modal y regresa a la página anterior
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) : value, // Convierte a número si es el campo de precio
    });
    setError(''); // Limpia el mensaje de error al cambiar los valores
  };

  return (
    <div className="modalProducto">
      <div className="modalProducto-content">
        <h2>Agregar Producto</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Categoría:</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Precio:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Tamaño:</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>En Uso:</label>
            <input
              type="number"
              name="enUso"
              value={formData.enUso}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>En Stock:</label>
            <input
              type="number"
              name="enStock"
              value={formData.enStock}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>ID:</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Imagen Principal (PNG):</label>
            <input
              type="file"
              accept=".png"
              name="image"
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Imagen 1 (PNG):</label>
            <input
              type="file"
              accept=".png"
              name="img1"
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Imagen 2 (PNG):</label>
            <input
              type="file"
              accept=".png"
              name="img2"
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Imagen 3 (PNG):</label>
            <input
              type="file"
              accept=".png"
              name="img3"
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button className='buttonPN' type="submit">Guardar</button>
        </form>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

