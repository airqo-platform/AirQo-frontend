"""website URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
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
from django.urls import path, include, re_path
from rest_framework.routers import SimpleRouter
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from .career import views as career_views
from .FAQ import views as FAQ_views
from .team import views as team_views

# Config Admin Panel
admin.site.site_header = "AirQo Administration"
admin.site.site_title = "AirQo Admin Portal"
admin.site.index_title = "Welcome to AirQo Website Administration Portal"


# Config DRF ViewSet Router
api_router = SimpleRouter()

api_router.register(r'team', team_views.TeamViewSet)
api_router.register(r'faq', FAQ_views.FAQViewSet)
api_router.register(r'career', career_views.CareerViewSet)
api_router.register(r'departments', career_views.DepartmentViewSet)

# Config DRF Auto-Swagger Generation
schema_view = get_schema_view(
   openapi.Info(
      title="AirQo Website API",
      default_version='v1',
      description="AirQo website swagger documentation",
      # terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="airqo.analytics@gmail.com"),
      # license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_router.urls)),
    re_path(r'^api/?$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^api/doc(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^api/doc/?$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^api/redoc/?$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('', include('frontend.urls')),
]
