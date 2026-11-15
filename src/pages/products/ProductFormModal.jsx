
import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Sparkles,
  Save,
  Plus,
  Pencil,
  AlertCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  createProduct,
  updateProduct,
  getCategories,
  getBrands,
  getUnits,
} from "../../services/productService";
import { modalCss } from "./modalStyles";

// Helper សម្រាប់ទាញយក Array ចេញពីគ្រប់ទម្រង់ JSON របស់ Laravel
const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.categories)) return res.categories;
  if (Array.isArray(res?.brands)) return res.brands;
  if (Array.isArray(res?.units)) return res.units;
  return [];
};

// បញ្ចូលទិន្នន័យពី API និងទិន្នន័យដែលមានស្រាប់ (មិនឱ្យជាន់ ID គ្នា)
const mergeById = (arr1 = [], arr2 = []) => {
  const map = new Map();
  [...arr1, ...arr2].forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  return Array.from(map.values());
};

const NONE = [];
const EMPTY = {
  name: "",
  description: "",
  category_id: "",
  brand_id: "",
  unit_id: "",
  sku: "",
  barcode: "",
  cost_price: "",
  selling_price: "",
  alert_quantity: "10",
  is_active: 1,
};
const makeSku = () => {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `SKU-${d}-${Math.floor(1000 + Math.random() * 9000)}`;
};
const makeBarcode = () =>
  `P-${Math.floor(10000000 + Math.random() * 90000000)}`;

