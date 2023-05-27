import React, { useContext } from 'react';
import Card from '../../images/BienvenidaHada.svg';
import { DataContext } from '../../context/DataProvider';

export const Carrito=()=>{
    const value = useContext(DataContext);
    const [menu,setMenu]= value.menu

    const tooglefalse =()=>{
        setMenu(false);
    }

    const show1 = menu ? "carritos show": "carritos";
    const show2 = menu ? "carrito show": "carrito";

    return(
        <div className={show1}>
            <div className={show2}>
                <div className='carrito_close' onClick={tooglefalse}>
                    <box-icon name="x"></box-icon>
                </div>
                <h2>Su carrito</h2>
                <div className='carrito_center'>
                    <div className='carrito_item'>
                        <img src={Card} alt="logo"/>
                        <div className='infoProducto'>
                            <h3>Disfraz de Mirabel-Encanto</h3>
                            <p className='price'>Q150.00</p>
                        </div>
                        <div>
                            <box-icon name="up-arrow" type="solid"></box-icon>
                            <p className='cantidad'>1</p>
                            <box-icon name="down-arrow" type="solid"></box-icon>
                        </div>
                        <div className='remove_item'>
                            <box-icon name="trash"></box-icon>
                        </div>
                        </div>
                </div>
                <div className='carrito_footer'>
                    <h3>Total: Q150.00</h3>
                    <button className='btn-pago'>Pagar</button>
                </div>
            </div>
        </div>
    )
}