import React, { createContext, useContext, useReducer, useCallback } from 'react';

const CartContext = createContext(null);

const storageKey = 'teato_cart';

function loadCart() {
  try {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

function cartReducer(state, action) {
  let next;
  switch (action.type) {
    case 'ADD':
      const sameAddons = (a, b) => JSON.stringify(a || []) === JSON.stringify(b || []);
      const existing = state.find(
        (i) => i.menuItem === action.payload.menuItem && sameAddons(i.addons, action.payload.addons)
      );
      if (existing) {
        next = state.map((i) =>
          i.menuItem === action.payload.menuItem && sameAddons(i.addons, action.payload.addons) ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) } : i
        );
      } else {
        next = [...state, { ...action.payload, quantity: action.payload.quantity || 1 }];
      }
      break;
    case 'UPDATE_QTY':
      const matchAddons = (i) => JSON.stringify(i.addons || []) === JSON.stringify(action.payload.addons || []);
      next = state.map((i) =>
        i.menuItem === action.payload.menuItem && matchAddons(i) ? { ...i, quantity: Math.max(0, action.payload.quantity) } : i
      ).filter((i) => i.quantity > 0);
      break;
    case 'REMOVE':
      next = state.filter((i) => !(i.menuItem === action.payload.menuItem && JSON.stringify(i.addons || []) === JSON.stringify(action.payload.addons || [])));
      break;
    case 'CLEAR':
      next = [];
      break;
    case 'SET':
      next = action.payload || [];
      break;
    default:
      return state;
  }
  saveCart(next);
  return next;
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, loadCart());

  const addItem = useCallback((item) => {
    dispatch({ type: 'ADD', payload: item });
  }, []);

  const updateQuantity = useCallback((menuItem, quantity, addons) => {
    dispatch({ type: 'UPDATE_QTY', payload: { menuItem, quantity, addons } });
  }, []);

  const removeItem = useCallback((menuItem, addons) => {
    dispatch({ type: 'REMOVE', payload: { menuItem, addons } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartTotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
