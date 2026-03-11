import React, { useState, useEffect } from 'react';
import { flowers as initialFlowers } from '../data/flowers';
import './AdminProducts.css';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    price: '',
    category: 'Авторский',
    image: '',
    description: ''
  });

  useEffect(() => {
    const savedProducts = localStorage.getItem('flowers');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialFlowers);
      localStorage.setItem('flowers', JSON.stringify(initialFlowers));
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('flowers', JSON.stringify(products));
    }
  }, [products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      price: '',
      category: 'Авторский',
      image: '',
      description: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      id: null,
      name: '',
      price: '',
      category: 'Авторский',
      image: '',
      description: ''
    });
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description
    });
    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.image || !formData.description) {
      alert('Заполните все поля!');
      return;
    }

    let updatedProducts;
    
    if (editingProduct) {
      updatedProducts = products.map(p => 
        p.id === editingProduct.id ? { ...formData, price: Number(formData.price) } : p
      );
      setProducts(updatedProducts);
      alert('Товар обновлен!');
    } else {
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      updatedProducts = [...products, { 
        ...formData, 
        id: newId, 
        price: Number(formData.price) 
      }];
      setProducts(updatedProducts);
      alert('Товар добавлен!');
    }
    
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      alert('Товар удален!');
    }
  };

  const handleReset = () => {
    if (window.confirm('Сбросить все изменения к исходным данным?')) {
      setProducts(initialFlowers);
      localStorage.setItem('flowers', JSON.stringify(initialFlowers));
      alert('Данные сброшены!');
    }
  };

  return (
    <div className="admin-products">
      <div className="admin-actions">
        <button className="add-btn" onClick={handleAdd}>
          + Добавить новый букет
        </button>
        <button className="reset-btn" onClick={handleReset}>
          ⟲ Сбросить к исходным
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content admin-form">
            <h2>{editingProduct ? 'Редактировать' : 'Добавить'} букет</h2>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Название:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Цена (₽):</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Категория:</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Авторский">Авторский</option>
                  <option value="Сборный">Сборный</option>
                  <option value="Люкс">Люкс</option>
                </select>
              </div>

              <div className="form-group">
                <label>URL изображения:</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="например: ../flowers/photo_1.jpg"
                  required
                />
                <small>Путь к картинке в папке flowers</small>
              </div>

              <div className="form-group">
                <label>Описание:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingProduct ? 'Сохранить' : 'Добавить'}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-table">
        <h2>Список товаров ({products.length})</h2>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Изображение</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="table-image"
                  />
                </td>
                <td>{product.name.substring(0, 50)}...</td>
                <td>{product.category}</td>
                <td>{product.price} ₽</td>
                <td className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(product)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(product.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProducts;