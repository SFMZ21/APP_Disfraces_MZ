import React, {useContext,useState,useEffect} from 'react';
import CarouselSlider from '../Productos/carouselSlider';
import {DataContext} from "../../context/DataProvider";
import { ProductoItem } from "./ProductoItem";
import {useParams} from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { addDays, differenceInDays } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from  "react-datepicker";
import swal from "sweetalert";
import es from 'date-fns/locale/es';
registerLocale('es', es)



export const ProductoCatalogo=()=> {

  const value =useContext(DataContext)
  const [productos]=value.productos;
  const [detalle,setDetalle] =useState([]);
  const [url, setUrl] = useState(0);
  const [images, setImages] =useState('');
  const params = useParams();
  let item =0;

  /*Calendario */
  const [date, setDate] = useState(new Date());
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState();

  const handleChange = (range) => {
    const [startDate, endDate] = range;
    setStartDate(startDate);
    setEndDate(endDate);
    console.log(startDate,'inicio');
    console.log(endDate,'fin')
  };

  const isDateRangeValid = (start, end) => {
    // Define el máximo número de días permitidos para la reserva
    const maxDaysForReservation = 7;
    // Calcula la diferencia en días entre la fecha de inicio y la fecha de fin
    const differenceDays = differenceInDays(end, start);
    // Comprueba si la diferencia en días está dentro del límite permitido
    return differenceDays >= 0 && differenceDays <= maxDaysForReservation;
  };



  /**Carrito */
  const addCarrito = value.addCarrito;


  useEffect(()=>{
    productos.forEach(producto=>{
      item =0;
      if(producto.id === parseInt(params.id)){
        setDetalle(producto)
        setUrl(0)
      }
    })
  },[params.id,productos]);

  
        
  return (
    <>
      {
        <div className="detalles">
          
          <div className='precio_tamaño'>
            <h2>{detalle.title}</h2>
            <p className='price'>Q{detalle.price}</p>
            <div className='grid'>
              <div className='size'>
                <p>Talla</p>
                <h2>{detalle.size}</h2>
              </div>
              <div className='stock'>
                <p>Disponible</p>
                <h2>{detalle.enStock}</h2>
              </div>
          </div>
          </div>
          <div className='reservar'>
            <div className='calendario'>
              <div className='center'>
                <h3>Marca los días que quieres reservar</h3>
                <DatePicker 
                  className='my-datepicker'
                  showIcon
                  locale="es"
                  selected={date}
                  onChange={handleChange}
                  startDate={startDate}
                  endDate={endDate}
                  excludeDates={[addDays(new Date(), 1), addDays(new Date(), 5)]}
                  selectsRange
                  selectsDisabledDaysInRange
                  inline/>
              </div>
            </div>
            <button className='btn'  onClick={() => {
                  // Verifica si el rango de fechas seleccionado es válido antes de agregar el producto al carrito
                  if (isDateRangeValid(startDate, endDate)) {
                    // Verifica si el stock del producto es mayor que 0 antes de agregar al carrito
                      if (detalle.enStock > 0) {
                        addCarrito(detalle.id, startDate, endDate);
                      } else {
                        // Si el stock es 0, muestra un mensaje de error
                        swal({
                          title:"¡Lo sentimos, No hay suficiente Stock!",
                          text: "Te recomendamos ver disfraces relacionados",
                          icon: "warning",
                          button: "Aceptar"
                        });
                      }
                  } else {
                     // Si el rango de fechas no es válido, muestra un alert al usuario
                    swal({
                      title:"¡El rango de fechas seleccionado no es válido!",
                      text: "Por favor, selecciona un rango de fechas de hasta 7 días",
                      icon: "warning",
                      button: "Aceptar"
                    });
                  }
            }}>Añadir al carrito</button>
          </div>
          
          <div className='carousel-container'>
          <CarouselSlider images={[detalle.image, detalle.img1, detalle.img2, detalle.img3]} />
          </div>
        
         
            <div className='description'>
              <p><b>Disfraz perfecto para la época de carnaval,Disfraz perfecto para la época de carnavaDisfraz perfecto para la época de carnavaDisfraz perfecto para la época de carnava</b></p>
            </div>

            <h2>Productos Relacionados</h2>
            <div className="productos">
            {
              productos.map((producto)=>{
                if((item<6)&&(detalle.category === producto.category)){
                  item++;
                  return <ProductoItem 
                  key={producto.id}
                  id ={producto.id}
                  title={producto.title}
                  price= {producto.price}
                  image= {producto.image} 
                  category ={producto.category}
                  cantidad={producto.cantidad}
                  size={producto.size}
                  />
                }
              } )
            }
            
    
        </div>
        </div>
      }
    </>
  );
}
