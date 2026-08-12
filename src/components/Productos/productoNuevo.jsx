import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../context/authContext";

const initialForm = {
  title: "",
  category: "",
  cantidad: 1,
  enUso: 0,
  enStock: 1,
  id: "",
  image: null,
  img1: null,
  img2: null,
  img3: null,
  price: 0,
  size: "",
};

export function ProductoNuevo({ onClose }) {
  const [formData, setFormData] = useState(initialForm);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const { newProduct } = useAuth();

  const handleInputChange = ({ target }) => {
    const { name, value, files } = target;
    setFormData((current) => ({
      ...current,
      [name]: files?.[0] ?? value,
    }));
    setError("");
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const total = Number(formData.cantidad);
    const available = Number(formData.enStock);
    const inUse = Number(formData.enUso);

    if (
      !Number.isSafeInteger(total) ||
      !Number.isSafeInteger(available) ||
      !Number.isSafeInteger(inUse) ||
      total < 0 ||
      available < 0 ||
      inUse < 0 ||
      available + inUse > total
    ) {
      setError("El stock disponible y en uso no puede superar el total.");
      return;
    }

    if (!formData.image || !formData.img1 || !formData.img2 || !formData.img3) {
      setError("Debes seleccionar las cuatro imágenes.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      await newProduct(formData);
      onClose();
    } catch (uploadError) {
      console.error("No fue posible agregar el producto:", uploadError);
      setError(uploadError.message || "No fue posible agregar el producto.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modalProducto">
      <section
        className="modalProducto-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-product-title"
      >
        <button type="button" onClick={onClose} aria-label="Cerrar formulario">
          <X color="#bf2a1b" aria-hidden="true" />
        </button>
        <h2 id="new-product-title">Agregar producto</h2>
        {error && <p className="error-message" role="alert">{error}</p>}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="product-title">Título:</label>
            <input
              id="product-title"
              type="text"
              className="inputNP"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={120}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="product-category">Categoría:</label>
            <input
              id="product-category"
              type="text"
              className="inputNP"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              maxLength={80}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="product-price">Precio:</label>
            <input
              id="product-price"
              type="number"
              className="inputNP"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="product-size">Talla:</label>
            <input
              id="product-size"
              type="text"
              className="inputNP"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              maxLength={30}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="product-total">Unidades totales:</label>
            <input
              id="product-total"
              type="number"
              className="inputNP"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleInputChange}
              min="0"
              step="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="product-in-use">En uso:</label>
            <input
              id="product-in-use"
              type="number"
              className="inputNP"
              name="enUso"
              value={formData.enUso}
              onChange={handleInputChange}
              min="0"
              step="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="product-stock">En stock:</label>
            <input
              id="product-stock"
              type="number"
              className="inputNP"
              name="enStock"
              value={formData.enStock}
              onChange={handleInputChange}
              min="0"
              step="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="product-id">Código de producto:</label>
            <input
              id="product-id"
              type="number"
              className="inputNP"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              min="1"
              step="1"
              required
            />
          </div>

          {["image", "img1", "img2", "img3"].map((field, index) => (
            <div className="form-group" key={field}>
              <label htmlFor={`product-${field}`}>
                {index === 0 ? "Imagen principal" : `Imagen ${index}`}:
              </label>
              <input
                id={`product-${field}`}
                type="file"
                className="inputNP"
                accept="image/png,image/jpeg,image/webp"
                name={field}
                onChange={handleInputChange}
                required
              />
            </div>
          ))}

          <button className="buttonPN" type="submit" disabled={isUploading}>
            {isUploading ? "Guardando…" : "Guardar"}
          </button>
        </form>
      </section>
    </div>
  );
}
