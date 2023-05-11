import React from "react";
import {BrowserRouter as Router,Route, Routes} from "react-router-dom";
import {Inicio} from "./Inicio/inicio";
import { ListaProductos } from "./Productos/productos";

export const Paginas =()=>{
    return(
        <section>
            <Route path="/" component={Inicio}></Route>
            <Route path="/productos"  component={ListaProductos}></Route>
            
        </section>
    )

}