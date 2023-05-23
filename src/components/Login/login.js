import React from "react";
import Logo from '../../images/LogoBlanco2.png'
import { useForm } from "./useform";
import {  } from 'react-router-dom';

export const Login =() => {

  //const history = useHistory();

  var email = "sulma@fab.com";
  var pass = "SFMZ2023"


  // const {email,password,onInputChange,onResetForm}=
  // useForm({
  //   email: '',
  //   password: '',
  // });

  const onLogin = (e) =>{
    e.preventDefault()

    const formData = new FormData(e.target);
    const formObject = Object.fromEntries(formData.entries());

    console.log(formData);
    if (formObject.email == email && formObject.password == pass){
      alert("Hola")
      //history.push("/inicio");
    }
  }

  return(
    <div className="login-general">
      <div className="login-container">
       
        <form className="login-form" onSubmit={onLogin}>
        <h1 className="title-login">Iniciar Sesión</h1>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input type="email" className="form-control" name='email' id='email'  required autoComplete="off" placeholder="Ingresa tu correo electrónico" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input type="password" className="form-control" name="password" id="password"  required autoComplete="off" placeholder="Ingresa tu contraseña" />
          </div>
          <button type="submit" className="login-btn">Iniciar Sesión</button>
          <button type="submit" className="login-btn2">Crear una cuenta</button>
        </form>

          <div class="logo-login">
          <img src={Logo} alt="title"></img>
          </div>
        </div>
      </div>
 
)
}