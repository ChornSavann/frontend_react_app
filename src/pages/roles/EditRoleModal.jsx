// src/pages/roles/EditRoleModal.jsx
import React from 'react';
import RoleFormModal from './Roleformmodal';

export default function EditRoleModal(props) {
  return <RoleFormModal mode="edit" {...props} />;
}