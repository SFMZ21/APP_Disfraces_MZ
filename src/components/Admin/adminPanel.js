import React, { useState } from 'react';
import { ProductoNuevo } from '../Productos/productoNuevo';
import {Link} from 'react-router-dom';
import Logo from "../../images/addDisfraz.png";
import Logo2 from "../../images/VerPedidos.png";
import Logo3 from "../../images/inventario.png";

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
      <img src={Logo} alt="logo" width="200"></img>
      
        <button className="add-button" onClick={openModal}>
           Agregar Disfraz
        </button>
      </div>
      <div className="content-box">
      <img src={Logo2} alt="logo" width="200"></img>
        <div className='verPedido'> 
          <Link to={`/adminPanel/pedidosAdmin`} className="btn">Ver Pedidos</Link>
        </div> 
      </div>
      <div className="content-box">
        <img src={Logo3} alt="logo" width="200"></img>
        <div className='verPedido'> 
          <Link to={`/adminPanel/inventario`} className="btn">Inventario</Link>
        </div> 
      </div>

      {isModalOpen && (
        <ProductoNuevo onClose={closeModal} />
      )}
    </div>
  );
};

