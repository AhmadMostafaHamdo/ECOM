import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../api';
import './ContactUs.css';

const ContactUs = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t('contact.nameRequired');
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      newErrors.name = t('contact.nameRange');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      newErrors.email = t('contact.emailRequired');
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = t('contact.invalidEmail');
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.subjectRequired');
    } else if (formData.subject.trim().length < 3 || formData.subject.trim().length > 200) {
      newErrors.subject = t('contact.subjectRange');
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = t('contact.messageRequired');
    } else if (formData.message.trim().length < 10 || formData.message.trim().length > 1000) {
      newErrors.message = t('contact.messageRange');
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const trimmedData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      };
      const response = await axiosInstance.post('/contact', trimmedData);

      if (response.status === 200 || response.status === 201) {
        toast.success(t('contact.success') || "Message sent successfully!");
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setErrors({});
      } else {
        const data = response.data;
        setSubmitStatus('error');
        toast.error(data.error || t('contact.error'));
        if (data.details) {
          setErrors(data.details);
        } else {
          setErrors({ general: data.error || t('contact.error') });
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || t('contact.error') || "Failed to send message";
      toast.error(errorMsg);
      setSubmitStatus('error');
      const data = error.response?.data || {};
      if (data.details) {
        setErrors(data.details);
      } else {
        setErrors({ general: errorMsg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-section">
      <div className="contact-wrapper">
        
        {/* Left Panel - Premium Info Presentation */}
        <div className="contact-info-panel">
          <div className="contact-badge">
            <span className="badge-dot"></span> 
            {t('contact.getInTouch') || "Get in Touch"}
          </div>
          
          <h1 className="contact-heading">
            {t('contact.title') || "Let's build something"}{' '}
            <span className="text-highlight">great</span> together.
          </h1>
          
          <p className="contact-description">
            {t('contact.subtitle')}
          </p>

          <div className="contact-methods">
            <div className="method-item">
              <div className="method-icon-box">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="method-content">
                <h4>{t('contact.emailUs')}</h4>
                <p>support@ecommerce.com</p>
              </div>
            </div>

            <div className="method-item">
              <div className="method-icon-box">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="method-content">
                <h4>{t('contact.callUs')}</h4>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="method-item">
              <div className="method-icon-box">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="method-content">
                <h4>{t('contact.visitUs')}</h4>
                <p>123 Commerce Street, New York, NY</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Flowing Form Component */}
        <div className="contact-form-panel">
          <form onSubmit={handleSubmit} className="premium-form">
            <h3 className="form-title">{t('contact.sendmessage') || "Send a message"}</h3>
            
            {submitStatus === 'success' && (
              <div className="premium-alert success">
                <svg className="alert-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('contact.success')}
              </div>
            )}

            {submitStatus === 'error' && !errors.general && (
              <div className="premium-alert error">
                <svg className="alert-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {t('contact.error')}
              </div>
            )}

            {errors.general && (
              <div className="premium-alert error">
                <svg className="alert-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">{t('contact.nameLabel')}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`modern-input ${errors.name ? 'input-error' : ''}`}
                  placeholder={t('contact.namePlaceholder') || "John Doe"}
                  disabled={isSubmitting}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('contact.emailLabel')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`modern-input ${errors.email ? 'input-error' : ''}`}
                  placeholder={t('contact.emailPlaceholder') || "john@example.com"}
                  disabled={isSubmitting}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">{t('contact.subjectLabel')}</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`modern-input ${errors.subject ? 'input-error' : ''}`}
                placeholder={t('contact.subjectPlaceholder') || "How can we help?"}
                disabled={isSubmitting}
              />
              {errors.subject && <span className="error-text">{errors.subject}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">{t('contact.messageLabel')}</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`modern-textarea ${errors.message ? 'input-error' : ''}`}
                placeholder={t('contact.messagePlaceholder') || "Tell us more about your inquiry..."}
                rows="5"
                maxLength="1000"
                disabled={isSubmitting}
              />
              <div className="textarea-footer">
                <span className="char-count">{formData.message.length}/1000</span>
              </div>
              {errors.message && <span className="error-text">{errors.message}</span>}
            </div>

            <button
              type="submit"
              className="modern-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner"></div>
                  {t('contact.sending') || "Sending..."}
                </>
              ) : (
                t('contact.send') || "Send Message"
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;
