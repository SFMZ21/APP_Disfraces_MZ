import React, { useContext } from "react";
import IMG from '../../images/Disfraz1.png';
import {Link} from "react-router-dom";
import { DataContext } from "../../context/DataProvider";

export const ProductoItem = ({
    id,
    title,
    price,
    image,
    category
}) =>{
    

    const value = useContext(DataContext);
    const addCarrito = value.addCarrito;
    

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
                <p className="price">Q{price}</p>
            </div>
            <div className="button">
                <button className="btn" onClick={()=>addCarrito(id)}>Añadir al carrito</button>
                <div>
                <Link to={`/productos/${id}`} className="btn">Vista</Link>
                </div> 
            </div>       
        </div> 
    )
}