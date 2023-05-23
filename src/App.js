import React from 'react';
import { Navbar } from './components/Navbar/navbar';
import { BrowserRouter as Router } from 'react-router-dom';
import { Paginas } from './components/Paginas/Paginas';
import 'boxicons';
import { DataProvider } from './context/DataProvider';
import { useState } from 'react';
import { Login } from './components/Login/login';

function App() {

  const user = {logged: false}
  const context = React.createContext(user);
  const [logged, setLogged] = useState(false);

  if (!logged) {
    return <Login></Login>;
  }

  return (
   <context.Provider>
     <DataProvider>
      <div className='App'>
        <Router>
          {logged ? <Navbar/> : null}
          <Paginas />
        </Router>
      </div>
    </DataProvider>
   </context.Provider>
  );
}

export default App;