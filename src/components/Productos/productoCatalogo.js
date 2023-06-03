import React, {useContext,useState,useEffect} from 'react';
import {DataContext} from "../../context/DataProvider";
import { ProductoItem } from "./ProductoItem";
import {useParams} from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { addDays } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from  "react-datepicker";
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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
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

  useEffect(()=>{
    const values = `${detalle.img1}${url}${detalle.img2}`
    setImages(values);
  },[url,params.id])

  const handleInput=e=>{
    const number = e.target.value.toString().padStart(2,'01')
    setUrl(number)
    console.log(number)
  }
  if(detalle.length<1) return null;
  
        
  return (
    <>
      {
        <div className="detalles">
          
          <div className='precio_tamaño'>
            <h2>{detalle.title}</h2>
            <p className='price'>Q{detalle.price}</p>
            <div className='grid'>
              <div className='size'>
                <p>Tamaño</p>
                <select placeholder='Tamaño'>
                  <option value="1">5</option>
                  <option value="1">6</option>
                  <option value="1">7</option>
                  <option value="1">8</option>
                  <option value="1">9</option>
                </select>
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
                  selected={startDate}
                  onChange={onChange}
                  startDate={startDate}
                  endDate={endDate}
                  excludeDates={[addDays(new Date(), 1), addDays(new Date(), 5)]}
                  selectsRange
                  selectsDisabledDaysInRange
                  inline/>
              </div>
            </div>
            <button className='btn' onClick={()=>addCarrito(detalle.id)}>Añadir al carrito</button>
          </div>
          
          <div className='contenedorImg'>

            {
              url ? <img src={images} alt={detalle.title} /> :<img src={detalle.image} alt={detalle.title} />
            }
          </div>
            <input type="range" min="1" max="5" onChange={handleInput}></input>
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