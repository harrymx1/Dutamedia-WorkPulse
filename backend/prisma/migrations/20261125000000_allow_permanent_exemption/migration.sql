-- DEC-022: Mengizinkan pengecualian permanen (tanpa tanggal berakhir) pada tabel bounded_exemptions
ALTER TABLE "bounded_exemptions" ALTER COLUMN "end_date" DROP NOT NULL;
