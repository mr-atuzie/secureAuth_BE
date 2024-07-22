## Table of Contents
- Introduction
- Features
- Technologies Used.
- Installation
- Environment Variables
- Usage
- Contributing
- Author

## Secure Auth - 2FA with email - Server sider
is a authentication platform designed to implement Two-Factor Authentication (2FA) using email.It provides a authentication mechanism that enhances security by requiring users to verify their identity through a code sent to their email and also Password Management system for Forget and Reset Password.

## Features
- User registration and login with JWT-based authentication and HTTPS cookies
- Password hashing and salting
- 2FA using a time-based one-time password (OTP) sent to user email
- Password management system for Forgot and reset password

## Technologies Used
### Backend
- Node js
- Express js

### Database
- MongoDB

### Libaries
- Nodemailer
- Bcyrptjs
- Jsonwebtoken (JWT)
  
## Installation
### Prerequisites
- Node.js and npm installed

From your command line, first clone SecureAuth:
### 
```bash
# Clone this repository
$ git clone https://github.com/mr-atuzie/secureAuth_BE

# Go into the repository
$ cd secureAuth_BE

# Install dependencies
$ npm install
```

### Set up environment variables:
```bash
PORT=7000
DB=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_HOST=your_email_service
EMAIL_PASS=your_email_user
EMAIL_USER=your_email_password
FRONTEND_URL=your_frontend_url
```

### Start the development servers
```bash
$ npm run start
$ npm run dev
```
## Usage
### API Endpoints:
Here are some of the key API endpoints available,to test your API endpoints, you can use Postman. 

**User Endpoints:**
```bash
POST /api/users/register: Register a new user.
POST /api/users/login: Log in a user and obtain a JWT token.
POST /api/users/verify-email: verify OTP sent to user email.
POST /api/users/forgot-password: verify OTP sent to user email.
POST /api/users/rest-password: verify OTP sent to user email.
GET /api/users/: Retrieve user profile data (authentication required).
```
## Related Repositories
Frontend Repository: [https://github.com/mr-atuzie/secureAuth_FE](https://github.com/mr-atuzie/secureAuth_FE)

## Demo
[https://2fa-form.netlify.app](https://2fa-form.netlify.app)

## Contributions
Steps to Contribute
### 1-Fork the repository
Click on the "Fork" button at the top right of the repository page to create a copy of this repository under your own GitHub account.

### 2-Clone your forked repository
```bash
$ git clone https://github.com/yourusername/react-2fa-frontend.git
$ cd secureAuth_FE
```
### 3-Create a new branch:
```bash
$ git checkout -b feature/your-feature-name
```
### 4-Make your changes
Make the necessary changes or additions to the codebase.

### 5-Commit your changes
```bash
$ git add .
$ git commit -m "Add feature: description of the feature"
```
### 6-Push your changes to your forked repository
```bash
$git push origin feature/your-feature-name
```

### 7-Create a pull request
- Go to the original repository on GitHub and you should see a prompt to create a pull request from your new branch. Follow the instructions to open a pull request.
- Ensure your pull request description clearly explains the changes and why they are necessary.

### 8-Review process
- Your pull request will be reviewed by the project maintainers. You might be asked to make some changes before it gets merged.

## Author 👨‍💻
- **Rex Atuzie** - **[Linkedin](www.linkedin.com/in/rex-atuzie-0ab67820)**, **[Twitter](https://twitter.com/AtuzieR)**, **[Github](https://github.com/mr-atuzie)**, **[Portfolio](https://rexatuzie.netlify.app)**  


