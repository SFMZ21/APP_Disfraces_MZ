import React from "react";
import IMGLOGO from '../../images/BienvenidaHada.svg';

export const Inicio=()=>{
  
    return(
        <div className="inicio">
            <h1 className="title">Bienvenido a Disfraces MZ</h1>
            <img src={IMGLOGO} alt="logo" width="800"></img>

            <h1 className="title">Mis disfraces</h1>
        </div>
    )

}