// src/pages/roles/CreateRoleModal.jsx
import React from 'react';
import RoleFormModal from './Roleformmodal';

export default function CreateRoleModal(props) {
  return <RoleFormModal mode="create" {...props} />;
}