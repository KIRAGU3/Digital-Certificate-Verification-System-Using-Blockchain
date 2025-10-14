# certificates/urls.py
from django.urls import path
from certificates import views
from .views import IssueCertificateView

urlpatterns = [
    path('', views.certificate_list_view, name='certificate_list'),
    path('issue/', IssueCertificateView.as_view(), name='issue_certificate'),
    path('verify/<str:cert_hash>/', views.verify_certificate_view, name='verify_certificate'),
    path('verify-blockchain/<str:cert_hash>/', views.verify_blockchain_view, name='verify_blockchain'),
    path('revoke/<str:cert_hash>/', views.revoke_certificate_view, name='revoke_certificate'),
    path('admin/login/', views.admin_login, name='admin_login'),
]
