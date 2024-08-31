
from django.contrib import admin
from django.urls import path, include, re_path
from frontend import views
from django.conf.urls.static import static
from django.conf import settings
# from backend import worker, api
# # from backend.api import account, admin, activate_account, check_connection, quizzes



urlpatterns = [
    path('assets/<path:file>/', views.assets_serve),
    path('(tabs)/<path:file>/', views.assets_serve),
    
    path('favicon.ico/', views.favicon),
    path('favicon.ico/', views.favicon),
    path('manifest.webmanifest/', views.manifest),
    path('manifest.webmanifest', views.manifest),

    path('', views.App),
    re_path(r'^.*/$', views.App),
    # path('_expo/<str:file>', views.static_serve),


    # path('firebase-messaging-sw.js/', views.firebase_messaging_sw),
    # path('firebase-messaging-sw.js', views.firebase_messaging_sw),
]
