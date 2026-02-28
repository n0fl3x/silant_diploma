from rest_framework import permissions
from django.contrib.auth.models import Group


class IsManagerOrSuperadmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            manager_group = Group.objects.get(name="Менеджер")
            superadmin_group = Group.objects.get(name="Суперадмин")
            return request.user.group.filter(
                id__in=[manager_group.id, superadmin_group.id]
            ).exists()
        return False


class CanEditMachines(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return IsManagerOrSuperadmin().has_permission(request, view)
        return request.user and request.user.is_authenticated
