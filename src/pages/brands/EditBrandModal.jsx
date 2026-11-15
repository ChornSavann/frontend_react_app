// src/pages/brands/EditBrandModal.jsx
import React from 'react';
import BrandFormModal from './BrandFormModal';

export default function EditBrandModal(props) {
  return <BrandFormModal mode="edit" {...props} />;
}