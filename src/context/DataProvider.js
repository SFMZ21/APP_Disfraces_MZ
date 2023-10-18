import React, {createContext, useState, useEffect } from "react";
import { firestore } from "../firebase.js";
import { collection,getDocs } from "firebase/firestore";
import swal from "sweetalert";
export const DataContext = createContext();

export const DataProvider = (props) =>{
    const [productos, setProductos] = useState([])
    const [menu,setMenu]= useState(false); /*manejador de estado del carrito*/ 
    const [carrito,setCarrito]=useState([]);
    const [total,setTotal] =useState(0);

    /**fechas para el carrito */
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);

    useEffect(()=>{
       const obtenerDatos = async()=>{
        try{
            const productsCollection = collection(firestore,'products');
            const snapshot = await getDocs(productsCollection);
            const data= snapshot.docs.map((doc)=>doc.data());
            setProductos(data);

        }catch(e){
            console.error("Algo salió mal...",e);
        }
       };
       obtenerDatos();
        

    },[])

    const addCarrito =(id, startDate, endDate)=>{
        const check =carrito.every(item=>{
            return item.id !== id;
        })
        if(check){
            const data = productos.filter(producto=>{
                return producto.id == id
            })
            setCarrito([...carrito,...data])
            swal({
                title:"¡Producto añadido correctamente!",
                icon: "success",
              });
            
        }else{
            swal({
                title:"¡El producto ya ha sido añadido al carrito!",
                icon: "warning",
              });
        }

        /**enviar fechas al carrito */
        setStartDate(startDate);
        setEndDate(endDate);
    }

    useEffect(()=>{
        const dataCarrito = JSON.parse(localStorage.getItem('dataCarrito'))
        if(dataCarrito){
            setCarrito(dataCarrito)
        }
    },[])

    useEffect(()=>{
        localStorage.setItem('dataCarrito', JSON.stringify(carrito))
    },[carrito])

    useEffect(()=>{
        const getTotal=()=>{
            const res = carrito.reduce((prev,item)=>{
                return prev + (item.price * item.cantidad)
            },0)
            setTotal(res);
        }
        getTotal()
    },[carrito])
    

    const value ={
        productos:[productos],
        menu:[menu,setMenu],
        addCarrito: addCarrito,
        carrito:[carrito,setCarrito],
        total:[total,setTotal],
        startDate:[startDate,setStartDate],
        endDate:[endDate, setEndDate]
    }

    return(
        <DataContext.Provider value={value}>
            {props.children}
        </DataContext.Provider>
    )
}