

# Helpdesk Dashboard

The Helpdesk Dashboard is a centralized ticket management system that connects directly to your email inbox, transforming incoming emails into organized support tickets.

Instead of juggling shared inboxes or forwarding emails between team members, this platform automatically gathers support emails into one unified dashboard. From there, teams can view, manage, assign, and respond to tickets collaboratively.

Every incoming email becomes a trackable support request, ensuring nothing gets lost and every conversation stays organized in one place.

Built with Django for the backend and React for the frontend, the system is designed to be reliable, intuitive, and scalable for teams of all sizes.

## Why This Project?

Many teams rely heavily on email for support, but shared inboxes quickly become messy and difficult to manage. Important messages get buried, responses overlap, and accountability becomes unclear.

The Helpdesk Dashboard solves this by:

- Converting support emails into structured tickets
- Centralizing all conversations in one dashboard
- Allowing teams to view and respond collaboratively
- Providing clear visibility into ticket status and ownership
- Preventing duplicate or missed responses

This ensures faster response times, better teamwork, and a more organized support workflow.

## Key Features

- **User Authentication & Profiles:** Secure login, registration, and personalized profiles.
- **Support Request Management:** Create, assign, update, and resolve support requests ("tickets") with ease.
- **Admin Dashboard:** Visualize analytics, monitor activity, and manage users.
- **Calendar Integration:** Schedule and view events related to support tasks.
- **Email Notifications:** Stay informed with automatic updates.
- **Responsive UI:** Works beautifully on desktop and mobile.
- **Internal & External Replies:** Communicate privately or publicly on support requests.
- **Customizable Filters:** Sort and search requests by status, priority, or assignee.

## Tech Stack

- **Backend:** Django, Neon (PostgreSQL)
- **Frontend:** React, CSS
- **API:** RESTful endpoints for seamless integration

## Project Structure

### Backend (`backend/`)

- Django project with modular apps:
  - `emails`: Handles all email notifications
  - `tickets`: Manages support requests and workflow
  - `users`: Authentication, registration, and user settings
- Database: Neon (cloud PostgreSQL, scalable and reliable)
- Media: Profile pictures and attachments stored in `/media/`

### Frontend (`frontend/`)

- React app with organized components:
  - Dashboard, Support Requests, Calendar, Admin, Login, Settings
- CSS modules for scoped styling
- API integration for real-time updates

## Getting Started

### Backend Setup

1. Open a terminal and navigate to `backend/`
2. Install Python dependencies:

 ```bash
 pip install -r requirements.txt
 ```

1. Configure your Neon database connection in `settings.py` (see below).
2. Run database migrations:

 ```bash
 python manage.py migrate
 ```

1. Start the Django server:

 ```bash
 python manage.py runserver
 ```

#### Neon Database Configuration

Update your `backend/backend/settings.py` to use your Neon PostgreSQL connection string:

```python
DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.postgresql',
    'NAME': '<your_neon_db_name>',
    'USER': '<your_neon_db_user>',
    'PASSWORD': '<your_neon_db_password>',
    'HOST': '<your_neon_db_host>',
    'PORT': '5432',
  }
}
```

Replace the placeholders with your actual Neon credentials.

### Frontend Setup

1. Open a terminal and navigate to `frontend/`
2. Install Node dependencies:

 ```bash
 npm install
 ```

1. Start the React development server:

 ```bash
 npm start
 ```

## How to Use

- Visit `http://localhost:3000` for the frontend UI.
- Backend API runs at `http://localhost:8000`.
- Register or log in to submit support requests.
- Support staff and admins can view, assign, and resolve requests, as well as access analytics and manage users from the dashboard.

## Contributing

We welcome contributions! To get started:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Submit a pull request

Please follow our code style and add tests where possible.

## License

This project is licensed under the MIT License. Feel free to use, modify, and share!

---

If you have questions or need help, open an issue or reach out. Happy coding!
