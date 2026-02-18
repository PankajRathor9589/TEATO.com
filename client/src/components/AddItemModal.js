import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function AddItemModal({ item, onClose }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState({}); // { customizationName: optionName }

  const customizations = item?.customizations || [];
  const basePrice = item?.price || 0;
  let addonsTotal = 0;
  customizations.forEach((c) => {
    const optName = selectedAddons[c.name];
    const opt = c.options?.find((o) => o.name === optName);
    if (opt) addonsTotal += (opt.price || 0) * quantity;
  });
  const totalPrice = basePrice * quantity + addonsTotal;

  const handleAdd = () => {
    const addons = customizations
      .filter((c) => selectedAddons[c.name])
      .map((c) => ({ name: c.name, optionName: selectedAddons[c.name] }));
    const optPrices = customizations.reduce((sum, c) => {
      const o = c.options?.find((x) => x.name === selectedAddons[c.name]);
      return sum + (o?.price || 0);
    }, 0);
    addItem({
      menuItem: item._id,
      name: item.name,
      price: basePrice + optPrices,
      image: item.image,
      quantity,
      addons: addons.length ? addons : undefined,
    });
    toast.success(`Added ${item.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-premium-card border border-white/10 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-card-hover" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-bold text-premium-text">{item?.name}</h3>
          <button type="button" onClick={onClose} className="text-premium-muted hover:text-premium-text text-2xl">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-premium-accent font-bold">₹{basePrice} base</p>
          {customizations.length > 0 && (
            <div>
              <h4 className="font-medium text-premium-text mb-2">Add-ons / Variants</h4>
              {customizations.map((c) => (
                <div key={c.name} className="mb-3">
                  <p className="text-sm text-premium-muted mb-1">{c.name}{c.required ? ' *' : ''}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.options?.map((opt) => (
                      <label key={opt.name} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${selectedAddons[c.name] === opt.name ? 'border-premium-accent bg-premium-accent/10 text-premium-text' : 'border-white/20 text-premium-muted hover:border-white/30'}`}>
                        <input type="radio" name={c.name} checked={selectedAddons[c.name] === opt.name} onChange={() => setSelectedAddons((s) => ({ ...s, [c.name]: opt.name }))} className="sr-only" />
                        <span>{opt.name}</span>
                        {opt.price > 0 && <span className="text-premium-accent text-sm">+₹{opt.price}</span>}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4">
            <span className="font-medium text-premium-muted">Quantity</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded-lg border border-white/20 font-bold text-premium-text hover:bg-white/10">−</button>
              <span className="w-8 text-center font-semibold text-premium-text">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 rounded-lg border border-white/20 font-bold text-premium-text hover:bg-white/10">+</button>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-lg text-premium-text">Total ₹{totalPrice}</span>
            <button type="button" onClick={handleAdd} className="btn-premium">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
