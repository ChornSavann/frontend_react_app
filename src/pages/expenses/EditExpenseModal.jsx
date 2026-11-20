// src/pages/expenses/EditExpenseModal.jsx
import React from 'react';
import ExpenseFormModal from './Expenseformmodal';

export default function EditExpenseModal(props) {
  return <ExpenseFormModal mode="edit" {...props} />;
}