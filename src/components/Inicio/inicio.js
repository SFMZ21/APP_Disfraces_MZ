import React from "react";
import ImageSlider from '../Inicio/slider';
import IMGLOGO from '../../images/BienvenidaHada.svg';
export const Inicio=()=>{
    
  
    return(
        <div className="inicio">
            <h1 className="title">Bienvenido a Disfraces MZ</h1>

            <div>
                <ImageSlider />
            </div>
        </div>
    )

}