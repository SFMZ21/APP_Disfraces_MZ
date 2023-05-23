import React from "react";
import { useState } from "react";
import {BrowserRouter as Router, Route, Routes, Redirect} from "react-router-dom";
import {Inicio} from "../Inicio/inicio";
import { ListaProductos } from "../Productos/productos";
import { Login } from "../Login/login";

export const Paginas =()=>{
    const [logged, setLogged] = useState(true);

    return(
        <section>
                <Route path="/" exact component={Inicio} ></Route>
                <Route path="/productos"  exact component={ListaProductos}></Route>
                <Route path="/login" exact component={Login}></Route>
                
        </section>
    )

}