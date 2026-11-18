import React from 'react';
import { LogIn, ShieldAlert } from 'lucide-react';
import './IamLoginPrompt.css'; // مطمئن شوید این فایل در کنار همین کامپوننت است

const IamLoginPrompt = ({
  onLoginRedirect,
  title = 'ورود به سامانه مدیریت پورتال گمرک',
  description = 'جهت مشاهده خدمات، لطفاً از طریق درگاه احراز هویت مرکزی وارد شوید.'
}) => {
  return (
    <div className="iam-prompt-card">
      <div className="iam-prompt-icon-wrapper">
        <ShieldAlert size={48} className="auth-lock-icon" />
      </div>
      <h3 className="iam-prompt-title">{title}</h3>
      <p className="iam-prompt-desc">{description}</p>
      
      <button
        type="button"
        className="iam-prompt-btn"
        onClick={onLoginRedirect}
      >
        <LogIn size={18} />
        <span>ورود از طریق درگاه مرکزی (IAM)</span>
      </button>
    </div>
  );
};

export default IamLoginPrompt;
