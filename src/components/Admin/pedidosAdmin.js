import React, { useEffect, useState } from 'react';
import { firestore } from '../../firebase'; 
import { collection, onSnapshot, doc, updateDoc, increment } from "firebase/firestore"; 

export function PedidosAdmin() {
  const [reservas, setReservas] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');

  // Define una función para actualizar el estado de la reserva y los productos
  const actualizarReserva = (reserva , estado) => {
    // Actualiza el estado de la reserva
    const reservaRef = doc(firestore, "pedidos", reserva.id.toString());
    updateDoc(reservaRef, {'reserva.estado': estado });

    // Actualiza los campos "enStock" y "enUso" de los productos
    reserva.carrito.forEach((producto) => {
      const docRef = doc(firestore, "products", producto.id.toString());
      updateDoc(docRef, {
        enStock: increment(producto.cantidad),
        enUso: increment(-producto.cantidad),
      });
    });
  };

  useEffect(() => {
    const reservasRef = collection(firestore, "pedidos");

    const unsubscribe = onSnapshot(reservasRef, (snapshot) => {
      const nuevasReservas = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data().reserva, // Accede a la parte "reserva" del documento
        startDate: doc.data().reserva.startDate.toDate(), // Convierte el Timestamp a Date
        endDate: doc.data().reserva.endDate.toDate(), // Convierte el Timestamp a Date
      }));
      setReservas(nuevasReservas);
    });
    return () => unsubscribe();
  },[]);

  return (
    <div>
      <div className="table-container">
      <input
          className='buscador'
          type="text"
          placeholder="Buscar por nombre del cliente"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />
      <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Fecha de Inicio</th>
            <th>Fecha de Fin</th>
            <th>Total</th>
            <th>Carrito</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {reservas
              .filter((reserva) =>
                reserva.nombre
                  .toLowerCase()
                  .includes(filtroNombre.toLowerCase())
              )
              .map((reserva) => (
                <tr key={reserva.id}>
                    <td>{reserva.nombre}</td>
                    <td>{reserva.apellido}</td>
                    <td>{reserva.email}</td>
                    <td>{reserva.telefono}</td>
                    <td>{reserva.estado}</td>
                    <td>{reserva.startDate.toLocaleDateString()}</td>
                    <td>{reserva.endDate.toLocaleDateString()}</td>
                    <td>{reserva.total}</td>
                    <td>
                    <ul>
                    {reserva.carrito.map((item, index) => (
                        <li key={index}>
                        Cantidad: {item.cantidad}, 
                        Producto: {item.title}, 
                        Precio: {`Q${item.price}`}
                        </li>
                    ))}
                    </ul>
                    </td>
                    <td>
                    {reserva.estado === 'en Alquiler' && (
                      <button className="btn-completado"  onClick={() => actualizarReserva(reserva, "completado")}>
                        Completar
                      </button>
                    )}

                      {reserva.estado === 'en Proceso' && (
                      <button className="btn-alquiler" onClick={() => actualizarReserva(reserva, "en Alquiler")}>
                        Alquilar
                      </button>
                    )}
                  </td> 
                  <td>
                    {(reserva.estado === 'en Alquiler'|| reserva.estado === 'en Proceso') &&  (
                      <button className="btn-cancelar" onClick={() => actualizarReserva(reserva, "cancelado")}>
                        Cancelar
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

