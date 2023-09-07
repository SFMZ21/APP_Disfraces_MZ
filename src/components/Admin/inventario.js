import React, { useEffect, useState } from 'react';
import { firestore } from '../../firebase'; 
import { collection, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";

export function Inventario() {
  const [productos, setProductos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');


 const handleSaveEdit = async (productId) => {
  const productoRef = doc(firestore, "products", productId.toString());
  const updateFields = {};

  if (newPrice !== '') {
      updateFields.price = Number(newPrice);
    }

    if (newStock !== '') {
      updateFields.enStock = Number(newStock);
    }

    try {
      await updateDoc(productoRef, updateFields);

      // Limpiar el estado de edición
      setEditingProduct(null);
      setNewPrice('');
      setNewStock('');
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewPrice('');
    setNewStock('');
  };

  useEffect(() => {
    const productosRef = collection(firestore, "products");
    const unsubscribe = onSnapshot(productosRef, (snapshot) => {
      const nuevosProductos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(nuevosProductos);
    });
    return () => unsubscribe();
  },[]);

  return (
    <div>
      <div className="table-container">
      <input
          className='buscador'
          type="text"
          placeholder="Buscar por nombre del Producto"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />
      <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Titulo</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Talla</th>
            <th>En Stock</th>
            <th>En uso</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {productos
              .filter((productos) =>
                productos.title
                  .toLowerCase()
                  .includes(filtroNombre.toLowerCase())
              )
              .map((productos) => (
                <tr key={productos.title}>
                    <td>{productos.title}</td>
                    <td>{productos.category}</td>
                    <td>
                      {editingProduct === productos.id ? (
                        <input
                          type="text"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                        />
                      ) : (
                        productos.price
                      )}
                    </td>
                    <td>{productos.size}</td>
                    <td>
                      {editingProduct === productos.id ? (
                        <input
                          type="text"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                        />
                      ) : (
                        productos.enStock
                      )}
                    </td>
                    <td>{productos.enUso}</td>
                    <td>
                    {editingProduct === productos.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(productos.id)}>
                        <box-icon name='save' type='solid' color='#356eea' ></box-icon>
                        </button>
                        <button onClick={() => handleCancelEdit()}>
                        <box-icon name='x-circle' type='solid' color='#bf2a1b' ></box-icon>
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEditingProduct(productos.id)}>
                        <box-icon name='pencil' type='solid' animation='tada' color='#58c3da' ></box-icon>
                      </button>
                    )}
                    </td>
                </tr>
              ))}
        </tbody>
      </table>
      </div>
      </div>
    </div>
  );
}


