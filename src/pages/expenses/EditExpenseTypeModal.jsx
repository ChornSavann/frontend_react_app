// src/pages/expenses/EditExpenseTypeModal.jsx
import React from 'react';
import ExpenseTypeFormModal from './ExpenseTypeformmodal';
export default function EditExpenseTypeModal(props) {
  return <ExpenseTypeFormModal mode="edit" {...props} />;
}