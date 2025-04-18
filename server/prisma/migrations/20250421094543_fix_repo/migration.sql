/*
  Warnings:

  - Made the column `owner_avatar_url` on table `github_projects` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "github_projects" ALTER COLUMN "owner_avatar_url" SET NOT NULL;
