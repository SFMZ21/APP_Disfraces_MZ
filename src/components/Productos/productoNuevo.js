import React, { useState } from 'react';
import firebase from 'firebase/app';
import  'firebase/storage';

export const ProductoNuevo= () => {
  const [formData, setFormData] = useState({
    title: '',
    initialQuantity: 0,
    price: 0,
    category: '',
    stockQuantity: 0,
    inUseQuantity: 0,
    images: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    const imageUrls = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = firebase.storage().ref(`images/${file.name}`);
      await storageRef.put(file);
      const url = await storageRef.getDownloadURL();
      imageUrls.push(url);
    }

    setFormData({
      ...formData,
      images: imageUrls,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = { ...formData };
      delete productData.images; // We remove images from the product data since it's not a valid field to store in Firestore

      // Add the product to the "products" collection in Firebase
      await firebase.firestore().collection('products').add(productData);

      alert('Producto agregado con éxito');
      // Clear the form after successful submission
      setFormData({
        title: '',
        initialQuantity: 0,
        price: 0,
        category: '',
        stockQuantity: 0,
        inUseQuantity: 0,
        images: [],
      });
    } catch (error) {
      console.error('Error al agregar el producto:', error);
    }
  };

  return (
    <div>
      <h2>Agregar Producto</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Título:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="initialQuantity">Cantidad Inicial:</label>
          <input
            type="number"
            id="initialQuantity"
            name="initialQuantity"
            value={formData.initialQuantity}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="price">Precio:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="category">Categoría:</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="stockQuantity">Cantidad en Stock:</label>
          <input
            type="number"
            id="stockQuantity"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="inUseQuantity">Cantidad en Uso:</label>
          <input
            type="number"
            id="inUseQuantity"
            name="inUseQuantity"
            value={formData.inUseQuantity}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="images">Imágenes:</label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            required
          />
        </div>
        <div>
          <button type="submit">Agregar Producto</button>
        </div>
      </form>
    </div>
  );
};


