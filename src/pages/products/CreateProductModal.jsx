// src/pages/products/CreateProductModal.jsx
import React from 'react';
import ProductFormModal from './ProductFormModal';

export default function CreateProductModal(props) {
  return <ProductFormModal mode="create" {...props} />;
}