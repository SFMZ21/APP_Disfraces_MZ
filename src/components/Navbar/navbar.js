import React, {useContext} from "react";
import Logo from "../../images/LogoHeader6.svg";
import {Link} from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { DataContext } from "../../context/DataProvider";

export const Navbar =()=>{
    const value = useContext(DataContext);
    const [menu,setMenu] = value.menu;
    const [carrito] = value.carrito;

    const toogleMenu =()=>{
        setMenu(!menu) /*cambia el valor del menu */
    }


    const {logOut,user}=useAuth();
    const cerrarSesion= async()=>{
        try {
            await logOut();
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <navbar>
            <Link to="/">
                <div className="logo">
                    <img src={Logo} alt="logo" width="300"></img>
                </div>
            </Link>
            <ul>
                <li>
                    <Link to="/">INICIO</Link>
                </li>
                <li>
                    <Link to="/productos">PRODUCTOS</Link>
                </li>
                <li>
                    <Link to="/inventario">INVENTARIO</Link>
                </li>
            
            </ul>
            <button type="submit" className="logOut-btn" onClick={cerrarSesion}>CERRAR SESION</button>
            <div className="user">
                <span className="username">{user.displayName}</span>
            </div>
            <div className="cart" onClick={toogleMenu}>
                <box-icon name="cart"></box-icon>
                <span className="item_total">{carrito.length}</span>

            </div>
        </navbar>
    )

}