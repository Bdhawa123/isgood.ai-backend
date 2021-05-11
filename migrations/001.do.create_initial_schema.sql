-- Create Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;


--UUID Function
CREATE OR REPLACE FUNCTION generate_uid(size INT) RETURNS TEXT AS $$
DECLARE
  characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  bytes BYTEA := gen_random_bytes(size);
  l INT := length(characters);
  i INT := 0;
  output TEXT := '';
BEGIN
  WHILE i < size LOOP
    output := output || substr(characters, get_byte(bytes, i) % l + 1, 1);
    i := i + 1;
  END LOOP;
  RETURN output;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ORGANIZATION_OWNER', 'PROJECT_OWNER', 'PROJECT_MANAGER', 'COLLABORATOR', 'GUEST_VIEW', 'USER');


-- CreateTable
CREATE TABLE "org" (
    "orgId" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL DEFAULT concat('or-', generate_uid(6)) UNIQUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "planStatus" TEXT NOT NULL,

    PRIMARY KEY ("orgId")
);

-- CreateTable
-- CREATE TABLE "user" (
--     "userId" uuid DEFAULT uuid_generate_v4(),
--     "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "firstName" VARCHAR(255) NOT NULL,
--     "lastName" VARCHAR(255) NOT NULL,
--     "email" VARCHAR(255) NOT NULL,
--     "password" VARCHAR(255) NOT NULL,
--     "status" BOOLEAN NOT NULL DEFAULT true,
--     "lastOrgId" INTEGER,

--     PRIMARY KEY ("userId"),
--     FOREIGN KEY ("lastOrgId") REFERENCES "org"("orgId") 
-- );

-- CreateTable
CREATE TABLE "project" (
    "projectId" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL DEFAULT concat('pr-', generate_uid(6)) UNIQUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "geolocation" TEXT,
    "startDate" TIMESTAMPTZ,
    "endDate" TIMESTAMPTZ,
    "orgId" INTEGER,

    PRIMARY KEY ("projectId"),
    FOREIGN KEY ("orgId") REFERENCES "org"("orgId") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "orgUser" (
    "orgUserId" SERIAL NOT NULL,
    "orgId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'ORGANIZATION_OWNER',
    "invitationToken" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("orgUserId"),
    FOREIGN KEY ("orgId") REFERENCES "org"("orgId") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "projectUser" (
    "projectUserId" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'PROJECT_OWNER',
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("projectUserId"),
    FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "beneficiary" (
    "beneficiaryId" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL DEFAULT concat('bn-', generate_uid(6)) UNIQUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "lifeChange" TEXT NOT NULL,
    "projectId" INTEGER,

    PRIMARY KEY ("beneficiaryId"),
    FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "demographic" (
    "demographicId" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL DEFAULT concat('dg-', generate_uid(6)) UNIQUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "beneficiaryId" INTEGER,

    PRIMARY KEY ("demographicId"),
    FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiary"("beneficiaryId") ON DELETE CASCADE
);

CREATE TABLE "impact" (
    "impactId" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "projectId" INTEGER,

    PRIMARY KEY ("impactId"),
    FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE CASCADE
);

CREATE TABLE "outcome" (
    "outcomeId" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    PRIMARY KEY ("outcomeId"),
    FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE CASCADE
);

CREATE TABLE "indicator" (
    "assetId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "alignedStrength" TEXT NOT NULL,

    PRIMARY KEY ("assetId" , "indicatorId"),
    FOREIGN KEY ("assetId") REFERENCES "project"("assetId") ON DELETE CASCADE
);

-- CreateIndex
-- CREATE UNIQUE INDEX "user.email_unique" ON "user"("email");

-- ALTER TABLE "user"
-- ADD COLUMN "updated_at" 
--     TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
--     ON UPDATE CURRENT_TIMESTAMP;