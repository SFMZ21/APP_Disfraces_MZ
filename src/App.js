import logo from './logo.svg';
import { Navbar } from './components/Navbar/navbar';
import { ListaProductos } from './components/Productos/productos';
import 'boxicons';

function App() {
  return (
    <div className='App'>
      <Navbar></Navbar>
    <ListaProductos></ListaProductos>
    </div>
  );
}

export default App;
