import React from "react";
import Logo from '../../images/Logo.png'
// import {useNavigate} from "react-router-dom";


export const Register =() => {
  // const navigate  = useNavigate();

  const {name,email,password,onInputChange,onResetForm}=
  useForm({
    name:'',
    email: '',
    password: '',
  });

  const onRegister = (e) =>{
      e.preventDefault()

      navigate('/',{
        replace: true,
        state:{
          logged: true,
          name,
        },
      })
  }

  return(
    <div className="login-general">
      <div className="login-container">
       
        <form className="login-form" onSubmit={onRegister}>
        <h1 className="title-login">¡Registrate!</h1>

          <div className="form-group">
            <label htmlFor="email">Nombre:</label>
            <input type="name" className="form-control" id="name" value={name} onChange={onInputChange} required autoComplete="off" placeholder="Ingresa tu nombre de usuario" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input type="email" className="form-control" id="email" value={email} onChange={onInputChange} required autoComplete="off" placeholder="Ingresa tu correo electrónico" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input type="password" className="form-control" id="password" value={password} onChange={onInputChange} required autoComplete="off" placeholder="Ingresa tu contraseña" />
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