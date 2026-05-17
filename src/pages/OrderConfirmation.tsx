import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id?: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderConfirmationState {
  orderNumber: string;
  id: string;
  total: number;
  email: string;
  items: OrderItem[];
  firstName: string;
}

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OrderConfirmationState | null;

  useEffect(() => {
    // If no state passed, redirect to home
    if (!state?.orderNumber) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.orderNumber) return null;

  const { orderNumber, total, email, items = [], firstName } = state;

  return (
    <div className="oc-wrapper">
      {/* Animated background orbs */}
      <div className="oc-orb oc-orb-1" />
      <div className="oc-orb oc-orb-2" />

      <div className="oc-container">
        {/* Success Icon */}
        <div className="oc-icon-wrap">
          <div className="oc-icon-ring" />
          <CheckCircle className="oc-check-icon" size={52} />
        </div>

        {/* Thank You Heading */}
        <h1 className="oc-title">Thank You{firstName ? `, ${firstName}` : ''}!</h1>
        <p className="oc-subtitle">Your order has been placed successfully.</p>
        <p className="oc-email-note">
          A confirmation has been sent to <strong>{email}</strong>
        </p>

        {/* Order Info Cards */}
        <div className="oc-info-grid">
          <div className="oc-info-card">
            <span className="oc-info-label">Order ID</span>
            <span className="oc-info-value oc-order-id">{orderNumber}</span>
          </div>
          <div className="oc-info-card">
            <span className="oc-info-label">Amount Paid</span>
            <span className="oc-info-value oc-amount">
              EUR {total.toFixed(2)}
            </span>
          </div>
          <div className="oc-info-card">
            <span className="oc-info-label">Status</span>
            <span className="oc-status-badge">
              <span className="oc-status-dot" />
              Confirmed
            </span>
          </div>
        </div>

        {/* Order Items */}
        {items.length > 0 && (
          <div className="oc-items-section">
            <h2 className="oc-items-title">
              <Package size={18} />
              Order Summary
            </h2>
            <div className="oc-items-list">
              {items.map((item, idx) => (
                <div key={idx} className="oc-item-row">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="oc-item-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/64x64?text=Watch';
                    }}
                  />
                  <div className="oc-item-info">
                    <p className="oc-item-brand">{item.brand}</p>
                    <p className="oc-item-name">{item.name}</p>
                    <p className="oc-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <span className="oc-item-price">
                    EUR {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="oc-total-row">
              <span>Total</span>
              <span className="oc-total-amount">EUR {total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="oc-actions">
          <Link to="/" className="oc-btn-primary">
            <Home size={18} />
            Back to Home
          </Link>
          <Link to="/products" className="oc-btn-secondary">
            <ShoppingBag size={18} />
            Continue Shopping
            <ArrowRight size={16} />
          </Link>
        </div>

        <p className="oc-track-note">
          You can track your order in{' '}
          <Link to="/account" className="oc-link">
            My Account
          </Link>
        </p>
      </div>

      <style>{`
        .oc-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%);
        }

        .oc-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: oc-float 8s ease-in-out infinite;
        }
        .oc-orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
          top: -150px;
          right: -150px;
          animation-delay: 0s;
        }
        .oc-orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
          animation-delay: 4s;
        }
        @keyframes oc-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        .oc-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 680px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          backdrop-filter: blur(20px);
          animation: oc-slide-up 0.6s cubic-bezier(0.16,1,0.3,1) both;
          text-align: center;
        }
        @keyframes oc-slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Icon */
        .oc-icon-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .oc-icon-ring {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 2px solid rgba(201,168,76,0.3);
          animation: oc-pulse-ring 2s ease-out infinite;
        }
        @keyframes oc-pulse-ring {
          0%   { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .oc-check-icon {
          color: #C9A84C;
          filter: drop-shadow(0 0 16px rgba(201,168,76,0.6));
          animation: oc-pop 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes oc-pop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* Text */
        .oc-title {
          font-family: 'Playfair Display', 'Georgia', serif;
          font-size: clamp(2rem, 5vw, 2.8rem);
          font-weight: 700;
          color: #FAF7F2;
          margin: 0 0 0.5rem;
          letter-spacing: -0.02em;
        }
        .oc-subtitle {
          font-size: 1.1rem;
          color: rgba(250,247,242,0.7);
          margin: 0 0 0.5rem;
        }
        .oc-email-note {
          font-size: 0.85rem;
          color: rgba(250,247,242,0.45);
          margin: 0 0 2rem;
        }
        .oc-email-note strong {
          color: rgba(250,247,242,0.7);
        }

        /* Info Grid */
        .oc-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 500px) {
          .oc-info-grid { grid-template-columns: 1fr; }
        }
        .oc-info-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(201,168,76,0.12);
          border-radius: 14px;
          padding: 1.25rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          transition: border-color 0.2s;
        }
        .oc-info-card:hover {
          border-color: rgba(201,168,76,0.3);
        }
        .oc-info-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(250,247,242,0.4);
          font-weight: 600;
        }
        .oc-info-value {
          font-size: 1rem;
          font-weight: 700;
          color: #FAF7F2;
          word-break: break-all;
        }
        .oc-order-id {
          font-size: 0.9rem;
          color: #C9A84C;
          font-family: 'Courier New', monospace;
        }
        .oc-amount {
          font-size: 1.15rem;
          color: #C9A84C;
        }
        .oc-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #4ade80;
        }
        .oc-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 8px rgba(74,222,128,0.6);
          animation: oc-blink 1.8s ease-in-out infinite;
        }
        @keyframes oc-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        /* Items */
        .oc-items-section {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }
        .oc-items-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(250,247,242,0.5);
          margin: 0 0 1.25rem;
        }
        .oc-items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .oc-item-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .oc-item-img {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          object-fit: cover;
          border: 1px solid rgba(201,168,76,0.15);
          flex-shrink: 0;
        }
        .oc-item-info {
          flex: 1;
          min-width: 0;
        }
        .oc-item-brand {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(201,168,76,0.7);
          margin: 0 0 0.15rem;
        }
        .oc-item-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #FAF7F2;
          margin: 0 0 0.15rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .oc-item-qty {
          font-size: 0.75rem;
          color: rgba(250,247,242,0.4);
          margin: 0;
        }
        .oc-item-price {
          font-size: 0.95rem;
          font-weight: 700;
          color: #C9A84C;
          flex-shrink: 0;
        }
        .oc-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          margin-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          font-weight: 700;
          font-size: 0.95rem;
          color: rgba(250,247,242,0.7);
        }
        .oc-total-amount {
          font-size: 1.15rem;
          color: #C9A84C;
        }

        /* Buttons */
        .oc-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .oc-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #C9A84C, #E8C96A);
          color: #0a0a0a;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 0.85rem 1.75rem;
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.2s;
          letter-spacing: 0.03em;
        }
        .oc-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201,168,76,0.35);
        }
        .oc-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          color: #FAF7F2;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.85rem 1.75rem;
          border-radius: 50px;
          text-decoration: none;
          border: 1px solid rgba(250,247,242,0.15);
          transition: all 0.2s;
          letter-spacing: 0.03em;
        }
        .oc-btn-secondary:hover {
          border-color: rgba(201,168,76,0.4);
          color: #C9A84C;
          transform: translateY(-2px);
        }

        .oc-track-note {
          font-size: 0.8rem;
          color: rgba(250,247,242,0.35);
        }
        .oc-link {
          color: #C9A84C;
          text-decoration: underline;
          text-decoration-color: rgba(201,168,76,0.4);
          transition: color 0.2s;
        }
        .oc-link:hover {
          color: #E8C96A;
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;
