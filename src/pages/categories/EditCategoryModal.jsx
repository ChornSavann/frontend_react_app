// src/pages/categories/EditCategoryModal.jsx
import React from 'react';
import CategoryFormModal from './CategoryFormModal';

export default function EditCategoryModal(props) {
  return <CategoryFormModal mode="edit" {...props} />;
}