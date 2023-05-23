import React from "react";
import Logo from "../../images/LogoHeader6.svg";
import {Link} from "react-router-dom";

export const Navbar =()=>{
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
                    <Link to="/login">INICIAR SESION</Link>
                </li>
            </ul>
            <div className="user">
                <span className="username">Sulma</span>
            </div>
            <div className="cart">
                <box-icon name="cart"></box-icon>
                <span className="item_total">0</span>

            </div>
        </navbar>
    )

}