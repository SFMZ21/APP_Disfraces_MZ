import React, { useState }  from "react";
import Logo from '../../images/LogoHada2.svg';
import LogoGoogle from '../../images/google.png';
import { useForm } from "./useform";
import {Navigate, useNavigate} from "react-router-dom";
import { useAuth } from "../../context/authContext";
import GoogleButton from 'react-google-button';

export function Login(){

  const[user,setUser] = useState({
    email:'',
    password:'',
  });

  const {login,logInGoogle}=useAuth();
  const navigate = useNavigate();

  const manejadorFormulario = ({target:{name,value}})=>{
    setUser({...user,[name]:value})
  }

  const navigateRegister =()=>{
    navigate('/register');
  }

  const manejadorEnvio = async(e)=>{
    e.preventDefault();
    try {
      await login(user.email,user.password);
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  const manejadorGoogle = async(e)=>{
    e.preventDefault();
    try {
      await logInGoogle();
      navigate('/')
    } catch (error) {
    }
  }

  return(
    <div className="login-general">
      <div className="login-container">
       
        <form className="login-form" onSubmit={manejadorEnvio}>
        <h1 className="title-login">Iniciar Sesión</h1>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input type="email" className="form-control" name='email' id='email' onChange={manejadorFormulario} required autoComplete="off" placeholder="Ingresa tu correo electrónico" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input type="password" className="form-control" name="password" id="password" onChange={manejadorFormulario} required autoComplete="off" placeholder="Ingresa tu contraseña" />
          </div>
          <button type="submit" className="login-btn">Iniciar Sesión</button>
          <button className="login-btn3" onClick={manejadorGoogle}><img src={LogoGoogle} className="image-google" height="30"/>Iniciar Sesión con Google</button>
          <button className="login-btn2"onClick={navigateRegister}>Crear una cuenta</button>
        </form>

          <div class="logo-login">
          <img src={Logo} alt="title"></img>
          </div>
        </div>
      </div>
 
)
} export default Login;