# ProSport Club

## Overview

*ProSport Club* is a web application designed to streamline the management of small sports clubs. Built as part of a bachelor's thesis, this project provides a free, accessible, and tailored solution for small clubs in Romania, addressing their administrative and operational needs. With features like event scheduling, automated feedback summaries, fine and poll management, injury tracking, and more, *ProSport Club* offers an intuitive platform for clubs that can't afford commercial alternatives.

## Features

- **User Authentication**: Secure login with role-based access (admin, manager, staff, player) using JWT tokens.
- **Event Management**: Schedule and manage events with an interactive calendar (FullCalendar) and automated notifications.
- **Automated Feedback**: Generate player feedback summaries using OpenAI, with a top 3 performance ranking for managers and PDF export.
- **Fines and Polls**: Create fines with a payment workflow and polls with voting charts, accessible to specific roles.
- **Injury Tracking**: Track player injuries with recovery progress sliders and comments, available for physiotherapists and fitness coaches.
- **Announcements**: Display the latest 5 announcements on the "About Team" page, created by admins or managers.
- **Personal Journal**: Add personal notes, stored in localStorage for quick access.
- **Custom Settings**: Choose a color from a predefined palette, saved in localStorage for persistent customization.
- **Notifications**: Receive automated notifications for events, polls, feedback, and fines, with unread counts, filtering (unread/all), and a "mark all as read" option.
- **Admin Reset**: Reset specific data (events, feedback, etc.) for a new season, with monthly database backups.


## Technologies Used

- **Frontend**: React, FullCalendar, jsPDF
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI Integration**: OpenAI API for automated feedback summaries
- **Testing**: Jest, MongoMemoryServer
- **Deployment**: Netlify (frontend), Render (backend)
- **CI/CD**: GitHub Actions for automated testing
- **Monitoring**: UptimeRobot for availability monitoring

## Installation

To run *ProSport Club* locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/[your-username]/pro-sport-club.git
   cd pro-sport-club
   ```

2. **Install dependencies**:
   - For the frontend:
     ```bash
     cd frontend
     npm install
     ```
   - For the backend:
     ```bash
     cd ../backend
     npm install
     ```

3. **Set up environment variables**:
   - Create a `.env` file in the `backend` directory with the following variables:
     ```
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     OPENAI_API_KEY=your_openai_api_key
     ```

4. **Run the application**:
   - Start the backend:
     ```bash
     cd backend
     npm start
     ```
   - Start the frontend:
     ```bash
     cd frontend
     npm start
     ```

5. **Access the app**:
   - Open your browser and navigate to `http://localhost:3000` to view the frontend.
   - The backend API will be available at `http://localhost:5000` (or the port you configured).

## Contributing

Contributions are welcome! If you'd like to contribute to *ProSport Club*, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit them (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.