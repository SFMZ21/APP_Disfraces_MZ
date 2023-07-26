import React, {createContext, useState, useEffect } from "react";
import Data from '../Data.js'
import { firestore } from "../firebase.js";
import { collection,getDocs } from "firebase/firestore";
export const DataContext = createContext();

export const DataProvider = (props) =>{
    const [productos, setProductos] = useState([])
    const [menu,setMenu]= useState(false); /*manejador de estado del carrito*/ 
    const [carrito,setCarrito]=useState([]);
    const [total,setTotal] =useState(0);

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

    const addCarrito =(id)=>{
        const check =carrito.every(item=>{
            return item.id !== id;
        })
        if(check){
            const data = productos.filter(producto=>{
                return producto.id == id
            })
            setCarrito([...carrito,...data])
        }else{
            alert("El producto se ha añadido al carrito")
        }
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
        total:[total,setTotal]
    }

    return(
        <DataContext.Provider value={value}>
            {props.children}
        </DataContext.Provider>
    )
}