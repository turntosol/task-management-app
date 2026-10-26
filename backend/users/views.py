from firebase_admin import auth

from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

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

        print("FIREBASE UID:", firebase_uid)
        print("EMAIL:", email)

        user, created = User.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults={
                "username": firebase_uid,
                "email": email or "",
            }
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


