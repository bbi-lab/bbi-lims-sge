ALTER TABLE "ensembl_refseq_ids" ALTER COLUMN "mane_select_ensembl_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ensembl_refseq_ids" ALTER COLUMN "mane_select_refseq_acc" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ensembl_refseq_ids" ADD CONSTRAINT "ensembl_refseq_ids_mane_select_ensembl_id_unique" UNIQUE("mane_select_ensembl_id");--> statement-breakpoint
ALTER TABLE "ensembl_refseq_ids" ADD CONSTRAINT "ensembl_refseq_ids_mane_select_refseq_acc_unique" UNIQUE("mane_select_refseq_acc");