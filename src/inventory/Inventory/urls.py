"""
URL configuration for Inventory project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static 
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

#from user import views as user_view

urlpatterns = [
    path('inventory/admin/', admin.site.urls),
    path('inventory/', include('dashboard.urls')),
    path('inventory/user/',include('user.urls')),
    path('inventory/login/', auth_views.LoginView.as_view(template_name = 'user/login.html'),name='login'),
] + staticfiles_urlpatterns()

#urlpatterns +=  
