from django.urls import path, include
from django.contrib import admin


urlpatterns = [
    path(
        route="",
        view=include("core.urls"),
        name="session-keep-alive",
    ),
    path(
        route="admin/",
        view=admin.site.urls,
        name="admin-panel",
    ),
    path(
        route="api/v1/",
        view=include("api.urls"),
        name="api-v1",
    ),
]
