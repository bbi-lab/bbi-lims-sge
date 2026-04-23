-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE TRIGGER "clonal_has_wellables_insert"
BEFORE INSERT ON "clonal_has"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "clonal_has_wellables_delete"
BEFORE DELETE ON "clonal_has"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();
