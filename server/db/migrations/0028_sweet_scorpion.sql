CREATE INDEX "ncbi_accession_idx" ON "genes" USING btree ("ncbi_accession");--> statement-breakpoint
CREATE INDEX "symbol_idx" ON "genes" USING btree ("symbol");