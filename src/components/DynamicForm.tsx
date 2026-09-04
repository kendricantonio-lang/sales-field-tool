import type { FieldDef } from '../config/fields';
import type { FieldValues } from '../lib/db';

interface DynamicFormProps {
  fields: FieldDef[];
  values: FieldValues;
  onChange: (key: string, value: string) => void;
}

const INPUT_TYPE: Partial<Record<FieldDef['type'], string>> = {
  text: 'text',
  date: 'date',
  phone: 'tel',
  email: 'email',
};

export function DynamicForm({ fields, values, onChange }: DynamicFormProps) {
  return (
    <div className="dynamic-form">
      {fields.map((field) => (
        <label key={field.key} className="form-field">
          <span className="form-label">
            {field.label}
            {field.required && <span className="required-mark"> *</span>}
          </span>
          {field.type === 'textarea' ? (
            <textarea
              value={values[field.key] ?? ''}
              placeholder={field.placeholder}
              required={field.required}
              onChange={(e) => onChange(field.key, e.target.value)}
              rows={4}
            />
          ) : (
            <input
              type={INPUT_TYPE[field.type] ?? 'text'}
              value={values[field.key] ?? ''}
              placeholder={field.placeholder}
              required={field.required}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          )}
        </label>
      ))}
    </div>
  );
}
