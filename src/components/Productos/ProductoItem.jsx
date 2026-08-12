import { Link } from "react-router-dom";

export function ProductoItem({ producto }) {
  const {
    documentId,
    title,
    price,
    image,
    size,
    category,
    enStock,
  } = producto;

  return (
    <article className="producto">
      <Link to={`/productos/${documentId}`} aria-label={`Ver ${title}`}>
        <div className="producto_img">
          <img src={image} alt={title} loading="lazy" />
        </div>
      </Link>
      <div className="producto_footer">
        <h2>{title}</h2>
        <p>{category}</p>
        <p>Talla: {size}</p>
        <p>Disponibles: {enStock}</p>
        <p className="price">Q{price}</p>
      </div>
      <div className="button">
        <div>
          <Link to={`/productos/${documentId}`} className="btn">Ver detalle</Link>
        </div>
      </div>
    </article>
  );
}
