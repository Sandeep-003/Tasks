# AWS Deployment Guide

This guide deploys the app with a production-ready but minimal AWS setup:

- Frontend: S3 + CloudFront
- Backend API: ECS Fargate (Docker)
- Database: Amazon RDS PostgreSQL
- Container Registry: Amazon ECR
- Secrets: AWS Systems Manager Parameter Store or AWS Secrets Manager
- Logs: CloudWatch Logs

## 1) Prerequisites

- AWS account with permissions for ECR, ECS, ALB, EC2 networking, RDS, S3, CloudFront, IAM, and CloudWatch
- AWS CLI configured (`aws configure`)
- Docker installed locally
- Domain name (optional but recommended)

## 2) Create networking

Create or reuse a VPC with:

- 2 public subnets (for ALB)
- 2 private subnets (for ECS tasks and RDS)
- Internet Gateway + NAT Gateway
- Security groups:

Security group recommendations:

- `alb-sg`: allow inbound `80/443` from internet
- `ecs-sg`: allow inbound `5000` only from `alb-sg`
- `rds-sg`: allow inbound `5432` only from `ecs-sg`

## 3) Provision PostgreSQL (RDS)

Create PostgreSQL instance and note endpoint/port/user/password/database.

Build `DATABASE_URL` in this format:

```text
postgres://<username>:<password>@<rds-endpoint>:5432/<database>
```

Apply DB schema:

```powershell
# Run this against your RDS database using your preferred SQL client
# File to execute:
server/schema.sql
```

## 4) Create ECR repository

```powershell
aws ecr create-repository --repository-name task-schedule-manager-api --region <REGION>
```

## 5) Build and push backend image

```powershell
cd server

docker build -t task-schedule-manager-api:latest .

aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com

docker tag task-schedule-manager-api:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/task-schedule-manager-api:latest

docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/task-schedule-manager-api:latest
```

## 6) Create ECS cluster, task, service

1. Create ECS cluster (Fargate).
2. Use task definition template from `deploy/aws/ecs-task-definition.template.json`.
3. Replace placeholders:
   - `<ACCOUNT_ID>`
   - `<REGION>`
   - `<your-cloudfront-domain>`
   - `DATABASE_URL`
   - `JWT_SECRET`
4. Register task definition.
5. Create ECS service in private subnets, attach ALB target group.

Container settings:

- Container port: `5000`
- Health endpoint: `/api/health`

Required env vars:

- `NODE_ENV=production`
- `PORT=5000`
- `CLIENT_URL=https://<your-cloudfront-domain>`
- `JWT_SECRET=<strong-secret>`
- `DATABASE_URL=<postgres-connection-string>`

## 7) Create ALB for API

- Listener: `80` (and `443` with ACM certificate for production)
- Target group protocol/port: HTTP/5000
- Health check path: `/api/health`

After ECS service is healthy, note API domain:

```text
https://<api-domain>
```

## 8) Deploy frontend to S3 + CloudFront

Build frontend with API URL:

```powershell
cd client
$env:VITE_API_URL="https://<api-domain>/api"
npm install
npm run build
```

Create S3 bucket for static site assets and upload `client/dist` files.

Example upload:

```powershell
aws s3 sync dist s3://<frontend-bucket-name> --delete
```

Create CloudFront distribution with S3 as origin.

SPA settings in CloudFront:

- Default root object: `index.html`
- Custom error response: `404 -> /index.html` with response code `200`

## 9) Update backend CORS origin

Set backend `CLIENT_URL` to your CloudFront frontend URL exactly:

```text
https://<your-cloudfront-domain>
```

Redeploy ECS service after env var update.

## 10) HTTPS and cookies checklist

- Frontend uses HTTPS
- API uses HTTPS
- `NODE_ENV=production`
- Cookie auth works with `sameSite=none` + `secure=true`
- Browser can send credentials from frontend to API

## 11) Verify deployment

Health check:

```powershell
Invoke-RestMethod -Uri "https://<api-domain>/api/health" -Method Get
```

Manual checks:

- Register/login/logout
- Create/update/delete task
- Realtime updates in second browser tab
- Dashboard stats reflect real task data

## 12) Optional production hardening

- Put secrets in Secrets Manager/SSM (not plain task env)
- Add WAF on CloudFront/ALB
- Add Route53 custom domains + ACM certificates
- Enable automated backups for RDS
- Add ECS auto scaling based on CPU/memory
- Add CloudWatch alarms for 5xx and unhealthy targets

## Troubleshooting

- 401 on authenticated calls:
  - Ensure `CLIENT_URL` exactly matches frontend URL
  - Confirm both API and frontend are HTTPS
- CORS errors:
  - Verify ALB/API domain used in `VITE_API_URL`
  - Verify backend `CLIENT_URL`
- SPA route 404 on refresh:
  - Ensure CloudFront 404 fallback to `/index.html`
- DB connection errors:
  - Check `DATABASE_URL` and `rds-sg` inbound from `ecs-sg`
