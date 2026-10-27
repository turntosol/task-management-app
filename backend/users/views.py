from firebase_admin import auth
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from tasks.models import Tag

User = get_user_model()


class SyncFirebaseUserView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        auth_header = request.headers.get(
            "Authorization"
        )

        print("HEADER:", auth_header)

        if not auth_header:
            return Response({
                "error": "No Authorization header"
            }, status=401)

        try:
            scheme, token = auth_header.split(
                " ",
                1
            )

            decoded_token = auth.verify_id_token(
                token
            )

            print("TOKEN VERIFIED")

        except Exception as e:
            print("FIREBASE ERROR:", repr(e))

            return Response({
                "error": str(e)
            }, status=401)

        firebase_uid = decoded_token["uid"]
        email = decoded_token.get("email")

        requested_username = request.data.get("username")

        print("FIREBASE UID:", firebase_uid)
        print("EMAIL:", email)
        print("REQUESTED USERNAME:", requested_username)

        user = User.objects.filter(firebase_uid=firebase_uid).first()

        if user:
            created = False
            # Nếu user đã tồn tại nhưng có gửi username mới lên và khác username cũ, có thể cập nhật
            if requested_username and user.username != requested_username:
                user.username = requested_username
                user.save()
        else:
            # Nếu chưa tồn tại, lấy username từ request, nếu client không gửi thì lấy phần trước dấu @ của email hoặc dùng firebase_uid
            fallback_username = email.split("@")[0] if email else firebase_uid
            base_username = requested_username or fallback_username

            # Đảm bảo username là duy nhất trong DB (phòng trường hợp trùng lặp)
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            # Tạo user mới với username đã xử lý
            user = User.objects.create(
                firebase_uid=firebase_uid,
                username=username,
                email=email or ""
            )
            created = True

        DEFAULT_TAGS = [
            {"name": "important", "background_color": "#ef4444"},  # Đỏ
            {"name": "urgent", "background_color": "#f59e0b"},     # Vàng/Cam
            {"name": "other", "background_color": "#3b82f6"},      # Xanh
        ]

        if created:
            for tag_data in DEFAULT_TAGS:
                Tag.objects.get_or_create(
                    user=user,
                    name=tag_data["name"],
                    defaults={"background_color": tag_data["background_color"]}
                )

        print("DJANGO USER:", user)
        print("CREATED:", created)

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "firebase_uid": user.firebase_uid,
            "created": created,
        })


