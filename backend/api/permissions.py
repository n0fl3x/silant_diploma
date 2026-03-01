from rest_framework import permissions


class IsManagerOrSuperadmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            group_name = request.user.user_type if request.user.group else None
            print(group_name)
            return group_name in ["manager", "superadmin"]
        return False


class CanEditMachines(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return IsManagerOrSuperadmin().has_permission(request, view)
        return request.user and request.user.is_authenticated
