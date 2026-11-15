// src/pages/customers/CreateCustomerModal.jsx
import React from 'react';
import CustomerFormModal from './Customerformmodal ';

export default function CreateCustomerModal(props) {
  return <CustomerFormModal mode="create" {...props} />;
}