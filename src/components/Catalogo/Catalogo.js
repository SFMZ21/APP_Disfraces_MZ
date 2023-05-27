import React, {useContext} from "react";
import { DataContext } from "../../context/DataProvider";


    export const Catalogo =()=>{
    const value = useContext(DataContext);
    const [menuCatalogo,setMenuCatalogo]= value.menu;
    const tooglefalse =()=>{
        setMenuCatalogo(false);
    }


    const showCatalogos = menuCatalogo ? "catalogos show": "catalogos";
    const showCatalogo = menuCatalogo ? "catalogo show": "catalogo";


    return(
     <div className={showCatalogos}>
        <div className={showCatalogo}>
            <div className="catalogo_close">
                <box-icon name="x"></box-icon>
            </div>
            <h2>Bienvenido al catálogo</h2>
        
        </div>

     </div>
    )

}