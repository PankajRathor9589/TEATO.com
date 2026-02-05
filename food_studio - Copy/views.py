from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import FoodItem, Order  # Path ensure karein

# --- CUSTOMER VIEWS ---
def home(request):
    items = FoodItem.objects.all()
    cart_count = len(request.session.get('cart', []))
    return render(request, 'index.html', {'items': items, 'cart_count': cart_count})

def add_to_cart(request, item_id):
    cart = request.session.get('cart', [])
    cart.append(item_id)
    request.session['cart'] = cart
    return redirect('home')

def remove_from_cart(request, item_id):
    cart = request.session.get('cart', [])
    if item_id in cart: cart.remove(item_id)
    request.session['cart'] = cart
    return redirect('checkout')

def checkout(request):
    cart_ids = request.session.get('cart', [])
    if not cart_ids: return redirect('home')
    items = FoodItem.objects.filter(id__in=cart_ids)
    total = sum(i.price for i in items)

    if request.method == "POST":
        name, phone = request.POST.get('name'), request.POST.get('phone')
        addr, rat = request.POST.get('address'), request.POST.get('rating')

        user, created = User.objects.get_or_create(username=phone)
        if created:
            user.set_password(phone)
            user.first_name = name
            user.save()
        auth_login(request, user)

        for item in items:
            Order.objects.create(user=user, item=item, address=addr, rating=rat)
        
        request.session['cart'] = []
        return redirect('my-orders')
    return render(request, 'checkout.html', {'items': items, 'total': total})

def my_orders(request):
    if not request.user.is_authenticated: return redirect('home')
    orders = Order.objects.filter(user=request.user).order_by('-id')
    return render(request, 'my_orders.html', {'orders': orders})

# --- ADMIN VIEWS ---
def admin_login(request):
    if request.method == "POST":
        u, p = request.POST.get('username'), request.POST.get('password')
        user = authenticate(username=u, password=p)
        if user and user.is_superuser:
            auth_login(request, user)
            return redirect('admin-panel')
    return render(request, 'login.html')

def admin_panel(request):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return redirect('admin-login')
    return render(request, 'admin_panel.html', {
        'items': FoodItem.objects.all(), 
        'orders': Order.objects.all().order_by('-id')
    })

def update_order(request, order_id):
    if request.method == 'POST' and request.user.is_superuser:
        order = get_object_or_404(Order, id=order_id)
        new_status = request.POST.get('status')
        if new_status:
            order.status = new_status
            order.save()
    return redirect('admin-panel')

def custom_logout(request):
    logout(request)
    return redirect('home')