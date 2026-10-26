from django.conf import settings
from django.db import models
from django.db.models import F, Q


class Tag(models.Model):

    TAG_CHOICES = [
        ("important", "Important"),
        ("urgent", "Urgent"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tags",
    )

    name = models.CharField(
        max_length=50,
    )
    
    background_color = models.CharField(
        max_length=7,
        default="#3b82f6",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"],
                name="unique_tag_per_user",
            ),
        ]

    def __str__(self):
        return self.name
    

class Category(models.Model):

    CATEGORY_CHOICES = [
        ("personal", "Personal"),
        ("work", "Work"),
        ("order", "Order"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
    )

    name = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
    )

    class Meta:
        constraints = [

            models.UniqueConstraint(
                fields=["user", "name"],
                name="unique_category_per_user",
            ),

            models.CheckConstraint(
                condition=models.Q(
                    name__in=[
                        "personal",
                        "work",
                        "order",
                    ]
                ),
                name="category_name_valid",
            ),
        ]

    def __str__(self):
        return self.name


class Task(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )

    tags = models.ManyToManyField(
        Tag,
        blank=True,
        related_name="tasks",
    )

    title = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
    )

    due_date = models.DateField()

    start_time = models.TimeField(
        null=True,
        blank=True,
    )

    end_time = models.TimeField(
        null=True,
        blank=True,
    )

    is_calendar_event = models.BooleanField(default=False)

    is_completed = models.BooleanField(
        default=False,
    )

    background_color = models.CharField(
        max_length=7,
        default="#FFFFFF",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        indexes = [
            models.Index(
                fields=["user", "due_date"]
            ),
            models.Index(
                fields=["user", "is_completed"]
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(start_time__isnull=True)
                    & Q(end_time__isnull=True)
                )
                |
                (
                    Q(start_time__isnull=False)
                    & Q(end_time__isnull=False)
                ),
                name="task_start_end_both_null_or_set",
            ),

            models.CheckConstraint(
                condition=(
                    Q(start_time__isnull=True)
                    & Q(end_time__isnull=True)
                )
                |
                Q(start_time__lt=F("end_time")),
                name="task_start_before_end",
            ),
        ]

    def __str__(self):
        return self.title

class SubTask(models.Model):

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="subtasks",
    )

    title = models.CharField(
        max_length=255,
    )

    is_completed = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.title

class TaskTag(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="task_tags",
    )

    tag = models.ForeignKey(
        Tag,
        on_delete=models.CASCADE,
        related_name="tag_tasks",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["task", "tag"],
                name="unique_task_tag",
            )
        ]

    def __str__(self):
        return f"{self.task.title} - {self.tag.name}"


class StickyNote(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sticky_notes",
    )

    title = models.CharField(
        max_length=50
    )

    content = models.TextField()

    color = models.CharField(
        max_length=7,
        default="#ffeb3b"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ViewSetting(models.Model):
    VIEW_CHOICES = [
        ("today", "Today"),
        ("tomorrow", "Tomorrow"),
        ("this_week", "This Week"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="view_settings",
    )
    view_name = models.CharField(
        max_length=20,
        choices=VIEW_CHOICES,
    )
    background_color = models.CharField(
        max_length=7,
        default="#FCFCFC",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "view_name"],
                name="unique_user_view_setting",
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.view_name}: {self.background_color}"