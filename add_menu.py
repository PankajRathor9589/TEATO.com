import os
import django

# Django settings configure karna
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'teato_app.settings')
django.setup()

from food_studio.models import FoodItem

# 20 Items ki list
menu_items = [
    # --- TEA (CHAI) ---
    {'name': 'Masala Chai', 'price': 20, 'category': 'Tea'},
    {'name': 'Ginger Tea', 'price': 25, 'category': 'Tea'},
    {'name': 'Cardamom Tea', 'price': 25, 'category': 'Tea'},
    {'name': 'Lemon Tea', 'price': 30, 'category': 'Tea'},
    {'name': 'Green Tea', 'price': 40, 'category': 'Tea'},
    
    # --- COFFEE ---
    {'name': 'Hot Coffee', 'price': 50, 'category': 'Coffee'},
    {'name': 'Cappuccino', 'price': 80, 'category': 'Coffee'},
    {'name': 'Espresso', 'price': 60, 'category': 'Coffee'},
    {'name': 'Cafe Mocha', 'price': 90, 'category': 'Coffee'},
    {'name': 'Latte', 'price': 85, 'category': 'Coffee'},

    # --- COLD COFFEE & COOLERS ---
    {'name': 'Cold Coffee Classic', 'price': 70, 'category': 'Cold Coffee'},
    {'name': 'Chocolate Cold Coffee', 'price': 90, 'category': 'Cold Coffee'},
    {'name': 'Virgin Mojito', 'price': 100, 'category': 'Coolers'},
    {'name': 'Blue Lagoon', 'price': 110, 'category': 'Coolers'},
    {'name': 'Iced Tea', 'price': 60, 'category': 'Coolers'},

    # --- SNACKS ---
    {'name': 'Bun Maska', 'price': 40, 'category': 'Snacks'},
    {'name': 'Veg Sandwich', 'price': 60, 'category': 'Snacks'},
    {'name': 'Paneer Sandwich', 'price': 90, 'category': 'Snacks'},
    {'name': 'French Fries', 'price': 80, 'category': 'Snacks'},
    {'name': 'Samosa (2pc)', 'price': 30, 'category': 'Snacks'},
]

def add_items():
    print("Adding items to TEATO Menu...")
    for item in menu_items:
        obj, created = FoodItem.objects.get_or_create(
            name=item['name'],
            defaults={'price': item['price'], 'category': item['category']}
        )
        if created:
            print(f"Added: {item['name']}")
    print("Success! 20 items are now in your menu.")

if __name__ == '__main__':
    add_items()