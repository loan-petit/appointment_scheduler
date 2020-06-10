# Migration `20200608123455`

This migration has been generated by loan-petit at 6/8/2020, 12:34:55 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TYPE "Day" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

CREATE TABLE "public"."User" (
"address" text   ,"email" text  NOT NULL ,"firstName" text  NOT NULL ,"googleId" text   ,"id" SERIAL,"lastName" text  NOT NULL ,"minScheduleNotice" integer  NOT NULL DEFAULT 0,"password" text   ,"phone" text   ,"username" text  NOT NULL ,"websiteUrl" text   ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."OAuthToken" (
"accessToken" text  NOT NULL ,"id" SERIAL,"refreshToken" text   ,"userId" integer  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."AppointmentType" (
"description" text   ,"duration" integer  NOT NULL ,"generateClientSheet" boolean  NOT NULL DEFAULT false,"id" SERIAL,"name" text  NOT NULL ,"price" Decimal(65,30)   ,"userId" integer   ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."RecurrentAvailability" (
"day" "Day" NOT NULL ,"endTime" integer  NOT NULL ,"id" SERIAL,"startTime" integer  NOT NULL ,"userId" integer   ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."AvailabilityModifier" (
"end" timestamp(3)  NOT NULL ,"id" SERIAL,"isExclusive" boolean  NOT NULL ,"start" timestamp(3)  NOT NULL ,"userId" integer   ,
    PRIMARY KEY ("id"))

CREATE UNIQUE INDEX "User.email" ON "public"."User"("email")

CREATE UNIQUE INDEX "User.username" ON "public"."User"("username")

CREATE UNIQUE INDEX "User.googleId" ON "public"."User"("googleId")

CREATE UNIQUE INDEX "OAuthToken_userId" ON "public"."OAuthToken"("userId")

ALTER TABLE "public"."OAuthToken" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."AppointmentType" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE SET NULL  ON UPDATE CASCADE

ALTER TABLE "public"."RecurrentAvailability" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE SET NULL  ON UPDATE CASCADE

ALTER TABLE "public"."AvailabilityModifier" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE SET NULL  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200608123455
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,74 @@
+datasource db {
+  provider = "postgresql"
+  url      = env("POSTGRES_URL")
+  default  = true
+}
+
+generator client {
+  provider = "prisma-client-js"
+}
+
+model User {
+  id                      Int                     @default(autoincrement()) @id
+  email                   String                  @unique
+  username                String                  @unique
+  googleId                String?                 @unique
+  firstName               String
+  lastName                String
+  password                String?
+  websiteUrl              String?
+  phone                   String?
+  address                 String?
+  minScheduleNotice       Int                     @default(0)
+  oAuthToken              OAuthToken?
+  appointmentTypes        AppointmentType[]
+  recurrentAvailabilities RecurrentAvailability[]
+  availabilityModifiers   AvailabilityModifier[]
+}
+
+model OAuthToken {
+  id           Int     @default(autoincrement()) @id
+  accessToken  String
+  refreshToken String?
+  user         User    @relation(fields: [userId], references: [id])
+  userId       Int
+}
+
+model AppointmentType {
+  id                  Int     @default(autoincrement()) @id
+  name                String
+  description         String?
+  duration            Int
+  price               Float?
+  generateClientSheet Boolean @default(false)
+  user                User?   @relation(fields: [userId], references: [id])
+  userId              Int?
+}
+
+model RecurrentAvailability {
+  id        Int   @default(autoincrement()) @id
+  day       Day
+  startTime Int
+  endTime   Int
+  user      User? @relation(fields: [userId], references: [id])
+  userId    Int?
+}
+
+model AvailabilityModifier {
+  id          Int      @default(autoincrement()) @id
+  start       DateTime
+  end         DateTime
+  isExclusive Boolean
+  user        User?    @relation(fields: [userId], references: [id])
+  userId      Int?
+}
+
+enum Day {
+  SUNDAY
+  MONDAY
+  TUESDAY
+  WEDNESDAY
+  THURSDAY
+  FRIDAY
+  SATURDAY
+}
```

