# GitHub CRM

A simple project management system (CRM) for public GitHub projects.

## Note for reviewer:

- I deployed the app to my vps, and you can access and test it here: http://161.97.130.21:5173/register so you don't have
to spin up anything locally. (And tbh because I had small issue with running BE with docker and considered it faster to do it this way)
- The UI is still far from perfect, but as I see from requirements it's not a priority, and we can never get enough of perfection :)
- the logger is a simple implementation, for prod I would use some 3-rd party and more reliable solution.
- we store the revoked token in the db, so I would set up a cron job to clean it up as well

*All the following instructions are for spinning up the app locally, which you hopefully don't need to do*

## Docker Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Environment Setup

The Docker Compose configuration already includes the necessary environment variables for a development setup. However, you can customize these settings if needed.

## If smth goes wrong, don't waste your time with docker and try to run the app locally. (but you can try to restart the container)

1. make sure to have .env for client and server (check below, or rename the .env.example to .env)
2. run only the db in the docker
3. client:

   - run `cd client && yarn`
   - run `cd client && yarn dev`

4. server:
   - run `cd server && npm install`
   - run `npx prisma generate`
   - run `npx prisma migrate dev --name init`
   - run `npm run dev`
5. Enjoy!

#### Environment Variables

**For the Client (Frontend)**

```
VITE_API_URL=http://localhost:3000/api
```

**For the Server (Backend)**

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgres@db:5432/github_crm
JWT_SECRET=your_jwt_secret_change_this_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_change_this_in_production
GITHUB_API_URL=https://api.github.com
```

#### Customizing Environment Variables

You can customize environment variables in two ways:

1. **Directly in docker-compose.yml**:

   ```yaml
   services:
     client:
       environment:
         - VITE_API_URL=http://your-custom-server:3000/api

     server:
       environment:
         - JWT_SECRET=your_custom_secret
   ```

2. **Using .env file**:
   Create a `.env` file in the root directory:
   ```
   JWT_SECRET=your_custom_secret
   ```
   Docker Compose will automatically load variables from this file.

### Running the Application

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd github-crm
   ```

2. Start all services with Docker Compose:

   ```bash
   docker-compose up
   ```

   To run in detached mode (background):

   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

### Service Architecture

The application consists of three services:

- **client**: React frontend running on port 5173
- **server**: Node.js/Express backend running on port 3000
- **db**: PostgreSQL database running on port 5432

### Stopping the Application

To stop all services:

```bash
docker-compose down
```

To stop and remove volumes (will delete all data):

```bash
docker-compose down -v
```

### Troubleshooting

#### Viewing Logs

View logs for all services:

```bash
docker-compose logs
```

View logs for a specific service:

```bash
docker-compose logs client
docker-compose logs server
docker-compose logs db
```

Follow logs in real-time:

```bash
docker-compose logs -f
```

#### Environment Issues

- **Missing Environment Variables**: If you see errors related to missing environment variables, check that all required variables are set in docker-compose.yml or .env file.
- **Connection Errors**: If the frontend can't connect to the backend, check that `VITE_API_URL` is set correctly. In Docker, services can reference each other by their service name (e.g., `http://server:3000/api`).
- **JWT Errors**: If authentication fails, ensure `JWT_SECRET` is properly set and consistent.

#### Rebuilding Containers

If you make changes to the Dockerfile, dependencies, or environment variables, rebuild the containers:

```bash
docker-compose up --build
```

#### Database Connection Issues

If the server can't connect to the database, ensure the database container is healthy:

```bash
docker-compose ps
```

The db service should show as "healthy" in the status.

#### Common Issues

- **Port conflicts**: Make sure ports 5173, 3000, and 5432 are available on your host
- **Permission issues**: Make sure you have permission to bind mounts if volumes are used
- **Dependency issues**: If new dependencies are added, rebuild using `docker-compose up --build`
- **Environment variables**: Ensure environment variables are properly set, especially for production builds

### Updating the Application

When you pull new changes:

```bash
git pull
docker-compose down
docker-compose up --build
```

This ensures all containers are rebuilt with the latest code and dependencies.
