import React, { useState } from 'react';
import '../../styles/IndicatorMappingManager.css';

const IndicatorMappingsManager = ({ mappings, onAddMapping, onDeleteMapping }) => {
  const [newIndicator, setNewIndicator] = useState('');
  const [newUnits, setNewUnits] = useState('');
  const [newRefValue, setNewRefValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newIndicator.trim()) {
      onAddMapping(newIndicator.trim(), {
        units: newUnits.trim(),
        refValue: newRefValue.trim(),
        variants: []
      });
      setNewIndicator('');
      setNewUnits('');
      setNewRefValue('');
    }
  };

  return (
    <div className="indicator-manager">
      <h2 className="title">Управление показателями</h2>
      <form className="add-indicator-form" onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="text"
          value={newIndicator}
          onChange={(e) => setNewIndicator(e.target.value)}
          placeholder="Название показателя"
          required
        />
        <input
          className="input-field"
          type="text"
          value={newUnits}
          onChange={(e) => setNewUnits(e.target.value)}
          placeholder="Единицы измерения"
        />
        <input
          className="input-field"
          type="text"
          value={newRefValue}
          onChange={(e) => setNewRefValue(e.target.value)}
          placeholder="Референсные значения"
        />
        <button className="btn add-btn" type="submit">Добавить</button>
      </form>

      <div className="mappings-container">
        {Object.entries(mappings).map(([indicator, data]) => (
          <div key={indicator} className="mapping-item">
            <div className="indicator-header">
              <h3>{indicator}</h3>
              <button className="btn delete-btn" onClick={() => onDeleteMapping(indicator)}>
                Удалить
              </button>
            </div>
            <div className="indicator-details">
              <p><strong>Единицы измерения:</strong> {data.units || '—'}</p>
              <p><strong>Референсные значения:</strong> {data.refValue || '—'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndicatorMappingsManager;
