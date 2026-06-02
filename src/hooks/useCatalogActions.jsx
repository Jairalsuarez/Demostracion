export default function useCatalogActions({
  app,
  session,
  user,
  editing,
  productForm,
  commit,
  notify,
  inform,
  personName,
  resetProductFlow,
  upsertRemoteProduct,
  deleteRemoteProduct,
}) {
  const requiresRemoteWrite = session?.mode === "supabase";
  const isConstraintError = (message = "") => {
    const text = String(message || "").toLowerCase();
    return text.includes("foreign key") || text.includes("violates") || text.includes("constraint");
  };

  const saveProduct = async () => {
    if (!productForm.nombre) {
      inform("Completa el nombre del producto.", "warning");
      return false;
    }

    const draft = {
      ...productForm,
      precio: Number(productForm.precio),
      stockLocal: Number(productForm.stockLocal || 0),
      stockDeposito: Number(productForm.stockDeposito || 0),
      stock: Number(productForm.stockLocal || 0) + Number(productForm.stockDeposito || 0),
      id: editing?.id || crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };

    const remote = await upsertRemoteProduct(draft, session?.mode === "supabase" ? session.userId : null);
    if (requiresRemoteWrite && !remote.ok) {
      inform(remote.error || "No se pudo guardar el producto.", "error");
      return false;
    }

    const record = remote.ok ? remote.product : draft;

    commit((current) => ({
      ...current,
      products: editing ? current.products.map((product) => (product.id === editing.id ? record : product)) : [record, ...current.products],
    }));

    notify(`${personName(user)} ${editing ? "actualizo" : "creo"} el producto ${record.nombre}.`, personName(user));
    resetProductFlow();
    inform("Producto guardado correctamente.", "success");
    return true;
  };

  const removeProduct = async (id) => {
    const product = app.products.find((item) => item.id === id);
    if (!product) return false;

    const remote = await deleteRemoteProduct(id);
    if (requiresRemoteWrite && !remote.ok) {
      if (isConstraintError(remote.error)) {
        const archivedDraft = {
          ...product,
          activo: false,
          updatedAt: new Date().toISOString(),
        };
        const archivedRemote = await upsertRemoteProduct(archivedDraft, session?.userId || null);
        if (!archivedRemote.ok) {
          inform(archivedRemote.error || "No se pudo desactivar el producto.", "error");
          return false;
        }

        commit((current) => ({
          ...current,
          products: current.products.map((item) => (item.id === id ? archivedRemote.product : item)),
        }));
        notify(`${personName(user)} desactivo el producto ${product.nombre}.`, personName(user), "warning");
        resetProductFlow();
        inform("Este producto ya tiene ventas registradas, por eso no se puede eliminar. Lo desactive del catalogo.", "warning");
        return true;
      }

      inform(remote.error || "No se pudo eliminar el producto.", "error");
      return false;
    }

    commit((current) => ({ ...current, products: current.products.filter((item) => item.id !== id) }));
    notify(`${personName(user)} elimino el producto ${product.nombre}.`, personName(user), "warning");
    resetProductFlow();
    inform("Producto eliminado correctamente.", "success");
    return true;
  };

  const setFeaturedProduct = (productId) => {
    const target = app.products.find((product) => product.id === productId);
    if (!target) return inform("Selecciona un producto valido.", "warning");
    commit((current) => ({
      ...current,
      business: { ...current.business, featuredProductId: productId },
    }));
    notify(`${personName(user)} selecciono ${target.nombre} como producto destacado.`, personName(user));
    inform(`Producto estrella actualizado: ${target.nombre}.`, "success");
  };

  return {
    saveProduct,
    removeProduct,
    setFeaturedProduct,
  };
}
