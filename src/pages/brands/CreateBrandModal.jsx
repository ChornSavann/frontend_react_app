// src/pages/brands/CreateBrandModal.jsx
import React from 'react';
import BrandFormModal from './BrandFormModal';

export default function CreateBrandModal(props) {
  return <BrandFormModal mode="create" {...props} />;
}