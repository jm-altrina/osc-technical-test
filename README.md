# GraphQL API Project

This project is a backend GraphQL API developed using Node.js, TypeScript, Prisma ORM, and PostgreSQL. It supports user management, course management, and robust JWT-based authentication and authorization.

---

## Demo
The deployed application is available at:
https://graphql-api-zs7pm.ondigitalocean.app

### Testing Credentials
For the live demo, use the following credentials to test the app:

Admin User:
```plaintext
Username: admin
Password: adminpassword
```

Regular User:
```plaintext
Username: user1
Password: password1
```
Access the login endpoint to obtain a token:
```plaintext
POST /login
```

## **Getting Started**

### **Prerequisites**
Ensure you have the following installed:
- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

## **Setup**

### 1. **Clone the Repository**
```bash
git clone https://github.com/jm-altrina/osc-technical-test
cd osc-technical-test
```

### 2. **Environment Variables**
Rename the provided .env-example file to .env or create a new .env file in the project root.
Configure the following environment variables in the .env file:
```plaintext
NODE_ENV=
PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_HOST=
DB_PORT=
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=
```

### 3. **Start PostgreSQL Using Docker**
Run the following command to start a PostgreSQL container:
```bash
docker-compose up -d
```

### 4. **Run Prisma Migrations**
To set up the database schema:
```bash
npm run migrate
```

### 5. **Seed the Database**
Populate the database with initial data:
```bash
npm run seed
```

### 6. **Install Dependencies**
```bash
npm install
```

### 7. **Start the Application**
```bash
npm run start
```
Your API will be available at [here](http://localhost:4000/graphql)

### 8. **Run Unit Tests**
```bash
npm run test
```

### 9. **Code Coverage**
```bash
npm run test:coverage
```

---

### Role-Based Actions
The API implements role-based access control (RBAC) to manage permissions. Each user is assigned a role (ADMIN, USER) that defines what actions they can perform.

#### Roles
1.	ADMIN
* Can manage users, courses, and collections.
* Has access to all system operations, including sensitive data.
* Example Actions:
	* Create, update, delete users.
	* Create, update, delete courses and collections.

2.	USER
* Can only access their own data.
* Limited permissions to query or interact with their assigned resources.
* Example Actions:
    * View their own courses.
    * Access public queries like health check or their course information.

#### Implementation Details
* Role is included in the JWT token issued during login.
* Authorization is enforced in resolvers and middleware based on the user’s role.
---

---

### API Endpoints
#### 1. /login
Method: POST
Request:
```JSON
{
  "username": "example_user",
  "password": "example_password"
}
```

Response:
```JSON
{
  "token": "jwt-token"
}
```

#### 2. /graphql
GraphQL Operations
Below are some examples of queries and mutations you can execute via the /graphql endpoint.

Queries:

Fetch All Courses:
```bash
query GetCourses($sortOrder: String, $limit: Int) {
  courses(sortOrder: $sortOrder, limit: $limit) {
    id
    title
    description
    duration
    outcome
  }
}
```

Example:
```bash
query {
  courses(sortOrder: "ASC", limit: 5) {
    id
    title
    description
    duration
    outcome
  }
}
```

Fetch a Collection with Courses:
```bash
query GetCollection($id: Int!) {
  collection(id: $id) {
    id
    name
    courses {
      id
      title
      description
      duration
      outcome
    }
  }
}
```

Mutations

Register a User:
```bash
mutation RegisterUser($data: RegisterInput!) {
  registerUser(data: $data) {
    id
    username
    role
  }
}
```
Variables:
```JSON
{
  "data": {
    "username": "new_user",
    "password": "password123",
    "role": "USER"
  }
}
```

Create a Course:
```bash
mutation AddCourse($data: AddCourseInput!) {
  addCourse(data: $data) {
    id
    title
    description
  }
}
```

#### 3. /health
Method: GET
This endpoint checks the health of the API.
Response:
```JSON
{
  "status": "OK",
  "timestamp": "2024-12-09T12:34:56.789Z",
  "uptime": 12345.678
}
```
---

---

## **Future Enhancements**

### **Planned Additions**
- **Centralize Role-Based Authorization**: Implement a centralized authorization layer to ensure maintainability and consistency across all resolvers.
- **DataLoader Integration**: Use DataLoader to optimize database calls and batch requests to reduce latency.
- **CSRF Protection**: Enhance security by adding middleware to protect against CSRF attacks.
- **Secured HTTP Headers**: Integrate Helmet to secure HTTP headers and mitigate vulnerabilities.
- **Improve Caching**: Replace in-memory caching with a distributed cache like Redis for scalability and reliability.
- **Unit Test Improvements**:
    * Include cache logic in unit tests for better test coverage.
    * Add implementation tests for complex business logic.
- **Load Testing**: Conduct load testing using tools like Artillery or k6 to assess the system’s performance under stress.

---