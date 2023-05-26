import React, { useState } from "react";
import Logo from '../../images/BienvenidaHada.svg'
import { useAuth } from "../../context/authContext";
import {Navigate, useNavigate} from "react-router-dom";


export const Register =() => {
  const[user, setUser] = useState({
    email:'',
    password:'',
  });

  const{registro} =useAuth();

  const navigate = useNavigate();

  const manejadorFormulario = ({target:{name,value}})=>{
    setUser({...user,[name]:value})
  }

  const manejadorEnvio = async(e)=>{
    e.preventDefault();
    try {
      await registro(user.email,user.password);
      navigate('/')
    } catch (error) {
      console.log(error);
    }
  }

  return(
    <div className="login-general">
      <div className="login-container">
       
        <form className="login-form" onSubmit={manejadorEnvio}>
        <h1 className="title-login">¡Registrate!</h1>

         
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input type="email" className="form-control" id="email" name="email" onChange={manejadorFormulario} required autoComplete="off" placeholder="Ingresa tu correo electrónico" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input type="password" className="form-control" id="password" name="password" onChange={manejadorFormulario} required autoComplete="off" placeholder="Ingresa tu contraseña" />
          </div>
          <button type="submit" className="login-btn">Registrar</button>
          
        </form>

          <div class="logo-login">
          <img src={Logo} alt="title"></img>
          </div>
        </div>
      </div>
 
)
}