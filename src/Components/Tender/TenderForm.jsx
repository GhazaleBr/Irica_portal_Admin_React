import React, { useState } from 'react';
import './TenderForm.css';

const initialValues = {
  deactivateAt: '',
  organization: '',
  department: '',
  tenderTypeId: 0,
  entityStatusId: 0,
  serialNumber: '',
  titleFa: '',
  titleEn: '',
  publisherUnit: '',
  publishDate: '',
  editDate: '',
  publishMedia: '',
  mediaPublishDate: '',
  location: '',
  payPriceTypeId: 0,
  receivingDeadline: '',
  proposalDeadline: '',
  openingDate: '',
  renewal: false,
  tenderStatusId: 0,
  amount: 0,
  groupId: '',
  keyWordsFa: '',
  keyWordsEn: '',
  hasSchedule: false,
  scheduleStartDate: '',
  scheduleStartTime: '',
  scheduleEndDate: '',
  scheduleEndTime: '',
  descriptionFa: '',
  descriptionEn: '',
  guaranteeFa: '',
  guaranteeEn: '',
  participantConditionsFa: '',
  participantConditionsEn: '',
  documentConditionsFa: '',
  documentConditionsEn: '',
  winnerFa: '',
  winnerEn: '',
  imageFaId: 0,
  imageEnId: 0,
  provinceId: 0,
  tenderModifiedId: 0,
};

const dateFields = [
  'publishDate',
  'editDate',
  'mediaPublishDate',
  'receivingDeadline',
  'proposalDeadline',
  'openingDate',
  'scheduleStartDate',
  'scheduleEndDate',
];

const numberFields = [
  'tenderTypeId',
  'entityStatusId',
  'payPriceTypeId',
  'tenderStatusId',
  'amount',
  'imageFaId',
  'imageEnId',
  'provinceId',
  'tenderModifiedId',
];

const TenderForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => ({
    ...initialValues,
    ...initialData,
    deactivateAt: initialData.deactivateAt
      ? initialData.deactivateAt.slice(0, 16)
      : '',
  }));

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : numberFields.includes(name)
            ? value === '' ? 0 : Number(value)
            : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      deactivateAt: formData.deactivateAt
        ? new Date(formData.deactivateAt).toISOString()
        : null,
    };

    onSubmit?.(payload);
  };

  const renderInput = (name, label, type = 'text', options = {}) => (
    <label className={`tender-field ${options.full ? 'tender-field-full' : ''}`} key={name}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={formData[name] ?? ''}
        onChange={handleChange}
        required={options.required}
        step={type === 'number' ? 'any' : undefined}
        dir={options.ltr ? 'ltr' : undefined}
      />
    </label>
  );

  const renderTextarea = (name, label, options = {}) => (
    <label className={`tender-field ${options.full ? 'tender-field-full' : ''}`} key={name}>
      <span>{label}</span>
      <textarea
        name={name}
        value={formData[name] ?? ''}
        onChange={handleChange}
        rows={options.rows || 4}
        dir={options.ltr ? 'ltr' : undefined}
      />
    </label>
  );

  const renderSelect = (name, label, options) => (
    <label className="tender-field" key={name}>
      <span>{label}</span>
      <select name={name} value={formData[name]} onChange={handleChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  const renderSwitch = (name, label) => (
    <label className="tender-switch" key={name}>
      <input
        name={name}
        type="checkbox"
        checked={Boolean(formData[name])}
        onChange={handleChange}
      />
      <span>{label}</span>
    </label>
  );

  return (
    <form className="tender-form" onSubmit={handleSubmit}>
      <header className="tender-form-header">
        <div>
          <h1>ثبت مناقصه</h1>
          <p>اطلاعات مناقصه را وارد کنید.</p>
        </div>
      </header>

      <section className="tender-form-section">
        <h2>اطلاعات اصلی</h2>
        <div className="tender-form-grid">
          {renderInput('titleFa', 'عنوان فارسی', 'text', { required: true })}
          {renderInput('titleEn', 'عنوان انگلیسی', 'text', { ltr: true })}
          {renderInput('serialNumber', 'شماره سریال')}
          {renderInput('organization', 'سازمان')}
          {renderInput('department', 'دپارتمان')}
          {renderInput('publisherUnit', 'واحد ناشر')}
          {renderInput('location', 'محل برگزاری')}
          {renderInput('groupId', 'شناسه گروه')}
          {renderInput('tenderTypeId', 'شناسه نوع مناقصه', 'number')}
          {renderInput('entityStatusId', 'شناسه وضعیت موجودیت', 'number')}
          {renderInput('tenderStatusId', 'شناسه وضعیت مناقصه', 'number')}
          {renderInput('tenderModifiedId', 'شناسه ویرایش مناقصه', 'number')}
          {renderInput('provinceId', 'شناسه استان', 'number')}
          {renderInput('payPriceTypeId', 'شناسه نوع پرداخت', 'number')}
          {renderInput('amount', 'مبلغ', 'number')}
          {renderInput('deactivateAt', 'زمان غیرفعال‌سازی', 'datetime-local')}
        </div>
      </section>

      <section className="tender-form-section">
        <h2>انتشار و مهلت‌ها</h2>
        <div className="tender-form-grid">
          {renderInput('publishDate', 'تاریخ انتشار', 'date')}
          {renderInput('editDate', 'تاریخ ویرایش', 'date')}
          {renderInput('publishMedia', 'رسانه انتشار')}
          {renderInput('mediaPublishDate', 'تاریخ انتشار در رسانه', 'date')}
          {renderInput('receivingDeadline', 'مهلت دریافت اسناد', 'date')}
          {renderInput('proposalDeadline', 'مهلت ارائه پیشنهاد', 'date')}
          {renderInput('openingDate', 'تاریخ بازگشایی', 'date')}
          {renderSwitch('renewal', 'مناقصه تجدید شده است')}
        </div>
      </section>

      <section className="tender-form-section">
        <h2>زمان‌بندی</h2>
        <div className="tender-form-grid">
          {renderSwitch('hasSchedule', 'دارای زمان‌بندی است')}
          {formData.hasSchedule && (
            <>
              {renderInput('scheduleStartDate', 'تاریخ شروع', 'date')}
              {renderInput('scheduleStartTime', 'ساعت شروع', 'time')}
              {renderInput('scheduleEndDate', 'تاریخ پایان', 'date')}
              {renderInput('scheduleEndTime', 'ساعت پایان', 'time')}
            </>
          )}
        </div>
      </section>

      <section className="tender-form-section">
        <h2>کلیدواژه‌ها و تصاویر</h2>
        <div className="tender-form-grid">
          {renderInput('keyWordsFa', 'کلیدواژه‌های فارسی')}
          {renderInput('keyWordsEn', 'کلیدواژه‌های انگلیسی', 'text', { ltr: true })}
          {renderInput('imageFaId', 'شناسه تصویر فارسی', 'number')}
          {renderInput('imageEnId', 'شناسه تصویر انگلیسی', 'number')}
        </div>
      </section>

      <section className="tender-form-section">
        <h2>شرح و شرایط</h2>
        <div className="tender-form-grid">
          {renderTextarea('descriptionFa', 'شرح فارسی', { full: true })}
          {renderTextarea('descriptionEn', 'شرح انگلیسی', { full: true, ltr: true })}
          {renderTextarea('guaranteeFa', 'تضمین فارسی')}
          {renderTextarea('guaranteeEn', 'تضمین انگلیسی', { ltr: true })}
          {renderTextarea('participantConditionsFa', 'شرایط شرکت‌کنندگان فارسی')}
          {renderTextarea('participantConditionsEn', 'شرایط شرکت‌کنندگان انگلیسی', { ltr: true })}
          {renderTextarea('documentConditionsFa', 'شرایط اسناد فارسی')}
          {renderTextarea('documentConditionsEn', 'شرایط اسناد انگلیسی', { ltr: true })}
          {renderTextarea('winnerFa', 'برنده فارسی')}
          {renderTextarea('winnerEn', 'برنده انگلیسی', { ltr: true })}
        </div>
      </section>

      <footer className="tender-form-actions">
        {onCancel && (
          <button type="button" className="tender-button tender-button-secondary" onClick={onCancel}>
            انصراف
          </button>
        )}
        <button type="submit" className="tender-button tender-button-primary">
          ثبت مناقصه
        </button>
      </footer>
    </form>
  );
};

export default TenderForm;
