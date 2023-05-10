import React from "react";
import Logo from "../../images/LogoHeader6.svg"

export const Navbar =()=>{
    return(
        <navbar>
            <a href="#">
                <div className="logo">
                    <img src={Logo} alt="logo" width="300"></img>
                </div>
            </a>
            <ul>
                <li>
                    <a href="#">INICIO</a>
                </li>
                <li>
                    <a href="#">PRODUCTOS</a>
                </li>
            </ul>
            <div className="cart">
                <box-icon name="cart"></box-icon>
                <span className="item_total">0</span>

            </div>
        </navbar>
    )

}