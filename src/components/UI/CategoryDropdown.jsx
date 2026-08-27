import { useState, useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { LuChevronDown, LuCheck, LuTag, LuLightbulb } from 'react-icons/lu';
import { addCategory } from '../../services/categoryService';

/**
 * Reusable category picker dropdown.
 *
 * Props:
 *   category               - currently selected category name
 *   setCategory(name)      - called when the user picks a category
 *   allCategories          - array of { name, Icon, id? }
 *   loading                - disables the trigger while the parent form is submitting
 *   currentUser            - required only when suggestion acceptance can create new categories
 *   suggestion             - AI-suggested category name (optional)
 *   setSuggestion          - clear suggestion after accept (optional)
 *   suggestionDismissed    - whether the user dismissed the chip (optional)
 *   setSuggestionDismissed - mark dismissed (optional)
 */
export default function CategoryDropdown({
  category,
  setCategory,
  allCategories,
  loading = false,
  currentUser = null,
  suggestion = null,
  setSuggestion = null,
  suggestionDismissed = false,
  setSuggestionDismissed = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const sel = allCategories.find(c => c.name === category);
  const SelIcon = sel?.Icon || LuTag;
  const showSuggestion = suggestion && suggestion !== category && !suggestionDismissed && setSuggestion;

  return (
    <div className="form-group">
      <label>Category</label>
      <div className="cat-dropdown" ref={dropdownRef}>
        <button
          type="button"
          className="cat-dropdown-trigger"
          onClick={() => !loading && setIsOpen(o => !o)}
          disabled={loading}
        >
          <span className="cat-dropdown-icon"><SelIcon size={15} /></span>
          <span>{category}</span>
          <LuChevronDown size={14} className={`cat-dropdown-chevron${isOpen ? ' open' : ''}`} />
        </button>

        {isOpen && (
          <div className="cat-dropdown-menu">
            {allCategories.map((cat) => (
              <button
                key={cat.id || cat.name}
                type="button"
                className={`cat-dropdown-item${category === cat.name ? ' active' : ''}`}
                onClick={() => { setCategory(cat.name); setIsOpen(false); }}
              >
                <span className="cat-dropdown-icon"><cat.Icon size={15} /></span>
                <span>{cat.name}</span>
                {category === cat.name && <LuCheck size={13} className="cat-dropdown-check" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {showSuggestion && (
        <div className="category-suggestion">
          <LuLightbulb size={13} className="category-suggestion__icon" />
          <span>Suggested: <strong>{suggestion}</strong></span>
          <button
            type="button"
            className="category-suggestion-accept"
            onClick={async () => {
              const exists = allCategories.some(c => c.name === suggestion);
              if (!exists && currentUser) {
                try {
                  await addCategory(currentUser.uid, { name: suggestion });
                } catch {
                  // Category creation failed — expense still saves with that name
                }
              }
              setCategory(suggestion);
              setSuggestion(null);
            }}
          >
            Use it
          </button>
          <button
            type="button"
            className="category-suggestion-dismiss"
            onClick={() => setSuggestionDismissed(true)}
            aria-label="Dismiss suggestion"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
