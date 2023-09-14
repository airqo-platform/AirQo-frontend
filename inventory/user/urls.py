from django.urls import path
from . import views
from .views import logout_view

urlpatterns = [
    path('',  views.register, name='register'),
    path('profile',  views.profile, name='profile'),
    path('logout/', logout_view, name='logout'),
    path('activate/<uidb64>/<token>',  views.activate, name='activate'),
]