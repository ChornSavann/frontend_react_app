// src/pages/customers/EditCustomerModal.jsx
import React from 'react';
import CustomerFormModal from './Customerformmodal ';

export default function EditCustomerModal(props) {
  return <CustomerFormModal mode="edit" {...props} />;
}