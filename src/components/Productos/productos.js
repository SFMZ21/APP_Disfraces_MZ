import React, {useContext, useEffect} from "react";
import { DataContext } from "../../context/DataProvider";
import { ProductoItem } from "./ProductoItem";
import { usePurchaseTime } from "../../context/purchaseTimeContext";

export const ListaProductos =()=>{

    const value = useContext(DataContext)
    const [productos] = value.productos
    const { setPurchaseTimeStart} = usePurchaseTime(); // Obtén la función para configurar PurchaseTimeStart

    useEffect(() => {
      const currentTime = new Date(); // Obtiene la hora actual
      setPurchaseTimeStart(currentTime); // Configura PurchaseTimeStart en el contexto
    }, [setPurchaseTimeStart]);

    return(
        <>
        <h1 className="title">Productos</h1>
        <div className="productos">
            {
                productos.map(producto=>(
                    <ProductoItem 
                    key={producto.id}
                    id ={producto.id}
                    title={producto.title}
                    price= {producto.price}
                    image= {producto.image} 
                    category ={producto.category}
                    cantidad={producto.cantidad}
                    size={producto.size}
                    />
                ) )
            }
            
    
        </div>
        </>
     
    )

}