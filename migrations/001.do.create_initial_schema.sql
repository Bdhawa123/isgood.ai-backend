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


-- --Trigger updated Function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;




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
    "id" TEXT NOT NULL DEFAULT concat('or-', generate_uid(6)) UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "name" TEXT NOT NULL,
    "url" TEXT,
    "plan" TEXT NOT NULL,
    "plan_status" TEXT NOT NULL,
    "description" TEXT,
    "handle" TEXT,
    "region" TEXT,
    "sector" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    
    PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "org_logo" (
    "id" TEXT NOT NULL DEFAULT concat('ol-', generate_uid(6)) UNIQUE,
    "location" TEXT,
    "org_id" TEXT,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("org_id") REFERENCES "org"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "org_banner" (
    "id" TEXT NOT NULL DEFAULT concat('ob-', generate_uid(6)) UNIQUE,
    "location" TEXT,
    "org_id" TEXT,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("org_id") REFERENCES "org"("id") ON DELETE CASCADE
);


-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL DEFAULT concat('pr-', generate_uid(6)) UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "geolocation" TEXT ARRAY,
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "org_id" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,


    PRIMARY KEY ("id"),
    FOREIGN KEY ("org_id") REFERENCES "org"("id") ON DELETE CASCADE
);


-- CreateTable
CREATE TABLE "project_logo" (
    "id" TEXT NOT NULL DEFAULT concat('pl-', generate_uid(6)) UNIQUE,
    "location" TEXT,
    "project_id" TEXT,
    
    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "project_banner" (
    "id" TEXT NOT NULL DEFAULT concat('pb-', generate_uid(6)) UNIQUE,
    "location" TEXT,
    "project_id" TEXT,
    
    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "org_user" (
    "id" TEXT NOT NULL DEFAULT concat('ou-', generate_uid(6)) UNIQUE,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "invitation_token" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("org_id") REFERENCES "org"("id") ON DELETE CASCADE,
    FOREIGN KEY ("role_id") REFERENCES "roles"("id")
);

-- CreateTable
CREATE TABLE "project_user" (
    "id" TEXT NOT NULL DEFAULT concat('pu-', generate_uid(6)) UNIQUE,
    "project_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE,
    FOREIGN KEY ("role_id") REFERENCES "roles"("id")
);

-- CreateTable
CREATE TABLE "beneficiary" (
    "id" TEXT NOT NULL DEFAULT concat('bn-', generate_uid(6)) UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "name" TEXT NOT NULL,
    "project_id" TEXT,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "demographic" (
    "id" TEXT NOT NULL DEFAULT concat('dg-', generate_uid(6)) UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "beneficiary_id" TEXT,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiary"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "life_change" (
    "id" TEXT NOT NULL DEFAULT concat('lc-', generate_uid(6)) UNIQUE,
    "beneficiary_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiary"("id") ON DELETE CASCADE
);

CREATE TABLE "impact" (
    "id" TEXT NOT NULL DEFAULT concat('ip-', generate_uid(6)) UNIQUE,
    "description" TEXT NOT NULL,
    "project_id" TEXT,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE
);

CREATE TABLE "outcome" (
    "id" TEXT NOT NULL DEFAULT concat('oc-', generate_uid(6)) UNIQUE,
    "description" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE
);

CREATE TABLE "indicator" (
    "id" TEXT NOT NULL DEFAULT concat('in-', generate_uid(6)) UNIQUE,
    "project_id" TEXT NOT NULL,
    "indicator_id" TEXT NOT NULL,
    "aligned_strength" TEXT NOT NULL,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE
);

CREATE TABLE "indicator_current" (
    "id" TEXT NOT NULL DEFAULT concat('ic-', generate_uid(6)) UNIQUE,
    "project_id" TEXT NOT NULL,
    "up_to_date" BOOL NOT NULL DEFAULT false,

    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE
);

-- ----------------------------------- timestamp Triggers ------------------------------------ --

-- Trigger updated_at for project
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON project 
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Trigger updated_at for project
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON org 
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- ----------------------------- trigger update org.updated_at ------------------------- --

-- Trigger updated Function Project
CREATE OR REPLACE FUNCTION set_timestamp_org()
RETURNS TRIGGER AS $set_org_timestamp$
BEGIN

  UPDATE org o SET updated_at = NOW() WHERE o.id = OLD.org_id;
  RETURN NEW;
END;
$set_org_timestamp$ LANGUAGE plpgsql;


-- When impact is updated trigger updated_at for project
CREATE TRIGGER set_org_timestamp
AFTER INSERT OR UPDATE OR DELETE ON org_logo
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp_org();

-- ------------------------------ trigger update project.updated_at ------------------------- --

-- Trigger updated Function Project
CREATE OR REPLACE FUNCTION set_timestamp_project()
RETURNS TRIGGER AS $set_project_timestamp$
BEGIN
IF TG_OP = 'UPDATE' THEN
    UPDATE project p SET updated_at = NOW() WHERE p.id = OLD.project_id;
ELSIF TG_OP = 'DELETE' THEN
     UPDATE project p SET updated_at = NOW() WHERE p.id = OLD.project_id;
ELSE

  UPDATE project p SET updated_at = NOW() WHERE p.id = NEW.project_id;
END IF;
  RETURN NEW;
END;
$set_project_timestamp$ LANGUAGE plpgsql;


-- When impact is updated trigger updated_at for project
CREATE TRIGGER set_project_timestamp
AFTER INSERT OR UPDATE OR DELETE ON impact
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp_project();

-- When outcome is updated trigger updated_at for project
CREATE TRIGGER set_project_timestamp
AFTER INSERT OR UPDATE OR DELETE ON outcome
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp_project();

-- When project_logo is updated trigger updated_at for project
CREATE TRIGGER set_project_timestamp
AFTER INSERT OR UPDATE OR DELETE ON project_logo
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp_project();

-- When beneficiary is updated trigger updated_at for project
CREATE TRIGGER set_project_timestamp
AFTER INSERT OR UPDATE OR DELETE ON beneficiary
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp_project();




-- ------------------------------ trigger update beneficiary.updated_at ------------------------- --



-- Trigger updated Function Project
CREATE OR REPLACE FUNCTION set_timestamp_beneficiary()
RETURNS TRIGGER AS $set_beneficiary_timestamp$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    UPDATE beneficiary b SET updated_at = NOW() WHERE b.id = OLD.beneficiary_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE beneficiary b SET updated_at = NOW() WHERE b.id = OLD.beneficiary_id;
  ELSE
    UPDATE beneficiary b SET updated_at = NOW() WHERE b.id = NEW.beneficiary_id;

END IF;

  RETURN NEW;
END;
$set_beneficiary_timestamp$ LANGUAGE plpgsql;


-- When life_change is updated trigger updated_at for beneficiary
CREATE TRIGGER set_beneficiary_timestamp
AFTER INSERT OR UPDATE OR DELETE ON life_change
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp_beneficiary();

-- When demographic is updated trigger updated_at for beneficiary
CREATE TRIGGER set_beneficiary_timestamp
AFTER INSERT OR UPDATE OR DELETE ON demographic
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp_beneficiary();



-- --------------------- trigger update indicator_current to FALSE------------------- --

-- When the updated_at field for project updates this function updates the indicator_current status to false
CREATE OR REPLACE FUNCTION trigger_indicator_false()
RETURNS TRIGGER AS $indicator_false$
BEGIN
  UPDATE indicator_current i SET up_to_date = false WHERE i.project_id = NEW.id;
  RETURN NEW;
END;
$indicator_false$ LANGUAGE plpgsql;

-- When project is updated trigger indicator_current false
CREATE TRIGGER indicator_false
BEFORE UPDATE ON project
FOR EACH ROW
EXECUTE PROCEDURE trigger_indicator_false();



-- --------------------- trigger update indicator_current to TRUE ------------------- --

-- When the this function updates the indicator_current status to true
CREATE OR REPLACE FUNCTION set_indicator_current_project_true()
RETURNS TRIGGER AS $set_indicator_true$
BEGIN

UPDATE indicator_current i SET up_to_date = true WHERE i.project_id = NEW.project_id;
  RETURN NEW;
END;
$set_indicator_true$ LANGUAGE plpgsql;

-- When outcome is updated trigger indicator_current for project
CREATE TRIGGER set_indicator_true
AFTER INSERT ON indicator
FOR EACH ROW
EXECUTE PROCEDURE set_indicator_current_project_true();
