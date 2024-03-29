import React, { useContext } from "react";
import {Link} from "react-router-dom";
import { DataContext } from "../../context/DataProvider";

export const ProductoItem = ({
    id,
    title,
    price,
    image,
    size,
    category
}) =>{
    

    const value = useContext(DataContext);
    const addCarrito = value.addCarrito;
    console.log(DataContext, 'tamaño');
    

    return(
        <div className="producto">
            <Link to={`/productos/${id}`}>
                <div className="producto_img">
                <img src={image} alt="title"></img>
                </div>
            </Link>
            <div className="producto_footer">
                <h1>{title}</h1>
                <p>{category}</p>
                <h1>Talla:{size}</h1>
                <p className="price">Q{price}</p>
            </div>
            <div className="button">
                
                <div>
                <Link to={`/productos/${id}`} className="btn">Vista</Link>
                </div> 
            </div>       
        </div> 
    )
}