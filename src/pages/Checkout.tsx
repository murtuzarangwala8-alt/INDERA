import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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

const buildOrderData = (formData: any, cart: any[]) => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 5 ? 0 : 0.50;
  const tax = subtotal * 0.1;
  const totalAmount = subtotal + shipping + tax;

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

const CheckoutForm: React.FC<{ total: number; formData: any; cart: any[]; token?: string | null }> = ({ total, formData, cart, token }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

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
        throw new Error(orderResponse.message);
      }

      // Create payment intent
      const paymentResponse = await api.createPaymentIntent(
        totalAmount,
        orderResponse.order.id
      );

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message);
      }

      // Confirm card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // For demo: simulate successful payment
      const paymentIntent = {
        id: paymentResponse.paymentIntentId,
        status: 'succeeded',
      };

      // In production with real Stripe keys, use this:
      /*
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
                country: 'US',
              },
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }
      */

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const confirmResponse = await api.confirmPayment(
          orderResponse.order.id,
          paymentIntent.id
        );

        if (confirmResponse.success) {
          setOrderNumber(confirmResponse.order.orderNumber);
          setOrderComplete(true);
          clearCart();
          toast.success('Order placed successfully!');
          
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle size={80} className="mx-auto mb-6 text-green-500" />
        <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          Thank you for your purchase!
        </p>
        <p className="text-lg mb-8">
          Order Number: <span className="font-bold text-gold-500">{orderNumber}</span>
        </p>
        <p className="text-gray-500">A confirmation email has been sent to {formData.email}</p>
        <p className="text-gray-500 mt-2">Redirecting to home page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-4">
          💳 Test card: 4242 4242 4242 4242 | Any future date | Any 3 digits
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gold-500 text-black py-4 rounded-lg hover:bg-gold-600 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader className="animate-spin" size={20} />
            Processing...
          </>
        ) : (
          `Pay $${total.toFixed(2)}`
        )}
      </button>
    </form>
  );
};

const DemoCheckoutForm: React.FC<{ total: number; formData: any; cart: any[]; token?: string | null }> = ({ total, formData, cart, token }) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const { orderData, totalAmount } = buildOrderData(formData, cart);
      const orderResponse = await api.createOrder(orderData, token);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message);
      }

      const paymentResponse = await api.createPaymentIntent(totalAmount, orderResponse.order.id);

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message);
      }

      const confirmResponse = await api.confirmPayment(orderResponse.order.id, paymentResponse.paymentIntentId);

      if (!confirmResponse.success) {
        throw new Error(confirmResponse.message);
      }

      setOrderNumber(confirmResponse.order.orderNumber);
      setOrderComplete(true);
      clearCart();
      toast.success('Order placed successfully!');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Order failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle size={80} className="mx-auto mb-6 text-green-500" />
        <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          Thank you for your purchase!
        </p>
        <p className="text-lg mb-8">
          Order Number: <span className="font-bold text-gold-500">{orderNumber}</span>
        </p>
        <p className="text-gray-500">Your order is saved in your account and admin dashboard.</p>
        <p className="text-gray-500 mt-2">Redirecting to home page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-3">Order Payment</h2>
        <p className="text-sm text-gray-500">
          Stripe keys are not configured, so this checkout will place a demo order and save it immediately.
        </p>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="w-full bg-gold-500 text-black py-4 rounded-lg hover:bg-gold-600 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader className="animate-spin" size={20} />
            Placing order...
          </>
        ) : (
          `Place Order $${total.toFixed(2)}`
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

  const total = cartTotal + (cartTotal > 5 ? 0 : 0.50) + cartTotal * 0.1;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader className="animate-spin mx-auto mb-4" size={48} />
        <p>Loading payment system...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Street Address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
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
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-gold-500">${item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{cartTotal > 5 ? 'FREE' : '$0.50'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(cartTotal * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2">
                <span>Total</span>
                <span className="text-gold-500">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
