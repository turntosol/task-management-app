from rest_framework.response import Response
from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from datetime import timedelta

from django.utils import timezone
from django.db.models import Count

from .models import (
    Task,
    Category,
    Tag,
    StickyNote,
    SubTask,
    ViewSetting,
)

from .serializers import (
    CalendarTaskSerializer,
    TaskSerializer,
    CategorySerializer,
    TagSerializer,
    StickyNoteSerializer,
    SubTaskSerializer,
    ViewSettingSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):

    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Category.objects
            .filter(user=self.request.user)
            .annotate(
                task_count=Count("tasks")
            )
        )

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )


class TaskViewSet(viewsets.ModelViewSet):

    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        queryset = (
            Task.objects.filter(user=self.request.user)
            .select_related("category")
            .prefetch_related("tags", "subtasks")
        )

        status_filter = (
            self.request.query_params.get("status")
        )

        if status_filter == "active":

            queryset = queryset.filter(
                is_completed=False
            )

        elif status_filter == "done":

            queryset = queryset.filter(
                is_completed=True
            )

        date_filter = (
            self.request.query_params.get("date")
        )

        today = timezone.localdate()

        if date_filter == "today":

            queryset = queryset.filter(
                due_date=today
            )

        elif date_filter == "tomorrow":

            tomorrow = today + timedelta(days=1)

            queryset = queryset.filter(
                due_date=tomorrow
            )

        elif date_filter == "this_week":
            start_of_week = today - timedelta(
                days=today.weekday()
            )
            end_of_week = start_of_week + timedelta(
                days=6
            )
            
            queryset = queryset.filter(
                due_date__gte=start_of_week,
                due_date__lte=end_of_week
            )

        category_filter = self.request.query_params.get("category")

        if category_filter:
            queryset = queryset.filter(
                category__name=category_filter
            )

        return queryset.order_by(
            "due_date",
            "start_time",
            "-created_at",
        )

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )


class SubTaskViewSet(viewsets.ModelViewSet):

    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        queryset = (
            SubTask.objects
            .filter(
                task__user=self.request.user
            )
            .select_related(
                "task"
            )
        )

        task_id = (
            self.request.query_params.get(
                "task"
            )
        )

        if task_id:

            try:
                task_id = int(task_id)

            except ValueError:
                raise serializers.ValidationError({
                    "task":
                    "Task ID must be an integer."
                })

            queryset = queryset.filter( 
                task_id=task_id
            )

        return queryset.order_by(
            "created_at"
        )

    def perform_create(self, serializer):

        serializer.save()


class TagViewSet(viewsets.ModelViewSet):

    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )

class StickyNoteViewSet(viewsets.ModelViewSet):

    serializer_class = StickyNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StickyNote.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )


class CalendarViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = CalendarTaskSerializer
    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        queryset = (
            Task.objects
            .filter(
                user=self.request.user
            )
            .select_related(
                "category"
            )
            .prefetch_related(
                "tags",
                "subtasks",
            )
        )

        start_date = (
            self.request.query_params.get(
                "start"
            )
        )

        end_date = (
            self.request.query_params.get(
                "end"
            )
        )

        if start_date:

            parsed_start = parsedate(
                start_date
            )

            if parsed_start is None:
                raise ValidationErr({
                    "start":
                    "Use YYYY-MM-DD."
                })

            queryset = queryset.filter(
                due_date__gte=parsed_start
            )

        if end_date:

            parsed_end = parsedate(
                end_date
            )

            if parsed_end is None:
                raise ValidationErr({
                    "end":
                    "Use YYYY-MM-DD."
                })

            queryset = queryset.filter(
                due_date__lte=parsed_end
            )

        return queryset.order_by(
            "due_date",
            "start_time",
        )


class ViewSettingViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    # GET /api/view-settings/?view=today
    def list(self, request):
        view_name = request.query_params.get("view", "today")
        setting, _ = ViewSetting.objects.get_or_create(
            user=request.user,
            view_name=view_name,
            defaults={"background_color": "#FCFCFC"}
        )
        return Response(ViewSettingSerializer(setting).data)

    # PATCH /api/view-settings/update-color/
    @action(detail=False, methods=["patch"], url_path="update-color")
    def update_color(self, request):
        view_name = request.data.get("view_name", "today")
        bg_color = request.data.get("background_color")

        if not bg_color:
            return Response(
                {"detail": "background_color is required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        setting, _ = ViewSetting.objects.get_or_create(
            user=request.user,
            view_name=view_name,
            defaults={"background_color": "#FCFCFC"}
        )
        setting.background_color = bg_color
        setting.save()

        return Response(ViewSettingSerializer(setting).data, status=status.HTTP_200_OK)
