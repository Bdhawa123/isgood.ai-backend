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
-- CREATE TYPE "Role" AS ENUM ('ADMIN', 'ORGANIZATION_OWNER', 'PROJECT_OWNER', 'PROJECT_MANAGER', 'COLLABORATOR', 'GUEST_VIEW', 'USER');

-- CreateTable 
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

INSERT INTO "roles" (name)
VALUES
('ADMIN'),
('ORGANIZATION_OWNER'),
('ORGANIZATION_MANAGER'),
('PROJECT_OWNER'),
('PROJECT_MANAGER'),
('COLLABORATOR'),
('GUEST_VIEW'),
('USER');




-- CreateTable
CREATE TABLE "org" (
    "id" SERIAL NOT NULL,
    "org_id" TEXT NOT NULL DEFAULT concat('or-', generate_uid(6)) UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "plan" TEXT NOT NULL,
    "plan_status" TEXT NOT NULL,
    "description" TEXT,
    "handle" TEXT,
    "region" TEXT,
    "sector" TEXT,
    
    
    PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "org_logo" (
    "id" TEXT NOT NULL DEFAULT concat('ol-', generate_uid(6)) UNIQUE,
    "location" TEXT,
    "org_id" TEXT,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("org_id") REFERENCES "org"("org_id") ON DELETE CASCADE
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
    "id" SERIAL NOT NULL,
    "project_id" TEXT NOT NULL DEFAULT concat('pr-', generate_uid(6)) UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "geolocation" TEXT ARRAY,
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "org_id" TEXT,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("org_id") REFERENCES "org"("org_id") ON DELETE CASCADE
);


-- CreateTable
CREATE TABLE "project_logo" (
    "id" TEXT NOT NULL DEFAULT concat('pl-', generate_uid(6)) UNIQUE,
    "location" TEXT,
    "project_id" TEXT,
    
    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "org_user" (
    "id" SERIAL NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "invitation_token" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("org_id") REFERENCES "org"("org_id") ON DELETE CASCADE,
    FOREIGN KEY ("role_id") REFERENCES "roles"("id")
);

-- CreateTable
CREATE TABLE "project_user" (
    "id" SERIAL NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE CASCADE,
    FOREIGN KEY ("role_id") REFERENCES "roles"("id")
);

-- CreateTable
CREATE TABLE "beneficiary" (
    "id" SERIAL NOT NULL,
    "beneficiary_id" TEXT NOT NULL DEFAULT concat('bn-', generate_uid(6)) UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "project_id" TEXT,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "demographic" (
    "id" SERIAL NOT NULL,
    "demographic_id" TEXT NOT NULL DEFAULT concat('dg-', generate_uid(6)) UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "beneficiary_id" TEXT,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiary"("beneficiary_id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "life_change" (
    "id" SERIAL NOT NULL,
    "life_change_id" TEXT NOT NULL DEFAULT concat('lc-', generate_uid(6)) UNIQUE,
    "beneficiary_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiary"("beneficiary_id") ON DELETE CASCADE
);

CREATE TABLE "impact" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "project_id" TEXT,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE CASCADE
);

CREATE TABLE "outcome" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE CASCADE
);

CREATE TABLE "indicator" (
    "id" TEXT NOT NULL DEFAULT concat('in-', generate_uid(6)) UNIQUE,
    "project_id" TEXT NOT NULL,
    "indicator_id" TEXT NOT NULL,
    "aligned_strength" TEXT NOT NULL,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE CASCADE
);

-- CreateIndex
-- CREATE UNIQUE INDEX "user.email_unique" ON "user"("email");

-- ALTER TABLE "user"
-- ADD COLUMN "updated_at" 
--     TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
--     ON UPDATE CURRENT_TIMESTAMP;