from django.db import models
from django.contrib.auth.models import User


class FoodItem(models.Model):
    name = models.CharField(max_length=100)
    price = models.IntegerField()
    category = models.CharField(max_length=50)
    image = models.ImageField(upload_to='food_images/', null=True, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Order Received'),
        ('Cooking', 'Preparing Food'),
        ('Out', 'Out for Delivery'),
        ('Delivered', 'Delivered'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    address = models.TextField()
    rating = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
