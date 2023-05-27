import React, { useContext } from "react";
import IMG from '../../images/Disfraz1.png';
import {link} from "react-router-dom";
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
            <a href="#">
                <div className="producto_img">
                <img src={image} alt="title"></img>
                </div>
            </a>
            <div className="producto_footer">
                <h1>{title}</h1>
                <p>{category}</p>
                <p className="price">Q{price}</p>
            </div>
            <div className="button">
                <button className="btn" onClick={()=>addCarrito(id)}>Añadir al carrito</button>
                <div>
                <a href="#" className="btn">Vista</a>
                </div> 
            </div>       
        </div> 
    )
}