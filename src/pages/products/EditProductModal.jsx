// src/pages/products/EditProductModal.jsx
import React from 'react';
import ProductFormModal from './ProductFormModal';

export default function EditProductModal(props) {
  return <ProductFormModal mode="edit" {...props} />;
}