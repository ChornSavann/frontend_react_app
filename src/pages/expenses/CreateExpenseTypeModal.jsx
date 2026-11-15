// src/pages/expenses/CreateExpenseTypeModal.jsx
import React from 'react';
import ExpenseTypeFormModal from './ExpenseTypeFormModal';

export default function CreateExpenseTypeModal(props) {
  return <ExpenseTypeFormModal mode="create" {...props} />;
}