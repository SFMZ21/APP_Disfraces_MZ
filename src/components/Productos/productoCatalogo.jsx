import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import { addDays } from "date-fns";
import { es } from "date-fns/locale";
import swal from "sweetalert";
import "react-datepicker/dist/react-datepicker.css";
import { useStore } from "../../context/DataProvider";
import { usePurchaseTime } from "../../context/purchaseTimeContext";
import { isReservationRangeValid } from "../../utils/reservation";
import CarouselSlider from "./carouselSlider";
import { ProductoItem } from "./ProductoItem";

registerLocale("es", es);

export function ProductoCatalogo() {
  const { id } = useParams();
  const {
    productos,
    productsLoading,
    productsError,
    addCarrito,
  } = useStore();
  const { PurchaseTimeStart, setPurchaseTimeStart } = usePurchaseTime();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const product = useMemo(
    () =>
      productos.find(
        (item) => item.documentId === id || String(item.id) === String(id),
      ),
    [id, productos],
  );

  const relatedProducts = useMemo(
    () =>
      productos
        .filter(
          (item) =>
            item.documentId !== product?.documentId &&
            item.category === product?.category,
        )
        .slice(0, 6),
    [product, productos],
  );

  useEffect(() => {
    if (!PurchaseTimeStart) {
      setPurchaseTimeStart(new Date());
    }
  }, [PurchaseTimeStart, setPurchaseTimeStart]);

  useEffect(() => {
    setStartDate(null);
    setEndDate(null);
  }, [id]);

  const handleDateChange = ([start, end]) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleAddToCart = () => {
    if (!isReservationRangeValid(startDate, endDate)) {
      swal({
        title: "Selecciona un rango válido.",
        text: "La reserva debe iniciar hoy o después y durar hasta siete días.",
        icon: "warning",
      });
      return;
    }

    if (product.enStock < 1) {
      swal({
        title: "No hay existencias disponibles.",
        text: "Puedes revisar los disfraces relacionados.",
        icon: "warning",
      });
      return;
    }

    addCarrito(product.documentId, startDate, endDate);
  };

  if (productsLoading) {
    return <p className="page-status" role="status">Cargando producto…</p>;
  }

  if (productsError) {
    return <p className="error-message" role="alert">{productsError}</p>;
  }

  if (!product) {
    return <p className="page-status">El producto solicitado no existe.</p>;
  }

  return (
    <main className="detalles">
      <section className="precio_tamaño">
        <div>
          <h1>{product.title}</h1>
          <p className="price">Q{product.price}</p>
        </div>
        <div className="grid">
          <div className="size">
            <p>Talla</p>
            <strong>{product.size}</strong>
          </div>
          <div className="stock">
            <p>Disponible</p>
            <strong>{product.enStock}</strong>
          </div>
        </div>
      </section>

      <section className="reservar" aria-labelledby="reservation-title">
        <div className="calendario">
          <div className="center">
            <h2 id="reservation-title">Selecciona los días de reserva</h2>
            <DatePicker
              className="my-datepicker"
              locale="es"
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              maxDate={startDate ? addDays(startDate, 6) : undefined}
              selectsRange
              inline
            />
          </div>
        </div>
        <button type="button" className="btn" onClick={handleAddToCart}>
          Añadir al carrito
        </button>
      </section>

      <div className="carousel-container">
        <CarouselSlider
          title={product.title}
          images={[product.image, product.img1, product.img2, product.img3]}
        />
      </div>

      <div className="description">
        <p>
          <strong>
            Reserva tu disfraz y paga el alquiler cuando lo recojas en la tienda.
          </strong>
        </p>
      </div>

      {relatedProducts.length > 0 && (
        <section className="related-products">
          <h2>Productos relacionados</h2>
          <div className="productos">
            {relatedProducts.map((relatedProduct) => (
              <ProductoItem
                key={relatedProduct.documentId}
                producto={relatedProduct}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
