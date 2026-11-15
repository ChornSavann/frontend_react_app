// src/pages/expenses/CreateExpenseModal.jsx
import React from 'react';
import ExpenseFormModal from './Expenseformmodal';

export default function CreateExpenseModal(props) {
  return <ExpenseFormModal mode="create" {...props} />;
}