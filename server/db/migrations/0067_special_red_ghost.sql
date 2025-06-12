CREATE TABLE "pre_verified_users" (
	"email" text NOT NULL,
	CONSTRAINT "pre_verified_users_email_unique" UNIQUE("email")
);
