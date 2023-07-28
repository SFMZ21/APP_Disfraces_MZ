import React, {useContext} from "react";
import { DataContext } from "../../context/DataProvider";
import { ProductoItem } from "./ProductoItem";

export const ListaProductos =()=>{

    const value = useContext(DataContext)
    const [productos] = value.productos

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