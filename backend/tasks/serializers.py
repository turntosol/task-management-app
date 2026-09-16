import re
from urllib import request
from datetime import datetime
from django.utils import timezone
from rest_framework import serializers
from rest_framework.relations import PKOnlyObject
from .models import Task, Category, Tag, StickyNote, SubTask, ViewSetting


class CategorySerializer(serializers.ModelSerializer):

    task_count = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = Category

        fields = [
            "id",
            "name",
            "task_count",
        ]

        read_only_fields = [
            "id",
            "task_count",
        ]

    def validate_name(self, value):

        value = value.strip().lower()

        valid_values = {
            choice[0]
            for choice in Category.CATEGORY_CHOICES
        }

        if value not in valid_values:
            raise serializers.ValidationError(
                "Category must be one of: personal, work, order."
            )

        return value


class TagSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tag

        fields = [
            "id",
            "name",
            "background_color",
        ]

        read_only_fields = [
            "id",
        ]

    def validate_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Tag name cannot be empty."
            )

        return value


class SubTaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = SubTask

        fields = [
            "id",
            "task",
            "title",
            "is_completed",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_task(self, task):

        request = self.context.get(
            "request"
        )

        if (
            request is not None
            and task.user_id != request.user.id
        ):
            raise serializers.ValidationError(
                "You cannot add a subtask "
                "to another user's task."
            )

        return task

    def validate_title(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Subtask title cannot be empty."
            )

        return value

class CategoryField(serializers.PrimaryKeyRelatedField):

    def to_representation(self, value):
        # Nếu value là PKOnlyObject hoặc số nguyên, truy vấn lấy instance thật
        if isinstance(value, PKOnlyObject) or isinstance(value, (int, str)):
            pk = value.pk if isinstance(value, PKOnlyObject) else value
            try:
                value = Category.objects.get(pk=pk)
            except Category.DoesNotExist:
                return None

        return {
            "id": value.pk,
            "name": value.name,
        }
    
class TagField(serializers.PrimaryKeyRelatedField):

    def to_representation(self, value):
        if isinstance(value, PKOnlyObject) or isinstance(value, (int, str)):
            pk = value.pk if isinstance(value, PKOnlyObject) else value
            try:
                value = Tag.objects.get(pk=pk)
            except Tag.DoesNotExist:
                return None

        return {
            "id": value.pk,
            "name": value.name,
            "color": getattr(value, "color", "#3b82f6"),
        }


class TaskSerializer(serializers.ModelSerializer):

    category = CategoryField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
    )

    tags = TagField(
        many=True,
        queryset=Tag.objects.all(),
        required=False,
    )

    subtasks = SubTaskSerializer(
        many=True,
        read_only=True,
    )

    class Meta:

        model = Task

        fields = [
            "id",
            "title",
            "description",
            "due_date",
            "start_time",
            "end_time",
            "is_completed",
            "background_color",
            'is_calendar_event',
            "category",
            "tags",
            "subtasks",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "subtasks",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Task title cannot be empty."
            )

        return value

    def validate_background_color(self, value):

        if not re.fullmatch(
            r"#[0-9A-Fa-f]{6}",
            value,
        ):
            raise serializers.ValidationError(
                "Invalid HEX color."
            )

        return value.upper()

    def validate(self, attrs):

        start_time = attrs.get(
            "start_time",
            getattr(
                self.instance,
                "start_time",
                None,
            ),
        )

        end_time = attrs.get(
            "end_time",
            getattr(
                self.instance,
                "end_time",
                None,
            ),
        )

        if (
            (start_time is None)
            != (end_time is None)
        ):
            raise serializers.ValidationError({
                "start_time":
                    "Start time and end time "
                    "must be provided together."
            })

        if (
            start_time is not None
            and end_time is not None
            and start_time >= end_time
        ):
            raise serializers.ValidationError({
                "end_time":
                    "End time must be later "
                    "than start time."
            })

        return attrs

    def validate_category(self, category):

        if category is None:
            return category

        request = self.context.get("request")

        if (
            request is not None
            and category.user_id != request.user.id
        ):
            raise serializers.ValidationError(
                "You cannot use another user's category."
            )

        return category

    def validate_tags(self, tags):

        request = self.context.get("request")

        if request is None:
            return tags

        for tag in tags:

            if tag.user_id != request.user.id:
                raise serializers.ValidationError(
                    "You cannot use another user's tag."
                )

        return tags
    

class StickyNoteSerializer(serializers.ModelSerializer):

    class Meta:
        model = StickyNote

        fields = [
            "id",
            "title",
            "content",
            "color",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Title cannot be empty."
            )

        return value

    def validate_content(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Content cannot be empty."
            )

        return value

    def validate_color(self, value):
        value = value.strip()

        if not value.startswith("#") or len(value) != 7:
            raise serializers.ValidationError(
                "Color must be a valid hex color."
            )

        return value


class CalendarTaskSerializer(serializers.ModelSerializer):

    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()

    category = serializers.CharField(
        source="category.name",
        allow_null=True,
        read_only=True,
    )

    class Meta:
        model = Task

        fields = [
            "id",
            "title",
            "start",
            "end",
            "background_color",
            "category",
            "is_completed",
        ]

    def get_start(self, obj):

        if obj.start_time is None:
            start = datetime.combine(
                obj.due_date,
                datetime.min.time(),
            )
        else:
            start = datetime.combine(
                obj.due_date,
                obj.start_time,
            )

        return timezone.make_aware(start)

    def get_end(self, obj):

        if obj.end_time is None:
            end = datetime.combine(
                obj.due_date,
                datetime.max.time(),
            )
        else:
            end = datetime.combine(
                obj.due_date,
                obj.end_time,
            )

        return timezone.make_aware(end)


class ViewSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewSetting
        fields = ["view_name", "background_color"]