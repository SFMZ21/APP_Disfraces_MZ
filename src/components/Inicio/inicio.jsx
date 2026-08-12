import ImageSlider from "./slider";
import PedidosByUser from "./pedidosByUser";

export function Inicio() {
  return (
    <main className="inicio">
      <h1 className="sr-only">Disfraces MZ</h1>
      <ImageSlider />
      <PedidosByUser />
    </main>
  );
}
