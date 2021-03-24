
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ORGANIZATION_OWNER', 'PROJECT_OWNER', 'PROJECT_MANAGER', 'COLLABORATOR', 'GUEST_VIEW', 'USER');

-- CreateTable
CREATE TABLE "user" (
    "userId" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("userId")
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
    "userId" INTEGER,
    "orgId" INTEGER,

    PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "org" (
    "orgId" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "planStatus" TEXT NOT NULL,
    "userId" INTEGER,

    PRIMARY KEY ("orgId")
);

-- CreateTable
CREATE TABLE "orgUser" (
    "orgUserId" SERIAL NOT NULL,
    "orgId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'ORGANIZATION_OWNER',
    "invitationToken" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("orgUserId")
);

-- CreateTable
CREATE TABLE "projectUser" (
    "projectUserId" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'GUEST_VIEW',
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("projectUserId")
);

-- CreateTable
CREATE TABLE "beneficiary" (
    "beneficiaryId" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "projectId" INTEGER,

    PRIMARY KEY ("beneficiaryId")
);

-- CreateTable
CREATE TABLE "demographic" (
    "demographicId" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "beneficiaryId" INTEGER,

    PRIMARY KEY ("demographicId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user.email_unique" ON "user"("email");

-- AddForeignKey
ALTER TABLE "projectUser" ADD FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectUser" ADD FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD FOREIGN KEY ("orgId") REFERENCES "org"("orgId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orgUser" ADD FOREIGN KEY ("orgId") REFERENCES "org"("orgId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orgUser" ADD FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary" ADD FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demographic" ADD FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiary"("beneficiaryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- ALTER TABLE "user"
-- ADD COLUMN "updated_at" 
--     TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
--     ON UPDATE CURRENT_TIMESTAMP;