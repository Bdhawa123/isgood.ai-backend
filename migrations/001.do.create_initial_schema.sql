-- Create Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ORGANIZATION_OWNER', 'PROJECT_OWNER', 'PROJECT_MANAGER', 'COLLABORATOR', 'GUEST_VIEW', 'USER');

-- CreateTable
CREATE TABLE "user" (
    "userId" uuid DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("userId")
);


-- CreateTable
CREATE TABLE "org" (
    "orgId" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "planStatus" TEXT NOT NULL,

    PRIMARY KEY ("orgId")
);

-- CreateTable
CREATE TABLE "project" (
    "projectId" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "projecimpacts" TEXT NOT NULL,
    "projectoutcomes" TEXT NOT NULL,
    "projectindicators" TEXT NOT NULL,
    "orgId" INTEGER,

    PRIMARY KEY ("projectId"),
    FOREIGN KEY ("orgId") REFERENCES "org"("orgId") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "orgUser" (
    "orgUserId" SERIAL NOT NULL,
    "orgId" INTEGER NOT NULL,
    "userId" UUID,
    "role" "Role" NOT NULL DEFAULT E'ORGANIZATION_OWNER',
    "invitationToken" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("orgUserId"),
    FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE,
    FOREIGN KEY ("orgId") REFERENCES "org"("orgId") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "projectUser" (
    "projectUserId" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'GUEST_VIEW',
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("projectUserId"),
    FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE,
    FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "beneficiary" (
    "beneficiaryId" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "projectId" INTEGER,

    PRIMARY KEY ("beneficiaryId"),
    FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "demographic" (
    "demographicId" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "beneficiaryId" INTEGER,

    PRIMARY KEY ("demographicId"),
    FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiary"("beneficiaryId") ON DELETE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user.email_unique" ON "user"("email");

-- ALTER TABLE "user"
-- ADD COLUMN "updated_at" 
--     TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
--     ON UPDATE CURRENT_TIMESTAMP;