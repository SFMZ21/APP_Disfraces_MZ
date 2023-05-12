import { Navbar } from './components/Navbar/navbar';
import { BrowserRouter as Router } from 'react-router-dom';
import { Paginas } from './components/Paginas/Paginas';
import 'boxicons';
import { DataProvider } from './context/DataProvider';

function App() {
  return (
    <DataProvider>
      <div className='App'>
        <Router>
          <Navbar/>
          <Paginas/>
        </Router>
      </div>
    </DataProvider>
  );
}

export default App;