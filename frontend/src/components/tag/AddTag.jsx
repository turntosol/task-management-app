import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import './addTag.scss'

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AddTag = ({ onAddTag, existingTags = [] }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Vui lòng nhập tên tag');
      return;
    }

    const isDuplicate = existingTags.some(
      (tag) => tag.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError('Tag đã tồn tại');
      return;
    }

    onAddTag({
      id: Date.now().toString(),
      name: trimmedName,
      color: selectedColor,
    });

    setName('');
    setError('');
    setIsExpanded(false);
  };

  return (
    <div className="add-tag-component">
      {!isExpanded ? (
        <div className="add-tag-trigger" onClick={() => setIsExpanded(true)}>
            <input
              type="text"
              placeholder="Add new tag..."
              readOnly
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                width: '80%',
                color: '#555',
                cursor: 'pointer',
              }}
            />
            <AddIcon style={{ fontSize: '18px', cursor: 'pointer' }} />
        </div>
      ) : (
        <form className="add-tag-form" onSubmit={handleSubmit}>
          <div className="input-row">
            <input
              type="text"
              placeholder="Tag name..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
            <button type="submit" className="submit-btn">
              +
            </button>
          </div>

          <div className="color-row">
            {PRESET_COLORS.map((c) => (
              <span
                key={c}
                className={`dot ${selectedColor === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setSelectedColor(c)}
              />
            ))}
          </div>

          {error && <span className="error-text">{error}</span>}
          <button type="button" className="close-text" onClick={() => setIsExpanded(false)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default AddTag;