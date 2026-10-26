from firebase_admin import auth
from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth import get_user_model

from backend.tasks.models import Tag

User = get_user_model()


class FirebaseAuthentication(
    authentication.BaseAuthentication
):
    def authenticate(self, request):

        auth_header = request.headers.get(
            "Authorization"
        )

        if not auth_header:
            return None

        try:
            scheme, token = auth_header.split(
                " ",
                1
            )

        except ValueError:
            raise exceptions.AuthenticationFailed(
                "Invalid Authorization header."
            )

        if scheme.lower() != "bearer":
            raise exceptions.AuthenticationFailed(
                "Bearer token required."
            )

        # Verify Firebase ID Token
        try:
            decoded_token = auth.verify_id_token(
                token
            )

        except Exception as e:
            print(
                "=== LỖI XÁC THỰC FIREBASE ===",
                str(e)
            )

            raise exceptions.AuthenticationFailed(
                f"Invalid Firebase ID token: {str(e)}"
            )

        firebase_uid = decoded_token["uid"]
        email = decoded_token.get("email", "")
        requested_username = request.data.get("username")

        user = User.objects.filter(firebase_uid=firebase_uid).first()

        if user:
            created = False
            if requested_username and user.username != requested_username:
                user.username = requested_username
                user.save()
        else:
            fallback_username = email.split("@")[0] if email else firebase_uid
            base_username = requested_username or fallback_username

            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            user = User.objects.create(
                firebase_uid=firebase_uid,
                username=username,
                email=email or ""
            )
            created = True


        if created:
            
            DEFAULT_TAGS = [
                {"name": "important", "background_color": "#ef4444"},  # Đỏ
                {"name": "urgent", "background_color": "#f59e0b"},     # Vàng/Cam
                {"name": "other", "background_color": "#3b82f6"},      # Xanh
            ]

            for tag_data in DEFAULT_TAGS:
                Tag.objects.get_or_create(
                    user=user,
                    name=tag_data["name"],
                    defaults={"background_color": tag_data["background_color"]}
                )

            print(
                "=== DJANGO USER CREATED ==="
            )
            print(
                "Firebase UID:",
                firebase_uid
            )
            print(
                "Username:", 
                username
            )
            print(
                "Email:",
                email
            )

        else:
            print(
                "=== DJANGO USER FOUND ==="
            )
            print(
                "Firebase UID:",
                firebase_uid
            )

        return user, None