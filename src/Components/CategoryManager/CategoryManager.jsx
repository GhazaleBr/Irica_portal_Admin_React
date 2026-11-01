import React, { useMemo, useState } from "react";
import categoryService from "../../services/CategoryService";
import "./CategoryManager.css";

// ساختار درختی چند سطحی اولیه (تودرتو)
const INITIAL_CATEGORIES = [

];

// کامپوننت کمکی رندر بازگشتی گره‌ها (Recursive Node Component)
const CategoryTreeNode = ({
  node,
  depth = 0,
  expandedCats,
  toggleExpand,
  onQuickAddSub,
  onStartEdit,
  onDelete,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isOpen = !!expandedCats[node.id];

  return (
    <div className="tree-node-wrapper">
      <div className="tree-node-card" onClick={() => hasChildren && toggleExpand(node.id)}>
        <div className="node-left">
          {hasChildren ? (
            <button
              type="button"
              className={`node-arrow-btn ${isOpen ? "open" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
              ▶
            </button>
          ) : (
            <span className="node-arrow-placeholder" />
          )}

          <div className="node-text-group">
            <div className="node-title-row">
              <span className="node-title-fa">{node.nameFa}</span>
              {node.code && <span className="node-code">{node.code}</span>}
            </div>
            {node.nameEn && (
              <span className="node-title-en" dir="ltr">
                {node.nameEn}
              </span>
            )}
          </div>
        </div>

        <div className="node-actions" onClick={(e) => e.stopPropagation()}>
          {hasChildren && (
            <span className="node-badge-count">{node.children.length} زیرشاخه</span>
          )}

          {/* ایجاد زیردسته ذیل این آیتم در هر سطحی */}
          <button
            type="button"
            className="btn-icon-action"
            title="افزودن زیرمجموعه به این دسته"
            onClick={() => onQuickAddSub(node.id)}
          >
            ➕
          </button>

          {/* ویرایش */}
          <button
            type="button"
            className="btn-icon-action"
            title="ویرایش این ردیف"
            onClick={() => onStartEdit(node)}
          >
            ✏️
          </button>

          {/* حذف */}
          <button
            type="button"
            className="btn-icon-action delete"
            title="حذف این ردیف و تمام زیرشاخه‌های آن"
            onClick={() => onDelete(node.id)}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* باز شدن شاخه‌های بازگشتی زیرمجموعه بدون محدودیت عمق */}
      {isOpen && hasChildren && (
        <div className="tree-children-container">
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedCats={expandedCats}
              toggleExpand={toggleExpand}
              onQuickAddSub={onQuickAddSub}
              onStartEdit={onStartEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryManager = ({ onCategoriesChange }) => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [expandedCats, setExpandedCats] = useState({ "cat-1": true, "cat-1-1": true, "cat-2": true });

  const [formData, setFormData] = useState({
    parentId: "",
    nameFa: "",
    nameEn: "",
    code: "",
    descriptionFa: "",
  });

  const [editingId, setEditingId] = useState(null);

  // تبدیل ساختار درختی به لیست مسطح همراه با پیشوند خطی جهت استفاده در Select والد
  const flattenedCategories = useMemo(() => {
    const list = [];
    const traverse = (items, prefix = "", level = 0) => {
      items.forEach((item) => {
        list.push({
          id: item.id,
          nameFa: `${prefix ? prefix + " " : ""}${item.nameFa}`,
          raw: item,
          level,
        });
        if (item.children && item.children.length > 0) {
          traverse(item.children, prefix ? `${prefix}—` : "—", level + 1);
        }
      });
    };
    traverse(categories);
    return list;
  }, [categories]);

  // پیدا کردن شناسه والد یک گره به صورت بازگشتی
  const findParentId = (items, targetId, parent = null) => {
    for (const item of items) {
      if (item.id === targetId) return parent ? parent.id : "";
      if (item.children && item.children.length > 0) {
        const found = findParentId(item.children, targetId, item);
        if (found !== null) return found;
      }
    }
    return null;
  };

  // بررسی عدم انتخاب خود یا فرزندان خود به عنوان والد جدید هنگام ویرایش (جلوگیری از ایجاد حلقه)
  const isDescendant = (node, targetId) => {
    if (!node.children || node.children.length === 0) return false;
    for (const child of node.children) {
      if (child.id === targetId || isDescendant(child, targetId)) {
        return true;
      }
    }
    return false;
  };

  const toggleExpand = (catId) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      parentId: "",
      nameFa: "",
      nameEn: "",
      code: "",
      descriptionFa: "",
    });
    setEditingId(null);
  };

  // شروع حالت ویرایش
  const handleStartEdit = (node) => {
    const currentParentId = findParentId(categories, node.id) || "";
    setEditingId(node.id);
    setFormData({
      parentId: currentParentId,
      nameFa: node.nameFa || "",
      nameEn: node.nameEn || "",
      code: node.code || "",
      descriptionFa: node.descriptionFa || "",
    });
  };

  // افزودن سریع زیردسته جدید
  const handleQuickAddSub = (parentId) => {
    resetForm();
    setFormData((prev) => ({ ...prev, parentId }));
    setExpandedCats((prev) => ({ ...prev, [parentId]: true }));
  };

  // حذف بازگشتی یک گره از کل درخت
  const removeNodeRecursively = (items, targetId) => {
    return items
      .filter((item) => item.id !== targetId)
      .map((item) => ({
        ...item,
        children: item.children ? removeNodeRecursively(item.children, targetId) : [],
      }));
  };

  const handleDelete = (targetId) => {
    if (!window.confirm("آیا از حذف این طبقه‌بندی و تمام زیرشاخه‌های احتمالی آن اطمینان دارید؟")) {
      return;
    }
    const updated = removeNodeRecursively(categories, targetId);
    setCategories(updated);
    if (onCategoriesChange) onCategoriesChange(updated);
    if (editingId === targetId) resetForm();
  };

  // درج بازگشتی یک نود جدید درون درخت ذیل والد مشخص
  const insertNodeRecursively = (items, parentId, newNode) => {
    if (!parentId) {
      return [...items, newNode];
    }
    return items.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newNode],
        };
      }
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: insertNodeRecursively(item.children, parentId, newNode),
        };
      }
      return item;
    });
  };

  // دریافت یک نود از درخت به صورت بازگشتی
  const findNode = (items, targetId) => {
    for (const item of items) {
      if (item.id === targetId) return item;
      if (item.children && item.children.length > 0) {
        const found = findNode(item.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered!");

    if (!formData.nameFa.trim()) {
      alert("لطفاً عنوان فارسی را وارد نمایید.");
      return;
    }

    try {
      // 1. آماده‌سازی Payload با تبدیل parentId به عدد
      // اگر parentId خالی باشد (شاخه اصلی)، طبق داکیومنت شما 0 می‌فرستیم
      const payload = {
        titleFa: formData.nameFa.trim(),
        titleEn: formData.nameEn.trim(),
        code: formData.code.trim() || "NEW-CODE",
        parentId: formData.parentId ? parseInt(formData.parentId, 10) : 0, 
        sortOrder: 0,
        isActive: true,
        typeId: 0,
        moduleId: 13,
        provinceId: 0,
        deactivateAt: new Date().toISOString()
      };

      // 2. ارسال درخواست به API
      const response = await categoryService.createCategory(payload);
      
      // 3. افزودن به درخت در فرانت‌اند (با استفاده از آیدی برگشتی از سرور)
      const newNode = {
        id: response.id, // آیدی واقعی از دیتابیس
        nameFa: formData.nameFa.trim(),
        nameEn: formData.nameEn.trim(),
        code: formData.code.trim(),
        descriptionFa: formData.descriptionFa.trim(),
        children: [],
      };

      // درج در وضعیت محلی (Local State)
      const updated = insertNodeRecursively(categories, payload.parentId, newNode);
      setCategories(updated);
      
      if (onCategoriesChange) onCategoriesChange(updated);
      resetForm();
      
    } catch (error) {
      console.error("خطا در ایجاد دسته‌بندی:", error);
      alert("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    }
  };


  return (
    <div className="category-page" dir="rtl">
      <div className="category-container">
        <div className="category-card">
          <div className="category-header">
            <h2 className="category-title">مدیریت ساختار درختی طبقه‌بندی و زیرمجموعه‌ها</h2>
            <div className="category-subtitle">
              امکان ایجاد بی‌نهایت سطح زیردسته  برای محتواها
            </div>
          </div>

          <div className="category-layout">
            {/* پنل فرم ایجاد / ویرایش */}
            <div className="form-panel">
              <div className="panel-title">
                <span>{editingId ? "✏️ ویرایش طبقه‌بندی" : "➕ افزودن شاخه جدید"}</span>
              </div>

              <form onSubmit={handleSubmit}>
                {/* انتخاب والد با عمق نامحدود */}
                <div className="form-group">
                  <label className="form-label">طبقه‌بندی والد (محل قرارگیری):</label>
                  <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">-- شاخه اصلی (Root Level) --</option>
                    {flattenedCategories
                      .filter((c) => c.id !== editingId) // جلوگیری از انتخاب خود در حالت ادیت
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameFa}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span style={{ color: "red" }}>*</span> عنوان فارسی:
                  </label>
                  <input
                    type="text"
                    name="nameFa"
                    value={formData.nameFa}
                    onChange={handleInputChange}
                    placeholder="مثال: ترخیص قطعات صنعتی"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">عنوان انگلیسی (English):</label>
                  <input
                    type="text"
                    dir="ltr"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleInputChange}
                    placeholder="e.g. Industrial Parts Clearance"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">کد شناسایی یا نماد سیستم:</label>
                  <input
                    type="text"
                    dir="ltr"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="مثال: IMP-IND-01"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">توضیحات و شرح دامنه:</label>
                  <textarea
                    name="descriptionFa"
                    rows={3}
                    value={formData.descriptionFa}
                    onChange={handleInputChange}
                    placeholder="توضیح کوتاه در رابطه با این ردیف..."
                    className="form-textarea"
                  />
                </div>
                
                <button type="submit" className="btn-primary">
                  {editingId ? "ذخیره تغییرات" : "ثبت و افزودن به درخت"}
                </button>

                {editingId && (
                  <button type="button" onClick={resetForm} className="btn-cancel">
                    انصراف از ویرایش
                  </button>
                )}
              </form>
            </div>

            {/* پنل نمایش درختی با عمق نامحدود */}
            <div className="tree-panel">
              {categories.length === 0 ? (
                <div className="empty-state">
                  هیچ طبقه‌بندی‌ای یافت نشد. از فرم روبرو اولین شاخه را ایجاد کنید.
                </div>
              ) : (
                categories.map((cat) => (
                  <CategoryTreeNode
                    key={cat.id}
                    node={cat}
                    depth={0}
                    expandedCats={expandedCats}
                    toggleExpand={toggleExpand}
                    onQuickAddSub={handleQuickAddSub}
                    onStartEdit={handleStartEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
