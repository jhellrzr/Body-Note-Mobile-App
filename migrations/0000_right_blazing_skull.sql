CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"injury_id" integer,
	"date" date NOT NULL,
	"steps" integer,
	"activity" varchar(255),
	"pain_level" real,
	"symptoms" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" varchar(255) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" json DEFAULT '{}'::json,
	"session_id" varchar(64),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "email_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"date_subscribed" timestamp DEFAULT now() NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_token" varchar(64),
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "exercise_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"injury_id" integer,
	"exercise_id" integer,
	"date" date NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"actual_sets" integer,
	"actual_reps" integer,
	"actual_duration" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sets" integer,
	"reps" integer,
	"duration" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "injuries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"location" varchar(100) NOT NULL,
	"start_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pain_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"pain_markers" json NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_injury_id_injuries_id_fk" FOREIGN KEY ("injury_id") REFERENCES "public"."injuries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_injury_id_injuries_id_fk" FOREIGN KEY ("injury_id") REFERENCES "public"."injuries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_category_id_exercise_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."exercise_categories"("id") ON DELETE no action ON UPDATE no action;