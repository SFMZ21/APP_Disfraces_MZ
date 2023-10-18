import React, { useContext, useState, useEffect } from 'react';
import Card from '../../images/BienvenidaHada.svg';
import { DataContext } from '../../context/DataProvider';
import ReservationForm from './reservationForm';
import swal from "sweetalert";

export const Carrito=()=>{
    const value = useContext(DataContext);
    const [menu,setMenu]= value.menu;
    const [carrito,setCarrito]=value.carrito;
    const [total] =value.total;

    const [date, setDate] = useState(new Date());
    const [startDate, setStartDate] = value.startDate;
    const [endDate, setEndDate] = value.endDate;

    const tooglefalse =()=>{
        setMenu(false);
    }
    
    const resta =id =>{
        carrito.forEach(item =>{
            if(item.id === id){
                item.cantidad === 1 ? item.cantidad =1: item.cantidad -=1;
            }
            setCarrito([...carrito])
        })
    }

    const suma =id =>{
        carrito.forEach((item) => {
            if (item.id === id) {
              if (item.cantidad < item.enStock) {
                item.cantidad = item.cantidad + 1;
              } else {
                swal({
                    title:"¡No hay suficiente Stock!",
                    text: "Te recomendamos ver disfraces relacionados",
                    icon: "warning",
                    button: "Aceptar"
                  });
              }
            }
          });
          setCarrito([...carrito]);
    };

    const removeProducto =id =>{
        swal({
            title:"Eliminar",
            text: "¿Quieres eliminar el producto del carrito?",
            icon: "warning",
            buttons: ["No","Sí"]
          }).then(respuesta=>{
            if(respuesta){
                carrito.forEach((item,index)=>{
                    if(item.id === id){
                        item.cantidad=1;
                        carrito.splice(index,1)
                    }
                    
                })
                setCarrito([...carrito])     
            }
            
          })
        
    }

    /**función de mostrar formulario de reserva */
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => {
        if (carrito.length === 0) {
            swal({
                title:"¡Aún no hay productos en el carrito!",
                icon: "warning",
                button: "Aceptar"
              });
          } else {
            setShowModal(true);
          }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };
    
     // Limpia las fechas después de eliminar productos del carrito
    useEffect(() => {
    if (carrito.length === 0) {
      setStartDate(null);
      setEndDate(null);
    }
    }, [carrito]);


    const show1 = menu ? "carritos show": "carritos";
    const show2 = menu ? "carrito show": "carrito";

    return(
        <div className={show1}>
            <div className={show2}>
                <div className='carrito_close' onClick={tooglefalse}>
                    <box-icon name="x"></box-icon>
                </div>
                <h2>Su carrito</h2>
                <div className='carrito_center'>
            {
                carrito.length ===0 ? <h1 className='carritoVacio'>Carrito Vacío</h1> : <>
                {
                carrito.map((producto)=>(
                    <div className='carrito_item' key={producto.id}>
                        <img src={producto.image} alt=""/>
                        <div className='infoProducto'>
                            <h3>{producto.title}</h3>
                            <h3>Talla:{producto.size}</h3>
                            <p className='price'>Q{producto.price}</p>
                        </div>
                        <div>
                            <box-icon name="up-arrow" type="solid" onClick={()=>suma(producto.id)}></box-icon>
                            <p className='cantidad'>{producto.cantidad}</p>
                            <box-icon name="down-arrow" type="solid" onClick={()=>resta(producto.id)}></box-icon>
                        </div>
                        <div className='remove_item' onClick={()=>removeProducto(producto.id)}>
                            <box-icon name="trash"></box-icon>
                        </div>
                        </div>
                        )) 
                }
                </>
                }               
                </div>
                      
            
                <div className='carrito_footer'>
                    <div>
                        {/* Mostrar las fechas seleccionadas en el carrito */}
                        <p>Fecha de inicio: {startDate ? startDate.toLocaleDateString("es"): "No seleccionada"}</p>
                        <p>Fecha de fin: {endDate ? endDate.toLocaleDateString("es") : "No seleccionada"}</p>
                    </div>

                    <h3>Total:{total}</h3>
                    <div>
                        <button className='btn-pago' onClick={handleOpenModal}>Reservar</button>
                        {showModal && <ReservationForm onClose={handleCloseModal} />}
                    </div>
                    
                    
                </div>
            </div>
        </div>
    )
}