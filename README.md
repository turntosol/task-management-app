# Task Management App

## Introduce

Task Management App is a web-based task management system that helps users organize, track, and manage their daily tasks efficiently.

The application supports task management by date, calendar, category, and tags, along with a sticky wall for quick notes. Users can also securely manage their accounts through Firebase Authentication.

The application also includes a Django Admin Dashboard for authorized administrators to manage application data through the backend administration interface.

## Demo
Frontend: https://task-management-app-2c66.onrender.com
Admin Dashboard: https://backend-task-management-app-b7pw.onrender.com/admin/

## Features

* **Upcoming Tasks:** CRUD tasks for **Today, Tomorrow, and This Week**, with filtering by **All, Active, and Done** status and customizable background colors.
* **Calendar:** CRUD tasks directly through the calendar.
* **Sticky Wall:** CRUD sticky notes for quick and flexible task organization.
* **Categories:** View and manage tasks by **Personal, Work, and Other** categories.
* **Tags:** CRUD task tags and organize tasks using tags.
* **Authentication:** Sign up, login, and logout using Firebase Authentication.
* **Admin Dashboard:** Access Django's built-in administration interface to manage registered application data according to administrator permissions.

## Technologies

### Frontend
* ReactJS
* JavaScript
* SCSS

### Backend
* Python
* Django
* Django REST Framework

### Database
* PostgreSQL
* Supabase

### Authentication
* Firebase Authentication

### Deployment
* Render

## Setup

### Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure Firebase Authentication and the backend API URL in the frontend environment variables.

Start the development server:

```bash
npm start
```

The frontend will run at the local URL provided by the development server.

### Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
```

**Windows:**

```bash
venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Configure the PostgreSQL database in Django `settings.py`.

Run migrations:

```bash
python manage.py migrate
```

Create a Django administrator account:

```bash
python manage.py createsuperuser
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend will run at:

```text
http://127.0.0.1:8000/
```

After starting the Django development server, open:

```bash
http://127.0.0.1:8000/admin/
```
