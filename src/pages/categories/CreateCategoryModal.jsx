// src/pages/categories/CreateCategoryModal.jsx
import React from 'react';
import CategoryFormModal from './CategoryFormModal';

export default function CreateCategoryModal(props) {
  return <CategoryFormModal mode="create" {...props} />;
}