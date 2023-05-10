import React from "react";
import IMG from "../../images/Disfraz1.png"

export const ListaProductos =()=>{
    return(
        <>
        <h1 className="title">PRODUCTOS</h1>
        <div className="productos">
            <div className="producto">
            <a href="#">
                <div className="producto_img">
                <img src={IMG} alt=""></img>
                </div>
            </a>
            <div className="producto_footer">
                <h1>Title</h1>
                <p>Categoría</p>
                <p className="price">Q150</p>
            </div>
            <div className="button">
                <button className="btn">Añadir al carrito</button>
                <div>
                <a href="#" className="btn">Vista</a>
                </div> 
            </div>       
            </div> 

            <div className="producto">
            <a href="#">
                <div className="producto_img">
                <img src={IMG} alt=""></img>
                </div>
            </a>
            <div className="producto_footer">
                <h1>Title</h1>
                <p>Categoría</p>
                <p className="price">Q150</p>
            </div>
            <div className="button">
                <button className="btn">Añadir al carrito</button>
                <div>
                <a href="#" className="btn">Vista</a>
                </div> 
            </div>       
            </div>

            <div className="producto">
            <a href="#">
                <div className="producto_img">
                <img src={IMG} alt=""></img>
                </div>
            </a>
            <div className="producto_footer">
                <h1>Title</h1>
                <p>Categoría</p>
                <p className="price">Q150</p>
            </div>
            <div className="button">
                <button className="btn">Añadir al carrito</button>
                <div>
                <a href="#" className="btn">Vista</a>
                </div> 
            </div>       
            </div> 

            <div className="producto">
            <a href="#">
                <div className="producto_img">
                <img src={IMG} alt=""></img>
                </div>
            </a>
            <div className="producto_footer">
                <h1>Title</h1>
                <p>Categoría</p>
                <p className="price">Q150</p>
            </div>
            <div className="button">
                <button className="btn">Añadir al carrito</button>
                <div>
                <a href="#" className="btn">Vista</a>
                </div> 
            </div>       
            </div>

        </div>
        </>
     
    )

}