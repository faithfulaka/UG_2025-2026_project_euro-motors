'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCar } from '@/context/CarContext';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCar();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      // Here you would typically send the order to your backend
      // For now, we'll just simulate a successful checkout
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Order placed successfully!');
      clearCart();
      router.push('/');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4 text-black">Shopping Cart</h1>
          <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link href="/buy" className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-black">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-black">Order Summary</h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          {item.carMake} {item.carModel} ({item.carYear})
                        </h3>
                        <p className="text-gray-600">Type: <span className="font-semibold capitalize">{item.type}</span></p>
                        
                        {item.rentalDates && (
                          <div className="text-gray-600 mt-2">
                            <p>Duration Type: {item.rentalDates.duration}</p>
                            <p>
                              Start: {new Date(item.rentalDates.startDate).toLocaleDateString()}
                            </p>
                            <p>
                              End: {new Date(item.rentalDates.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-black">£{item.price}</p>
                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Total and Payment */}
          <div>
            <div className="bg-white border border-gray-300 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6 text-black">Order Total</h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>£0.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>£0.00</span>
                </div>
              </div>

              <div className="flex justify-between mb-8">
                <span className="text-xl font-bold text-black">Total:</span>
                <span className="text-xl font-bold text-black">£{total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Complete Purchase'}
              </button>

              <button
                onClick={() => router.back()}
                className="w-full mt-3 border border-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" defaultChecked className="mr-3" />
              <span className="font-semibold text-black">Credit Card</span>
            </label>
            <label className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" className="mr-3" />
              <span className="font-semibold text-black">PayPal</span>
            </label>
            <label className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" className="mr-3" />
              <span className="font-semibold text-black">Bank Transfer</span>
            </label>
            <label className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" className="mr-3" />
              <span className="font-semibold text-black">Apple Pay</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
