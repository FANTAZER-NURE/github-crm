-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessToken" TEXT,
    "refreshToken" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_projects" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "issues" INTEGER NOT NULL DEFAULT 0,
    "owner_avatar_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "github_projects_user_id_owner_name_key" ON "github_projects"("user_id", "owner", "name");

-- AddForeignKey
ALTER TABLE "github_projects" ADD CONSTRAINT "github_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
