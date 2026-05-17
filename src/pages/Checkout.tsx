import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = {
  createOrder: (data: unknown, token?: string | null) => fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  createPaymentIntent: (amount: number, orderId: string) => fetch(`${API_URL}/payment/create-intent`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, orderId }) }).then(r => r.json()),
  confirmPayment: (orderId: string, paymentIntentId: string) => fetch(`${API_URL}/payment/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, paymentIntentId }) }).then(r => r.json()),
  getStripeConfig: () => fetch(`${API_URL}/config/stripe`).then(r => r.json()),
};

let stripePromise: any = null;

const countryToStripeCode = (country: string) => {
  const normalized = country.trim().toLowerCase();
  const countries: Record<string, string> = {
    austria: 'AT',
    belgium: 'BE',
    france: 'FR',
    germany: 'DE',
    india: 'IN',
    italy: 'IT',
    netherlands: 'NL',
    nederland: 'NL',
    spain: 'ES',
    switzerland: 'CH',
    'united kingdom': 'GB',
    uk: 'GB',
    'united states': 'US',
    usa: 'US',
  };

  if (/^[a-z]{2}$/i.test(country.trim())) return country.trim().toUpperCase();
  return countries[normalized] || 'IT';
};

const buildOrderData = (formData: any, cart: any[]) => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const tax = 0;
  const totalAmount = subtotal;

  return {
    totalAmount,
    orderData: {
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      },
      shippingAddress: {
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country,
      },
      items: cart.map(item => ({
        productId: String(item.id),
        name: item.name,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      pricing: {
        subtotal,
        shipping,
        tax,
        total: totalAmount,
      },
    },
  };
};

// ── Express Pay (Google Pay / Apple Pay) ────────────────────────
const ExpressPayButtons: React.FC<{ total: number; formData: any; cart: any[]; token?: string | null }> = ({ total, formData, cart, token }) => {
  const stripe = useStripe();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [available, setAvailable] = useState(false);

  const handleExpressPay = useCallback((event: any) => {
    const run = async () => {
      try {
        const { orderData, totalAmount } = buildOrderData(formData, cart);
        const orderResponse = await api.createOrder(orderData, token);
        if (!orderResponse.success) throw new Error(orderResponse.error || orderResponse.message);

        const paymentResponse = await api.createPaymentIntent(totalAmount, orderResponse.order.id);
        if (!paymentResponse.success) throw new Error(paymentResponse.error || paymentResponse.message);

        if (!stripe) throw new Error('Stripe not loaded');
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          paymentResponse.clientSecret,
          { payment_method: event.paymentMethod.id },
          { handleActions: false }
        );

        if (error) { event.complete('fail'); throw new Error(error.message); }
        event.complete('success');

        if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'requires_action') {
          const confirmResponse = await api.confirmPayment(orderResponse.order.id, paymentIntent.id);
          if (confirmResponse.success) {
            clearCart();
            toast.success('Order placed!');
            navigate('/order-confirmation', {
              state: {
                orderNumber: confirmResponse.order.orderNumber,
                total,
                email: formData.email,
                firstName: formData.firstName,
                items: cart.map(i => ({ name: i.name, brand: i.brand, price: i.price, quantity: i.quantity, image: i.image })),
              },
            });
          }
        }
      } catch (err: any) {
        event.complete('fail');
        toast.error(err.message || 'Express payment failed.');
      }
    };
    run();
  }, [stripe, formData, cart, token, navigate, clearCart, total]);

  useEffect(() => {
    if (!stripe || !total) return;
    const pr = stripe.paymentRequest({
      country: 'IT',
      currency: 'eur',
      total: { label: 'INDERA Jewelry', amount: Math.round(total * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    pr.canMakePayment().then((result) => {
      if (result) { setPaymentRequest(pr); setAvailable(true); }
    });
  }, [stripe, total]);

  useEffect(() => {
    if (!paymentRequest) return;
    paymentRequest.on('paymentmethod', handleExpressPay);
    return () => paymentRequest.off('paymentmethod', handleExpressPay);
  }, [paymentRequest, handleExpressPay]);

  if (!available || !paymentRequest) return null;

  return (
    <div className="mb-8">
      <div className="border border-ivory/10 bg-ivory/[0.02] p-6">
        <p className="text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-4">Express Checkout</p>
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: {
              paymentRequestButton: {
                type: 'buy',
                theme: 'dark',
                height: '52px',
              },
            },
          }}
        />
      </div>
      <div className="flex items-center gap-4 mt-8">
        <div className="flex-1 h-px bg-ivory/10" />
        <span className="text-[10px] tracking-widest uppercase font-sans text-ivory/30">Or pay by card</span>
        <div className="flex-1 h-px bg-ivory/10" />
      </div>
    </div>
  );
};

const CheckoutForm: React.FC<{ total: number; formData: any; cart: any[]; token?: string | null }> = ({ total, formData, cart, token }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { orderData, totalAmount } = buildOrderData(formData, cart);

      const orderResponse = await api.createOrder(orderData, token);

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || orderResponse.message);
      }

      // Create payment intent
      const paymentResponse = await api.createPaymentIntent(
        totalAmount,
        orderResponse.order.id
      );

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error || paymentResponse.message);
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentResponse.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.address,
                city: formData.city,
                postal_code: formData.zipCode,
                country: countryToStripeCode(formData.country),
              },
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm payment on backend
        const confirmResponse = await api.confirmPayment(
          orderResponse.order.id,
          paymentIntent.id
        );

        if (confirmResponse.success) {
          clearCart();
          toast.success('Order placed successfully!');
          navigate('/order-confirmation', {
            state: {
              orderNumber: confirmResponse.order.orderNumber,
              total,
              email: formData.email,
              firstName: formData.firstName,
              items: cart.map(item => ({
                name: item.name,
                brand: item.brand,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
              })),
            },
          });
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-0">
      <ExpressPayButtons total={total} formData={formData} cart={cart} token={token} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-ivory/10 bg-ivory/[0.02] p-8">
          <h2 className="font-serif text-2xl font-light text-ivory mb-6">Payment Information</h2>
          <div className="p-4 border border-ivory/15 bg-obsidian">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '14px',
                    color: '#FAF7F2',
                    fontFamily: '"DM Sans", sans-serif',
                    '::placeholder': {
                      color: 'rgba(250, 247, 242, 0.2)',
                    },
                    iconColor: '#C9A84C',
                  },
                  invalid: {
                    color: '#C4714A',
                    iconColor: '#C4714A',
                  },
                },
              }}
            />
          </div>
          <p className="text-[10px] tracking-widest uppercase font-sans text-ivory/40 mt-4">
            Test card: 4242 4242 4242 4242 | Any future date | Any 3 digits
          </p>
        </div>

        <div className="flex items-center gap-3 text-ivory/30 text-[10px] font-sans tracking-widest uppercase">
          <ShieldCheck size={14} className="text-gold-400/60" />
          Secured by Stripe · 256-bit SSL encryption
        </div>

        <button
          type="submit"
          disabled={!stripe || processing}
          className="btn-gold w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <Loader className="animate-spin" size={16} />
              Processing...
            </>
          ) : (
            `Pay EUR ${total.toFixed(2)}`
          )}
        </button>
      </form>
    </div>
  );
};

const DemoCheckoutForm: React.FC<{ total: number; formData: any; cart: any[]; token?: string | null }> = ({ total, formData, cart, token }) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const { orderData, totalAmount } = buildOrderData(formData, cart);
      const orderResponse = await api.createOrder(orderData, token);

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || orderResponse.message);
      }

      const paymentResponse = await api.createPaymentIntent(totalAmount, orderResponse.order.id);

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error || paymentResponse.message);
      }

      const confirmResponse = await api.confirmPayment(orderResponse.order.id, paymentResponse.paymentIntentId);

      if (!confirmResponse.success) {
        throw new Error(confirmResponse.error || confirmResponse.message);
      }

      clearCart();
      toast.success('Order placed successfully!');
      navigate('/order-confirmation', {
        state: {
          orderNumber: confirmResponse.order.orderNumber,
          total,
          email: formData.email,
          firstName: formData.firstName,
          items: cart.map(item => ({
            name: item.name,
            brand: item.brand,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Order failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border border-ivory/10 bg-ivory/[0.02] p-8">
        <h2 className="font-serif text-2xl font-light text-ivory mb-4">Order Payment</h2>
        <p className="text-[10px] tracking-widest uppercase font-sans text-ivory/40 leading-relaxed">
          Stripe keys are not configured. This checkout will place a demo order and save it immediately without processing real payment.
        </p>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="btn-gold w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader className="animate-spin" size={16} />
            Placing order...
          </>
        ) : (
          `Place Order EUR ${total.toFixed(2)}`
        )}
      </button>
    </form>
  );
};

const Checkout: React.FC = () => {
  const { cart, cartTotal } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    if (user) {
      const address = user.shippingAddresses?.find((item) => item.isDefault) || user.shippingAddresses?.[0];
      setFormData((current) => ({
        ...current,
        firstName: current.firstName || user.firstName || '',
        lastName: current.lastName || user.lastName || '',
        email: current.email || user.email || '',
        phone: current.phone || user.phone || '',
        address: current.address || address?.address || '',
        city: current.city || address?.city || '',
        zipCode: current.zipCode || address?.zipCode || '',
        country: current.country || address?.country || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const initStripe = async () => {
      try {
        const config = await api.getStripeConfig();
        if (config.success && config.publishableKey) {
          stripePromise = loadStripe(config.publishableKey);
        }
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        toast.error('Payment system unavailable');
      } finally {
        setLoading(false);
      }
    };

    initStripe();
  }, []);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const total = cartTotal;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader className="animate-spin mx-auto mb-4" size={48} />
        <p>Loading payment system...</p>
      </div>
    );
  }

  return (
    <main className="bg-obsidian text-ivory min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold-400 uppercase tracking-[0.35em] text-xs mb-4">Secure</p>
          <h1 className="font-serif text-5xl font-light tracking-wide">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            <div className="border border-ivory/10 bg-ivory/[0.02] p-8">
              <h2 className="font-serif text-2xl font-light text-ivory mb-6">Customer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">First Name</label>
                  <input
                    type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-transparent border border-ivory/15 text-ivory text-sm px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">Last Name</label>
                  <input
                    type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-transparent border border-ivory/15 text-ivory text-sm px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">Email Address</label>
                  <input
                    type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border border-ivory/15 text-ivory text-sm px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">Phone Number</label>
                  <input
                    type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent border border-ivory/15 text-ivory text-sm px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                  />
                </div>
              </div>
            </div>

            <div className="border border-ivory/10 bg-ivory/[0.02] p-8">
              <h2 className="font-serif text-2xl font-light text-ivory mb-6">Shipping Address</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">Street Address</label>
                  <input
                    type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-transparent border border-ivory/15 text-ivory text-sm px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">City</label>
                    <input
                      type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-transparent border border-ivory/15 text-ivory text-sm px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">ZIP Code</label>
                    <input
                      type="text" required value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full bg-transparent border border-ivory/15 text-ivory text-sm px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">Country</label>
                    <input
                      type="text" required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-transparent border border-ivory/15 text-ivory text-sm px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm total={total} formData={formData} cart={cart} token={token} />
              </Elements>
            ) : (
              <DemoCheckoutForm total={total} formData={formData} cart={cart} token={token} />
            )}
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="border border-ivory/10 bg-ivory/[0.02] p-8 sticky top-32">
              <h2 className="font-serif text-2xl font-light text-ivory mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-sand flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-sans text-sm text-ivory truncate">{item.name}</p>
                      <p className="text-[10px] tracking-widest uppercase font-sans text-ivory/40 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-serif text-ivory">EUR {item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-ivory/10 pt-6 space-y-4 font-sans text-sm">
                <div className="flex justify-between text-ivory/60">
                  <span className="uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span>EUR {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-ivory/60">
                  <span className="uppercase tracking-widest text-[10px]">Shipping</span>
                  <span>Complimentary</span>
                </div>
                <div className="flex justify-between items-end border-t border-ivory/10 pt-4 mt-2">
                  <span className="uppercase tracking-widest text-xs text-ivory">Total</span>
                  <span className="font-serif text-2xl text-gold-400">EUR {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;

