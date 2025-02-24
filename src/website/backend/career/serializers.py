from rest_framework import serializers
from .models import Career, Department, JobDescription, BulletDescription, BulletPoint


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ("id", "name")
        model = Department


class JobDescriptionsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ("id", "description", "order", "career")
        model = JobDescription


class BulletPointSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ("id", "point", "order")
        model = BulletPoint


class BulletDescriptionsSerializer(serializers.ModelSerializer):
    bullet_points = BulletPointSerializer(read_only=True, many=True)

    class Meta:
        fields = ("id", "name", "order", "bullet_points")
        model = BulletDescription


class CareerSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    descriptions = JobDescriptionsSerializer(read_only=True, many=True)
    bullets = BulletDescriptionsSerializer(read_only=True, many=True)

    class Meta:
        model = Career
        fields = '__all__'
