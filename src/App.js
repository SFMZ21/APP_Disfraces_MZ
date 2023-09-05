import React from 'react';
import { Navbar } from './components/Navbar/navbar';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import 'boxicons';
import { DataProvider } from './context/DataProvider';
import { Login } from './components/Login/login';
import {AuthProvider} from "./context/authContext";
import {ListaProductos} from './components/Productos/productos';
import {Register} from './components/Login/register';
import {Inicio} from './components/Inicio/inicio';
import { ProtectedRoute } from './components/Login/protectedRoutes';
import { Carrito } from './components/Carrito/carrito';
import { ProductoCatalogo } from './components/Productos/productoCatalogo';
import {ProductoNuevo} from './components/Productos/productoNuevo';

function App() {

  return (
    <AuthProvider>
      <DataProvider>
        <div className='App'>
        <Routes>
                <Route path="/" element={ <ProtectedRoute>
                <Navbar />  
                <Inicio />
                <Carrito/>
                </ProtectedRoute>} ></Route>
                <Route path="/productos"  element={ <ProtectedRoute>
                <Navbar />
                <ListaProductos />
                <Carrito/>
                </ProtectedRoute>}></Route>
                <Route path="/productos/:id"  element={ <ProtectedRoute>
                <Navbar />
                <Carrito/>
                <ProductoCatalogo/>
                </ProtectedRoute>}></Route>
                <Route path="/inventario"  element={ <ProtectedRoute>
                <Navbar />
                <Carrito/>
                <ProductoNuevo/>
                </ProtectedRoute>}></Route>
                <Route path="/login" element={<Login/>}></Route>
                <Route path="/register" element={<Register/>}></Route>
          </Routes>
        </div>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;