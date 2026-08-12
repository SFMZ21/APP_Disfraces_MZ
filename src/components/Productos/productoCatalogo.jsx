import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import { addDays } from "date-fns";
import { es } from "date-fns/locale";
import swal from "sweetalert";
import "react-datepicker/dist/react-datepicker.css";
import { usePurchaseAnalytics } from "../../context/purchaseTimeContext";
import { useCart } from "../../features/cart/context/CartContext";
import { CART_RESULT } from "../../features/cart/model/cartModel";
import { useCatalog } from "../../features/catalog/context/CatalogContext";
import { useReservation } from "../../features/reservations/context/ReservationContext";
import { PageState } from "../../shared/components/PageState";
import { isReservationRangeValid } from "../../utils/reservation";
import CarouselSlider from "./carouselSlider";
import { ProductoItem } from "./ProductoItem";

registerLocale("es", es);

export function ProductoCatalogo() {
  const { id } = useParams();
  const { products, loading, error } = useCatalog();
  const { addItem } = useCart();
  const { setReservationDates } = useReservation();
  const { purchaseStartedAt, setPurchaseStartedAt } = usePurchaseAnalytics();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const product = useMemo(
    () =>
      products.find(
        (item) => item.documentId === id || String(item.id) === String(id),
      ),
    [id, products],
  );

  const relatedProducts = useMemo(
    () =>
      products
        .filter(
          (item) =>
            item.documentId !== product?.documentId &&
            item.category === product?.category,
        )
        .slice(0, 6),
    [product, products],
  );

  useEffect(() => {
    if (!purchaseStartedAt) {
      setPurchaseStartedAt(new Date());
    }
  }, [purchaseStartedAt, setPurchaseStartedAt]);

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

    const result = addItem(product);
    if (result === CART_RESULT.DUPLICATE) {
      swal({ title: "El producto ya está en el carrito.", icon: "warning" });
      return;
    }
    if (result === CART_RESULT.INVALID_PRODUCT) {
      swal({ title: "No se encontró el producto.", icon: "error" });
      return;
    }
    setReservationDates(startDate, endDate);
    swal({ title: "Producto añadido correctamente.", icon: "success" });
  };

  if (loading) {
    return <PageState>Cargando producto…</PageState>;
  }

  if (error) {
    return <PageState kind="error">{error}</PageState>;
  }

  if (!product) {
    return <PageState role="status">El producto solicitado no existe.</PageState>;
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
