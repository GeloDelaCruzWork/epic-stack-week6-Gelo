-- helper generated period range (if you prefer, create a separate column) 
-- Prisma can't declare range types; we do it via SQL.
ALTER TABLE catalog."ContractRate" ADD COLUMN IF NOT exists period tsrange generated always AS 
(
    tsrange
    (
        effective_from::timestamp, 
        effective_to::timestamp, '[)'
    )
) stored;

CREATE INDEX IF not EXISTS idx_contract_rate_period
ON catalog."ContractRate"
USING        
    gist
(
    company_id,
    location_id,
    position_id,
    shift_id,
    period
);

ALTER TABLE catalog."ContractRate" ADD CONSTRAINT no_overlap_contract_rate exclude
USING       
    gist
( 
    company_id WITH =, 
    location_id WITH =, 
    position_id WITH =, 
    shift_id WITH =, 
    period WITH
            && 
);