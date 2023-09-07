import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/authContext";

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

  //Estado de carga de las imagenes
  const [isUploading, setIsUploading] = useState(false);

  const [error, setError] = useState('');

  const history = useNavigate();
  const { newProduct } = useAuth(); // Obtiene la función newProduct desde useAuth

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    // Validación de precio no negativo
    if (formData.price < 0) {
      setError('El precio no puede ser negativo');
      return;
    }
  
    // Verifica que los campos de imagen sean archivos antes de llamar a newProduct
    if (!formData.image || !formData.img1 || !formData.img2 || !formData.img3) {
      setError('Debe seleccionar todas las imágenes.');
      return;
    }
  
    try {
      setIsUploading(true); // Comienza la carga de imágenes
  
      // Llama a la función newProduct para agregar el producto
      const success = await newProduct(formData);
  
      if (success) {
        // Cierra el modal y regresa a la página anterior si la operación fue exitosa
        onClose();
      } else {
        setError('Error al agregar el producto');
      }
    } catch (error) {
      setError('Error al agregar el producto');
    } finally {
      setIsUploading(false); // Finaliza la carga de imágenes (éxito o error)
    }
  };
  
  

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    // Verifica si se seleccionó un archivo
    if (files && files.length > 0) {
      // Asigna el archivo al campo correspondiente en formData
      setFormData({
        ...formData,
        [name]: files[0], // Aquí asignamos el primer archivo seleccionado
      });
    } else {
      // Resto del código para campos de texto
      setFormData({
        ...formData,
        [name]: name === 'price' ? parseFloat(value) : value,
      });
    }
    setError('');
  };


  return (
    <div className="modalProducto">
      <div className="modalProducto-content">
      <button onClick={onClose}>
      <box-icon name='x' color='#bf2a1b' ></box-icon>
      </button>
        <h2>Agregar Producto</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleFormSubmit}>
         
          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              className='inputNP'
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
              className='inputNP'
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
              className='inputNP'
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
              className='inputNP'
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
              className='inputNP'
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
              className='inputNP'
              name="enStock"
              value={formData.enStock}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Código de producto:</label>
            <input
              type="text"
              className='inputNP'
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
              className='inputNP'
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
              className='inputNP'
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
              className='inputNP'
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
              className='inputNP'
              accept=".png"
              name="img3"
              onChange={handleInputChange}
              required
            />
          </div>
          <button className='buttonPN' type="submit" disabled={isUploading}>
            {isUploading ? (
            <box-icon name='loader-circle' animation='tada' flip='horizontal'></box-icon>
              ) : (
            'Guardar'
            )}
          </button>

        </form>
        
      </div>
    </div>
  );
};
