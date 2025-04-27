from django.urls import path
from .views import (
      LoginView , RegisterView, LogoutView, 
      PasswordChangeView , PasswordResetConfirmView , PasswordResetRequestView)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
      path('register/', RegisterView.as_view(), name='register'),
      path('login/', LoginView.as_view(), name='login'),
      path('logout/', LogoutView.as_view(),name='logout'),
      path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
      path("password-reset-confirm/<uidb64>/<token>/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
      path("password-change/", PasswordChangeView.as_view(), name="password-change"),
      path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]