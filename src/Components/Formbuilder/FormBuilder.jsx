import React, { useId, useRef, useState, useEffect } from "react";
import "./FormBuilder.css";

const FIELD_TYPES = [
  { value: "text", label: "متن کوتاه" },
  { value: "textarea", label: "متن بلند" },
  { value: "number", label: "عدد" },
  { value: "select", label: "فهرست انتخابی" },
  { value: "checkbox", label: "چک‌باکس" },
  { value: "date", label: "تاریخ" },
  { value: "file", label: "آپلود فایل" },
  { value: "image", label: "آپلود عکس" },
];

const DEFAULT_CATEGORIES = [
  "عمومی",
  "درخواست خدمات",
  "ثبت‌نام",
  "بازخورد",
  "پشتیبانی",
];

function getOptions(value = "") {
  const options = value
    .split(/[,،]/)
    .map((option) => option.trim())
    .filter(Boolean);

  return [...new Set(options)];
}

function PreviewField({ field, inputId, value, onChange }) {
  const label = field.label.trim() || "فیلد بدون نام";
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (field.type === "image" && value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setImagePreview(null);
    }
  }, [value, field.type]);

  if (field.type === "checkbox") {
    return (
      <div className="fb-group">
        <label className="fb-check" htmlFor={inputId}>
          <input
            id={inputId}
            name={field.id}
            type="checkbox"
            required={field.required}
            checked={value ?? false}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span>
            {label}
            {field.required && <span className="fb-required"> *</span>}
          </span>
        </label>
      </div>
    );
  }

  if (field.type === "file" || field.type === "image") {
    return (
      <div className="fb-group">
        <label htmlFor={inputId}>
          {label}
          {field.required && <span className="fb-required"> *</span>}
        </label>
        <input
          id={inputId}
          name={field.id}
          type="file"
          accept={field.type === "image" ? "image/*" : undefined}
          required={field.required}
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            onChange(file);
          }}
        />
        {imagePreview && (
          <div className="fb-image-preview-wrapper">
            <img
              src={imagePreview}
              alt="پیش‌نمایش تصویر"
              className="fb-image-preview"
            />
          </div>
        )}
      </div>
    );
  }

  const commonProps = {
    id: inputId,
    name: field.id,
    required: field.required,
    value: value ?? "",
    onChange: (event) => onChange(event.target.value),
  };

  let control;

  switch (field.type) {
    case "textarea":
      control = (
        <textarea
          {...commonProps}
          rows={4}
          placeholder={field.placeholder}
        />
      );
      break;

    case "select":
      control = (
        <select {...commonProps}>
          <option value="">
            {field.placeholder.trim() || "انتخاب کنید"}
          </option>
          {getOptions(field.options).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
      break;

    case "number":
      control = (
        <input
          {...commonProps}
          type="number"
          step="any"
          placeholder={field.placeholder}
        />
      );
      break;

    case "date":
      control = (
        <input
          {...commonProps}
          type="date"
          placeholder={field.placeholder}
        />
      );
      break;

    default:
      control = (
        <input
          {...commonProps}
          type="text"
          placeholder={field.placeholder}
        />
      );
  }

  return (
    <div className="fb-group">
      <label htmlFor={inputId}>
        {label}
        {field.required && <span className="fb-required"> *</span>}
      </label>
      {control}
    </div>
  );
}

export default function FormBuilder({
  onSubmit,
  categories = DEFAULT_CATEGORIES,
  initialTitle = "فرم جدید",
  initialCategory = "",
}) {
  const instanceId = useId();
  const nextFieldNumber = useRef(0);

  const initialCategories = categories.map((item) =>
    typeof item === "string" ? item : item.label
  );

  const [formTitle, setFormTitle] = useState(initialTitle);
  const [categoryOptions, setCategoryOptions] = useState(() => {
    if (
      initialCategory &&
      !initialCategories.includes(initialCategory)
    ) {
      return [...initialCategories, initialCategory];
    }
    return initialCategories;
  });
  const [category, setCategory] = useState(
    initialCategory || initialCategories[0] || ""
  );
  const [newCategory, setNewCategory] = useState("");
  const [fields, setFields] = useState([]);
  const [activeView, setActiveView] = useState("builder");
  const [answers, setAnswers] = useState({});
  const [submittedData, setSubmittedData] = useState(null);

  const titleInputId = `${instanceId}-title`;
  const categoryInputId = `${instanceId}-category`;
  const newCategoryInputId = `${instanceId}-new-category`;
  const headingId = `${instanceId}-preview-heading`;

  function addCategory(event) {
    event.preventDefault();

    const value = newCategory.trim();
    if (!value) return;

    setCategoryOptions((current) =>
      current.includes(value) ? current : [...current, value]
    );
    setCategory(value);
    setNewCategory("");
  }

  function addField(type) {
    nextFieldNumber.current += 1;
    const number = nextFieldNumber.current;

    const newField = {
      id: `field_${number}`,
      type,
      label: `فیلد ${number.toLocaleString("fa-IR")}`,
      placeholder: "",
      required: false,
      options: type === "select" ? "گزینه ۱، گزینه ۲، گزینه ۳" : "",
    };

    setFields((current) => [...current, newField]);
    setSubmittedData(null);
  }

  function updateField(id, key, value) {
    setFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );

    if (key === "options") {
      const validOptions = getOptions(value);

      setAnswers((current) => {
        if (!current[id] || validOptions.includes(current[id])) {
          return current;
        }
        return { ...current, [id]: "" };
      });
    }

    setSubmittedData(null);
  }

  function removeField(id) {
    setFields((current) => current.filter((field) => field.id !== id));

    setAnswers((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    setSubmittedData(null);
  }

  function moveField(id, direction) {
    setFields((current) => {
      const index = current.findIndex((field) => field.id === id);
      const targetIndex = index + direction;

      if (
        index < 0 ||
        targetIndex < 0 ||
        targetIndex >= current.length
      ) {
        return current;
      }

      const next = [...current];
      [next[index], next[targetIndex]] = [
        next[targetIndex],
        next[index],
      ];

      return next;
    });

    setSubmittedData(null);
  }

  function updateAnswer(id, value) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setSubmittedData(null);
  }

  function handlePreviewSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const responses = Object.fromEntries(
      fields.map((field) => {
        if (field.type === "checkbox") {
          return [field.id, formData.has(field.id)];
        }
        if (field.type === "file" || field.type === "image") {
          return [field.id, answers[field.id] || null];
        }
        return [field.id, formData.get(field.id) ?? ""];
      })
    );

    const data = {
      title: formTitle.trim() || "فرم بدون عنوان",
      category,
      fields: fields.map(
        ({ id, type, label, placeholder, required, options }) => ({
          id,
          type,
          label,
          placeholder,
          required,
          options:
            type === "select" ? getOptions(options) : undefined,
        })
      ),
      responses,
    };

    setSubmittedData(data);
    onSubmit?.(data);
  }

  const displayTitle = formTitle.trim() || "فرم بدون عنوان";

  return (
    <section className="fb" dir="rtl" lang="fa" aria-label="فرم‌ساز">
      <header className="fb-header">
        <div className="fb-group">
          <label htmlFor={titleInputId}>عنوان فرم</label>
          <input
            id={titleInputId}
            className="fb-title-input"
            type="text"
            value={formTitle}
            onChange={(event) => setFormTitle(event.target.value)}
            placeholder="عنوان فرم را وارد کنید"
          />
        </div>

        <div className="fb-category-settings">
          <div className="fb-group">
            <label htmlFor={categoryInputId}>دسته‌بندی فرم</label>
            <select
              id={categoryInputId}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {!category && <option value="">انتخاب دسته‌بندی</option>}
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <form className="fb-add-category" onSubmit={addCategory}>
            <label className="fb-sr-only" htmlFor={newCategoryInputId}>
              افزودن دسته‌بندی جدید
            </label>
            <input
              id={newCategoryInputId}
              type="text"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="نام دسته‌بندی جدید"
            />
            <button type="submit" className="fb-secondary-button">
              افزودن دسته‌بندی
            </button>
          </form>
        </div>

        <div className="fb-button-row" role="group" aria-label="نمای فرم‌ساز">
          <button
            type="button"
            className={activeView === "builder" ? "fb-tab active" : "fb-tab"}
            aria-pressed={activeView === "builder"}
            onClick={() => setActiveView("builder")}
          >
            طراحی فرم
          </button>
          <button
            type="button"
            className={activeView === "preview" ? "fb-tab active" : "fb-tab"}
            aria-pressed={activeView === "preview"}
            onClick={() => setActiveView("preview")}
          >
            پیش‌نمایش و تست
          </button>
        </div>
      </header>

      {activeView === "builder" ? (
        <div className="fb-stack">
          <section className="fb-toolbar">
            <h2>افزودن فیلد جدید</h2>
            <div className="fb-button-row">
              {FIELD_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className="fb-secondary-button"
                  onClick={() => addField(value)}
                >
                  + {label}
                </button>
              ))}
            </div>
          </section>

          {fields.length === 0 && (
            <p className="fb-empty">
              هنوز فیلدی اضافه نشده است. از گزینه‌های بالا استفاده کنید.
            </p>
          )}

          {fields.map((field, index) => (
            <article className="fb-card" key={field.id}>
              <div className="fb-card-header">
                <h3>
                  {FIELD_TYPES.find((type) => type.value === field.type)?.label}
                </h3>

                <div className="fb-button-row">
                  <button
                    type="button"
                    disabled={index === 0}
                    aria-label={`انتقال فیلد ${index + 1} به بالا`}
                    onClick={() => moveField(field.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === fields.length - 1}
                    aria-label={`انتقال فیلد ${index + 1} به پایین`}
                    onClick={() => moveField(field.id, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="fb-danger"
                    onClick={() => removeField(field.id)}
                  >
                    حذف
                  </button>
                </div>
              </div>

              <div className="fb-editor-grid">
                <label className="fb-group">
                  <span>برچسب فیلد</span>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(event) =>
                      updateField(field.id, "label", event.target.value)
                    }
                  />
                </label>

                {field.type !== "checkbox" &&
                  field.type !== "file" &&
                  field.type !== "image" && (
                    <label className="fb-group">
                      <span>متن راهنما</span>
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={(event) =>
                          updateField(
                            field.id,
                            "placeholder",
                            event.target.value
                          )
                        }
                      />
                    </label>
                  )}

                {field.type === "select" && (
                  <label className="fb-group fb-full-width">
                    <span>گزینه‌ها را با ویرگول جدا کنید</span>
                    <input
                      type="text"
                      value={field.options}
                      onChange={(event) =>
                        updateField(
                          field.id,
                          "options",
                          event.target.value
                        )
                      }
                    />
                  </label>
                )}

                <label className="fb-check fb-full-width">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(event) =>
                      updateField(
                        field.id,
                        "required",
                        event.target.checked
                      )
                    }
                  />
                  <span>این فیلد اجباری است</span>
                </label>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="fb-stack">
          <form
            className="fb-card fb-stack"
            aria-labelledby={headingId}
            onSubmit={handlePreviewSubmit}
          >
            <h2 id={headingId}>{displayTitle}</h2>

            <p className="fb-category-badge">
              دسته‌بندی: {category || "انتخاب نشده"}
            </p>

            {fields.length === 0 && (
              <p className="fb-empty">
                ابتدا در بخش طراحی، فیلدهایی به فرم اضافه کنید.
              </p>
            )}

            {fields.map((field) => (
              <PreviewField
                key={field.id}
                field={field}
                inputId={`${instanceId}-${field.id}`}
                value={answers[field.id]}
                onChange={(value) => updateAnswer(field.id, value)}
              />
            ))}

            {fields.length > 0 && (
              <button className="fb-submit" type="submit">
                ثبت فرم
              </button>
            )}
          </form>

          {submittedData && (
            <section className="fb-result" aria-live="polite">
              <h3>داده‌های ثبت‌شده (JSON)</h3>
              <p className="fb-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                * فیلدهای فایل و تصویر به صورت آبجکت File ذخیره می‌شوند و در خروجی JSON به نمایش درنمی‌آیند اما در داده‌های ارسالی موجودند.
              </p>
              <pre dir="ltr">
                {JSON.stringify(
                  {
                    ...submittedData,
                    responses: Object.fromEntries(
                      Object.entries(submittedData.responses).map(([k, v]) => [
                        k,
                        v instanceof File ? `[File: ${v.name}]` : v,
                      ])
                    ),
                  },
                  null,
                  2
                )}
              </pre>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
