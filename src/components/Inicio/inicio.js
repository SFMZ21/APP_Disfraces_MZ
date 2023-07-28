import React from "react";
import ImageSlider from '../Inicio/slider';
import IMGLOGO from '../../images/BienvenidaHada.svg';
import PedidosByUser from "./pedidosByUser";
export const Inicio=()=>{
    
  
    return(
        <div className="inicio">
            <h1 className="title">Bienvenido a Disfraces MZ</h1>

            <div>
                <ImageSlider />
                <PedidosByUser></PedidosByUser>
                
            </div>
        </div>
    )

}