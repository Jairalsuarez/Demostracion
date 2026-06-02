import { useEffect, useState } from "react";

export default function useProductEditor(emptyProduct) {
  const [editing, setEditing] = useState(null);
  const [productModal, setProductModal] = useState(false);
  const [productForm, setProductForm] = useState(emptyProduct);

  useEffect(() => {
    setProductForm(editing || emptyProduct);
  }, [editing, emptyProduct]);

  const resetProductFlow = () => {
    setEditing(null);
    setProductForm(emptyProduct);
    setProductModal(false);
  };

  const openCreateProduct = () => {
    setEditing(null);
    setProductForm(emptyProduct);
    setProductModal(true);
  };

  const openEditProduct = (product) => {
    setEditing(product);
    setProductModal(true);
  };

  return {
    editing,
    productForm,
    productModal,
    setProductForm,
    setProductModal,
    resetProductFlow,
    openCreateProduct,
    openEditProduct,
  };
}
