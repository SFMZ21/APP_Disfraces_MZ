import logo from './logo.svg';
import { Navbar } from './components/Navbar/navbar';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Paginas } from './components/Paginas';
import 'boxicons';

function App() {
  return (
    <div className='App'>
      <Router>
        <Navbar/>
        <Paginas/>
      </Router>
    </div>
  );
}

export default App;
