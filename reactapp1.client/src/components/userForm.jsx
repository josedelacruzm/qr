// UserForm.js
import React, { useState, useEffect } from 'react';

const UserForm = ({ user, onSave, onDelete, isEditing }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    tipoUsuario: ''
  });

  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        contraseña: user.contraseña || '',
        tipoUsuario: user.tipoUsuario || ''
      });
    }
  }, [user, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nombre:
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
        />
      </label>
      <label>
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </label>
      <label>
        Contraseña:
        <input
          type="password"
          name="contraseña"
          value={formData.contraseña}
          onChange={handleChange}
        />
      </label>
      <label>
        Tipo de Usuario:
        <select
          name="tipoUsuario"
          value={formData.tipoUsuario}
          onChange={handleChange}
        >
          <option value="Común">Común</option>
          <option value="Admin">Admin</option>
        </select>
      </label>
      <button type="submit">{isEditing ? 'Actualizar' : 'Crear'}</button>
      {isEditing && (
        <button type="button" onClick={() => onDelete(user.id)}>
          Eliminar
        </button>
      )}
    </form>
  );
};

export default UserForm;
