from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings
from rest_framework import permissions
from django.contrib.auth.decorators import user_passes_test

# Import your views
from .career import views as career_views
from .FAQ import views as FAQ_views
from .team import views as team_views
from .highlights import views as highlight_views
from .partners import views as partner_views
from .board import views as board_views
from .publications import views as publication_views
from .event import views as event_views
from .africancities import views as city_views
from .press import views as press_views
from .impact import views as impact_views
from .cleanair import views as cleanair_views

# Config Admin Panel
admin.site.site_header = "AirQo Website Administration"
admin.site.site_title = "AirQo Admin Portal"
admin.site.index_title = "Welcome to AirQo Website Administration Portal"

# Config DRF ViewSet Router
router = DefaultRouter()
router.register(r'team', team_views.TeamViewSet)
router.register(r'faq', FAQ_views.FAQViewSet)
router.register(r'career', career_views.CareerViewSet)
router.register(r'highlights', highlight_views.HighlightViewSet)
router.register(r'departments', career_views.DepartmentViewSet)
router.register(r'tags', highlight_views.TagViewSet)
router.register(r'partner', partner_views.PartnerViewSet)
router.register(r'board', board_views.BoardViewSet)
router.register(r'publications', publication_views.PublicationViewSet)
router.register(r'event', event_views.EventViewSet)
router.register(r'african_city', city_views.AfricanCityViewSet)
router.register(r'press', press_views.PressViewSet)
router.register(r'impact', impact_views.ImpactViewSet)
router.register(r'cleanair_resources', cleanair_views.CleanAirResourceViewSet)
router.register(r'forum_events', cleanair_views.ForumEventViewSet)

# Custom permission check


def is_admin(user):
    return user.is_authenticated and user.is_staff


# Config DRF Auto-Swagger Generation
schema_view = get_schema_view(
    openapi.Info(
        title="AirQo Website API",
        default_version='v1',
        description="AirQo website swagger documentation",
        contact=openapi.Contact(email="airqo.analytics@gmail.com"),
    ),
    public=False,
    permission_classes=[permissions.IsAdminUser],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/', user_passes_test(is_admin)(schema_view.with_ui('swagger',
         cache_timeout=0)), name='schema-swagger-ui'),
    path('api/doc/', user_passes_test(is_admin)
         (schema_view.with_ui('swagger', cache_timeout=0)), name='schema-swagger-ui'),
    path('api/redoc/', user_passes_test(is_admin)
         (schema_view.with_ui('redoc', cache_timeout=0)), name='schema-redoc'),
    path('', include('frontend.urls')),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