export default function ProductFormModal({
  mode = "create",
  isOpen,
  product,
  onClose,
  onSuccess,
  existingCategories = NONE,
  existingBrands = NONE,
  existingUnits = NONE,
}) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ១. ត្រៀមទិន្នន័យ Form ពេលបើក Modal
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg("");
    setImageFile(null);
    if (isEdit && product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        category_id: product.category_id ?? product.category?.id ?? "",
        brand_id: product.brand_id ?? product.brand?.id ?? "",
        unit_id: product.unit_id ?? product.unit?.id ?? "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        cost_price: product.cost_price ?? "",
        selling_price: product.selling_price ?? "",
        alert_quantity: product.alert_quantity ?? "10",
        is_active: Number(product.is_active ?? 1) === 1 ? 1 : 0,
      });
      setImagePreview(product.image_url || null);
    } else {
      setForm({ ...EMPTY, sku: makeSku(), barcode: makeBarcode() });
      setImagePreview(null);
    }
  }, [isOpen, isEdit, product]);

  // ២. ទាញយក Categories, Brands, Units
  useEffect(() => {
    if (!isOpen) return undefined;
    setCategories(existingCategories);
    setBrands(existingBrands);
    setUnits(existingUnits);
    let cancelled = false;
    (async () => {
      try {
        const [c, b, u] = await Promise.all([
          getCategories(),
          getBrands(),
          getUnits(),
        ]);
        if (cancelled) return;
        setCategories(mergeById(extractArray(c), existingCategories));
        setBrands(mergeById(extractArray(b), existingBrands));
        setUnits(mergeById(extractArray(u), existingUnits));
      } catch (err) {
        console.error("Error loading dropdown data:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, existingCategories, existingBrands, existingUnits]);

  // បិទដោយ Esc
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const undoImage = () => {
    setImageFile(null);
    setImagePreview(isEdit ? product?.image_url || null : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && !product?.id) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description || "");
      fd.append("category_id", form.category_id);
      if (form.brand_id) fd.append("brand_id", form.brand_id);
      if (form.unit_id) fd.append("unit_id", form.unit_id);
      fd.append("sku", form.sku);
      fd.append("barcode", form.barcode || "");
      fd.append("cost_price", form.cost_price);
      fd.append("selling_price", form.selling_price);
      fd.append("alert_quantity", form.alert_quantity || 0);
      fd.append("is_active", form.is_active ? 1 : 0);
      if (isEdit) {
        // រក្សាទុកចំនួនស្តុកចាស់ដដែល ប្រសិនបើ Backend ទាមទារ stock_quantity ពេល Update
        if (
          product.stock_quantity !== undefined &&
          product.stock_quantity !== null
        )
          fd.append("stock_quantity", product.stock_quantity);
      } else {
        // ស្តុកចាប់ផ្តើមពី 0 (បញ្ចូលស្តុកតាមរយៈ Purchase)
        fd.append("stock_quantity", 0);
      }
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) await updateProduct(product.id, fd);
      else await createProduct(fd);

      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(first) ? first[0] : String(first));
      } else {
        setErrorMsg(
          err?.message ||
            (isEdit
              ? "បរាជ័យក្នុងការកែប្រែទំនិញ"
              : "បរាជ័យក្នុងការបង្កើតទំនិញថ្មី"),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || (isEdit && !product)) return null;

  const cost = parseFloat(form.cost_price);
  const sell = parseFloat(form.selling_price);
  const showMargin = Number.isFinite(cost) && Number.isFinite(sell) && sell > 0;
  const profit = sell - cost;
  const margin = showMargin ? (profit / sell) * 100 : 0;
  const Icon = isEdit ? Pencil : Plus;

  return (
    <div className="pm-overlay">
      <style>{modalCss}</style>
      <form
        className="pm"
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit product" : "Create product"}
      >
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico">
              <Icon size={20} strokeWidth={2.2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3>{isEdit ? "កែប្រែព័ត៌មានទំនិញ" : "បន្ថែមទំនិញថ្មី"}</h3>
              <p>
                {isEdit
                  ? `${product.name} · ស្តុកបច្ចុប្បន្ន ${product.stock_quantity ?? 0} ${product.unit?.short_name || ""}`
                  : "បំពេញព័ត៌មានទំនិញ (ស្តុកត្រូវបន្ថែមតាមរយៈការទិញចូល Purchase)"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="pm-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="pm-body">
          {errorMsg && (
            <div className="pm-err" role="alert">
              <AlertCircle size={17} />
              <span>{errorMsg}</span>
            </div>
          )}

          <section className="pm-sec">
            <h4>ព័ត៌មានទូទៅ</h4>
            <div className="pm-grid">
              <div className="pm-full">
                <div className="pm-lab">
                  <span>
                    ឈ្មោះទំនិញ (Product Name)<em>*</em>
                  </span>
                </div>
                <input
                  className="pm-in"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="ឧ. Coca Cola 330ml"
                  autoFocus
                />
              </div>
              <div className="pm-full">
                <div className="pm-lab">
                  <span>ការពិពណ៌នា (Description)</span>
                </div>
                <textarea
                  className="pm-in"
                  name="description"
                  rows={2}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="បញ្ចូលព័ត៌មានលម្អិតអំពីទំនិញ..."
                />
              </div>
            </div>
          </section>

          <section className="pm-sec">
            <h4>ចាត់ថ្នាក់</h4>
            <div className="pm-grid c3">
              <div>
                <div className="pm-lab">
                  <span>
                    ប្រភេទ (Category)<em>*</em>
                  </span>
                </div>
                <select
                  className="pm-in"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- ជ្រើសរើស --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="pm-lab">
                  <span>ម៉ាក (Brand)</span>
                </div>
                <select
                  className="pm-in"
                  name="brand_id"
                  value={form.brand_id}
                  onChange={handleChange}
                >
                  <option value="">-- ជ្រើសរើស --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="pm-lab">
                  <span>
                    ឯកតា (Unit)<em>*</em>
                  </span>
                </div>
                <select
                  className="pm-in"
                  name="unit_id"
                  value={form.unit_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- ជ្រើសរើស --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                      {u.short_name && u.short_name !== u.name
                        ? ` (${u.short_name})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="pm-sec">
            <h4>លេខកូដ</h4>
            <div className="pm-grid">
              <div>
                <div className="pm-lab">
                  <span>
                    SKU<em>*</em>
                  </span>
                  <button
                    type="button"
                    className="pm-link"
                    onClick={() => setForm((p) => ({ ...p, sku: makeSku() }))}
                  >
                    <Sparkles size={13} /> បង្កើតថ្មី
                  </button>
                </div>
                <input
                  className="pm-in"
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  required
                  placeholder="SKU-20261113-1161"
                />
              </div>
              <div>
                <div className="pm-lab">
                  <span>Barcode</span>
                  <button
                    type="button"
                    className="pm-link"
                    onClick={() =>
                      setForm((p) => ({ ...p, barcode: makeBarcode() }))
                    }
                  >
                    <Sparkles size={13} /> បង្កើតថ្មី
                  </button>
                </div>
                <input
                  className="pm-in"
                  type="text"
                  name="barcode"
                  value={form.barcode}
                  onChange={handleChange}
                  placeholder="P-68513963"
                />
              </div>
            </div>
          </section>

          <section className="pm-sec">
            <h4>តម្លៃ និងស្តុក</h4>
            <div className="pm-grid c3">
              <div>
                <div className="pm-lab">
                  <span>
                    តម្លៃដើម (Cost)<em>*</em>
                  </span>
                </div>
                <div className="pm-money">
                  <span>$</span>
                  <input
                    className="pm-in"
                    type="number"
                    step="0.01"
                    min="0"
                    name="cost_price"
                    value={form.cost_price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <div className="pm-lab">
                  <span>
                    តម្លៃលក់ (Selling)<em>*</em>
                  </span>
                </div>
                <div className="pm-money">
                  <span>$</span>
                  <input
                    className="pm-in"
                    type="number"
                    step="0.01"
                    min="0"
                    name="selling_price"
                    value={form.selling_price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <div className="pm-lab">
                  <span>កម្រិតព្រមានស្តុក (Alert)</span>
                </div>
                <input
                  className="pm-in"
                  type="number"
                  step="0.01"
                  min="0"
                  name="alert_quantity"
                  value={form.alert_quantity}
                  onChange={handleChange}
                />
              </div>
            </div>
            {showMargin && (
              <div className="pm-note">
                <span className={`pm-chip ${profit >= 0 ? "good" : "bad"}`}>
                  <TrendingUp size={13} /> {profit >= 0 ? "+" : "-"}$
                  {Math.abs(profit).toFixed(2)} ចំណេញ · {margin.toFixed(0)}%
                </span>
                <span>ក្នុងមួយឯកតា</span>
              </div>
            )}
          </section>

          <section className="pm-sec">
            <h4>រូបភាពទំនិញ</h4>
            <div className="pm-drop">
              <div className="pm-thumb">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Upload size={24} />
                )}
              </div>
              <div className="pm-drop-t">
                <b>
                  {imageFile
                    ? imageFile.name
                    : isEdit
                      ? "ជ្រើសរើសរូបថ្មីបើចង់ប្តូរ"
                      : "ផ្ទុករូបភាពឡើង"}
                </b>
                <small>
                  {isEdit
                    ? "ទុកដដែលប្រសិនបើមិនចង់ប្តូររូបភាពចាស់"
                    : "JPG, PNG, WEBP (មិនលើស 2MB)"}
                </small>
                <div className="pm-drop-b">
                  <label
                    className="pm-btn sm"
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    <Upload size={14} /> ជ្រើសរើសរូបភាព
                    <input
                      className="pm-file"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  {imageFile && (
                    <button
                      type="button"
                      className="pm-btn sm"
                      onClick={undoImage}
                    >
                      មិនយក
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <label className="pm-switch">
            <input
              type="checkbox"
              name="is_active"
              checked={Number(form.is_active) === 1}
              onChange={handleChange}
            />
            <span className="pm-track" />
            <span>
              <b>ដាក់ឱ្យដំណើរការលក់ (Active)</b>
              <small>ទំនិញនឹងបង្ហាញក្នុង POS និង Catalog</small>
            </span>
          </label>
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>
            បោះបង់
          </button>
          <button
            type="submit"
            className="pm-btn primary"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 size={16} className="pm-spin" />
            ) : (
              <Save size={16} />
            )}
            {submitting
              ? "កំពុងរក្សាទុក..."
              : isEdit
                ? "រក្សាទុកការកែប្រែ"
                : "រក្សាទុកទំនិញ"}
          </button>
        </div>
      </form>
    </div>
  );
}
