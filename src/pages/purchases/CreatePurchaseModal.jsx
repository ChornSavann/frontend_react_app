// src/pages/purchases/CreatePurchaseModal.jsx
import React from 'react';
import PurchaseFormModal from './PurchaseFormModal';

export default function CreatePurchaseModal(props) {
  return <PurchaseFormModal mode="create" {...props} />;
}