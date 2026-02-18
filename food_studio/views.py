from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib.auth.models import User
from .models import FoodItem, Order


# ================= HOME =================

def home(request):
    items = FoodItem.objects.filter(is_available=True)
    cart_count = len(request.session.get('cart', []))

    return render(request, "index.html", {
        "items": items,
        "cart_count": cart_count
    })


# ================= CART =================

def add_to_cart(request, item_id):
    cart = request.session.get('cart', [])

    if item_id not in cart:
        cart.append(item_id)

    request.session['cart'] = cart
    return redirect('home')


def remove_from_cart(request, item_id):
    cart = request.session.get('cart', [])

    if item_id in cart:
        cart.remove(item_id)

    request.session['cart'] = cart
    return redirect('checkout')


# ================= CHECKOUT =================
def checkout(request):
    cart_ids = request.session.get('cart', [])

    if not cart_ids:
        return redirect('home')

    items = FoodItem.objects.filter(id__in=cart_ids)
    total = sum(item.price for item in items)

    if request.method == "POST":
        name = request.POST.get("name")
        phone = request.POST.get("phone")
        address = request.POST.get("address")
        rating = request.POST.get("rating")

        user, created = User.objects.get_or_create(username=phone)

        if created:
            user.set_password(phone)
            user.first_name = name
            user.save()

        auth_login(request, user)

        for item in items:
            Order.objects.create(
                user=user,
                item=item,
                address=address,
                rating=rating
            )

        request.session['cart'] = []
        return redirect('my-orders')

    return render(request, "checkout.html", {
        "items": items,
        "total": total
    })

# ================= MY ORDERS =================

def my_orders(request):
    if not request.user.is_authenticated:
        return redirect('home')

    orders = Order.objects.filter(user=request.user).order_by('-id')

    return render(request, "my_orders.html", {
        "orders": orders
    })


# ================= ADMIN =================

def admin_login(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(username=username, password=password)

        if user and user.is_superuser:
            auth_login(request, user)
            return redirect('admin-panel')

    return render(request, "login.html")


def admin_panel(request):
    if not request.user.is_superuser:
        return redirect('admin-login')

    items = FoodItem.objects.all()
    orders = Order.objects.all().order_by('-id')

    return render(request, "admin_panel.html", {
        "items": items,
        "orders": orders
    })


def update_order(request, order_id):
    if request.method == "POST":
        order = get_object_or_404(Order, id=order_id)
        order.status = request.POST.get("status")
        order.save()

    return redirect('admin-panel')


def custom_logout(request):
    logout(request)
    return redirect('home')
