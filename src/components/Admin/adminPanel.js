import React, { useState } from 'react';
import { ProductoNuevo } from '../Productos/productoNuevo';

export const AdminPanel = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
    };

  return (
    <div className="admin-panel">
      <div className="add-costume">
        <button className="add-button" onClick={openModal}>
           Agregar Disfraz
        </button>
      </div>
      <div className="content-box">
        {/* Contenido del segundo div */}
      </div>
      <div className="content-box">
        {/* Contenido del tercer div */}
      </div>

      {isModalOpen && (
        <ProductoNuevo onClose={closeModal} />
      )}
    </div>
  );
};

