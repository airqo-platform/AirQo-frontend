from django.db import models
from django.contrib.auth.models import User

# Create your models here.


PERMISSIONS = (
    ('view','view'),
    ('edit','edit'),
    ('admin','admin')
)
class Profile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,null=True)
    phone_number = models.CharField(max_length=20,null=True)
    email = models.EmailField(max_length=20,null=True,unique=True)
    image =models.ImageField(default='download.png',upload_to='profile_image')
    permission_level = models.CharField(max_length=10,choices=PERMISSIONS)

    def __str__(self):
        return self.user.username




# class Persons(models.Model):
#     full_name = models.CharField(max_length=100)
#     phone_number = models.CharField(max_length=10)
#     email = models.EmailField(max_length=254,primary_key=True)
#     login_date = models.DateField(auto_now=False,auto_now_add=False)
#     permission_level = models.CharField(max_length=10,choices=PERMISSIONS)
