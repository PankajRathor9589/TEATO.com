from django.urls import path
from . import views  # Relative import zaroori hai

urlpatterns = [
    path("", views.home, name="home"),
    path("add-to-cart/<int:item_id>/", views.add_to_cart, name="add-to-cart"),
    path("remove-from-cart/<int:item_id>/", views.remove_from_cart, name="remove-from-cart"),
    path("checkout/", views.checkout, name="checkout"),
    path("my-orders/", views.my_orders, name="my-orders"),
    path("admin-login/", views.admin_login, name="admin-login"),
    path("admin-panel/", views.admin_panel, name="admin-panel"),
    path('update-order/<int:order_id>/', views.update_order, name='update-order'),
    path("logout/", views.custom_logout, name="logout"),
]