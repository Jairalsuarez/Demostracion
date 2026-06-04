export default function useCatalogActions({ app, user, productForm, editing, commit, notify, inform, personName, resetProductFlow }) {
  const saveProduct = async () => {
    if (!productForm.nombre) return inform("Completa el nombre del producto.", "warning");
    const draft = {
      ...productForm, precio: Number(productForm.precio), costo: Number(productForm.costo || 0),
      stock: Number(productForm.stock || 0), id: editing?.id || crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };
    commit((current) => ({
      ...current,
      products: editing ? current.products.map((product) => product.id === editing.id ? draft : product) : [draft, ...current.products],
    }));
    notify(`${personName(user)} ${editing ? "actualizo" : "creo"} el producto ${draft.nombre}.`, personName(user));
    resetProductFlow();
    inform("Producto guardado correctamente.", "success");
    return true;
  };

  const removeProduct = async (id) => {
    const product = app.products.find((item) => item.id === id);
    if (!product) return false;
    commit((current) => ({ ...current, products: current.products.filter((item) => item.id !== id) }));
    notify(`${personName(user)} elimino el producto ${product.nombre}.`, personName(user), "warning");
    resetProductFlow();
    inform("Producto eliminado correctamente.", "success");
    return true;
  };

  const setFeaturedProduct = (productId) => {
    const target = app.products.find((product) => product.id === productId);
    if (!target) return inform("Selecciona un producto valido.", "warning");
    commit((current) => ({ ...current, business: { ...current.business, featuredProductId: productId } }));
    notify(`${personName(user)} selecciono ${target.nombre} como destacado.`, personName(user));
    inform(`Producto estrella actualizado: ${target.nombre}.`, "success");
  };

  return { saveProduct, removeProduct, setFeaturedProduct };
}
