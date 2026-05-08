import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold text-center mb-12">Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Have a question about our watches or need assistance? We're here to help. 
            Fill out the form and our team will respond within 24 hours.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="text-black" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Email</h3>
                <p className="text-gray-600 dark:text-gray-400">info@chronolux.com</p>
                <p className="text-gray-600 dark:text-gray-400">support@chronolux.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="text-black" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Phone</h3>
                <p className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
                <p className="text-gray-600 dark:text-gray-400">Mon-Fri: 9AM - 6PM EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="text-black" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Address</h3>
                <p className="text-gray-600 dark:text-gray-400">123 Luxury Avenue</p>
                <p className="text-gray-600 dark:text-gray-400">New York, NY 10001</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gold-500 outline-none"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gold-500 outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gold-500 outline-none"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Message</label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gold-500 outline-none resize-none"
                placeholder="Your message..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gold-500 text-black py-4 rounded-lg hover:bg-gold-600 transition font-semibold"
            >
              <Send size={20} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
