from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
        name="admin_panel",
    ),
    path(
        "api/v1/",
        include("api.urls"),
        name="api",
    ),
]
