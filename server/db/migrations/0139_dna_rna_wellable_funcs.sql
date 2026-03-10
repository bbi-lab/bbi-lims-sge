CREATE OR REPLACE TRIGGER dna_wellables_insert
BEFORE INSERT ON dna
FOR EACH ROW
EXECUTE FUNCTION wellables_insert();--> statement-breakpoint

CREATE OR REPLACE TRIGGER dna_wellables_delete
BEFORE DELETE ON dna
FOR EACH ROW
EXECUTE FUNCTION wellables_delete();--> statement-breakpoint

CREATE OR REPLACE TRIGGER rna_wellables_insert
BEFORE INSERT ON rna
FOR EACH ROW
EXECUTE FUNCTION wellables_insert();--> statement-breakpoint

CREATE OR REPLACE TRIGGER rna_wellables_delete
BEFORE DELETE ON rna
FOR EACH ROW
EXECUTE FUNCTION wellables_delete();--> statement-breakpoint
