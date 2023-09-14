from django.urls import path
from . import views


urlpatterns = [
    path('index/',  views.index, name='index'),
    path('staff/',  views.staff, name='staff'),
    path('reports_pcb/',  views.reports_pcb, name='reports_pcb'),
    path('reports_communication_config/',  views.reports_communication_config, name='reports_communication_config'),
    path('reports_correction/',  views.reports_correction, name='reports_correction'),
    path('products/',  views.products, name='products'),
    path('metadata/',  views.metadata, name='metadata'),
    path('casing/',  views.casing, name='casing'),
    path('phase2_smt/',  views.phase2_smt, name='phase2_smt'),
    path('phase1_tht/',  views.phase1_tht, name='phase1_tht'),
    path('phase3_tunning/',  views.phase3_tunning, name='phase3_tunning'),
    path('monitor_assembly/',  views.monitor_assembly, name='monitor_assembly'),
    path('communication_config/',  views.communication_config, name='communication_config'),
    path('analysis/',  views.analysis, name='analysis'),
    path('correction/',  views.correction, name='correction'),
    path('edit_inventory/<int:pk>/',  views.edit_inventory, name='edit_inventory'),
    path('edit_casing/<int:pk>/',  views.edit_casing, name='edit_casing'),
    path('edit_phase2_smt/<int:pk>/',  views.edit_phase2_smt, name='edit_phase2_smt'),
    path('export_stock/', views.export_stock_to_csv, name='export_stock'),
    path('details/<int:pk>/',  views.details, name='details'),
    path('history/<int:pk>/',  views.history, name='history'),
]