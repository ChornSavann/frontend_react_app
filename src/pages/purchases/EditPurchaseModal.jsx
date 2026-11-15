// src/pages/purchases/EditPurchaseModal.jsx
import React from 'react';
import PurchaseFormModal from './PurchaseFormModal';

export default function EditPurchaseModal(props) {
  return <PurchaseFormModal mode="edit" {...props} />;
}