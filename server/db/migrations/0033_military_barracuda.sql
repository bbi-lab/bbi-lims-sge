ALTER TABLE "nucleic_acids" ADD COLUMN "dna_concentration" double precision;--> statement-breakpoint
ALTER TABLE "nucleic_acids" ADD COLUMN "dna_volume" double precision;--> statement-breakpoint
ALTER TABLE "nucleic_acids" ADD COLUMN "dna_yield" double precision;--> statement-breakpoint
ALTER TABLE "nucleic_acids" ADD COLUMN "rna_concentration" double precision;--> statement-breakpoint
ALTER TABLE "nucleic_acids" ADD COLUMN "rna_volume" double precision;--> statement-breakpoint
ALTER TABLE "nucleic_acids" ADD COLUMN "rna_yield" double precision;--> statement-breakpoint
ALTER TABLE "nucleic_acids" ADD COLUMN "protocol" varchar;--> statement-breakpoint
ALTER TABLE "pellets" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "pellets" DROP COLUMN "dna_concentration";--> statement-breakpoint
ALTER TABLE "pellets" DROP COLUMN "dna_volume";--> statement-breakpoint
ALTER TABLE "pellets" DROP COLUMN "dna_yield";--> statement-breakpoint
ALTER TABLE "pellets" DROP COLUMN "rna_concentration";--> statement-breakpoint
ALTER TABLE "pellets" DROP COLUMN "rna_volume";--> statement-breakpoint
ALTER TABLE "pellets" DROP COLUMN "rna_yield";--> statement-breakpoint
ALTER TABLE "pellets" DROP COLUMN "protocol";--> statement-breakpoint
ALTER TABLE "pellets" ADD CONSTRAINT "pellets_name_unique" UNIQUE("name");