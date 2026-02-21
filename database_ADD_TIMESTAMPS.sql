-- Add missing timestamps for trip flow segments
ALTER TABLE fletes ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE fletes ADD COLUMN IF NOT EXISTS arrived_pickup_time TIMESTAMPTZ;
ALTER TABLE fletes ADD COLUMN IF NOT EXISTS arrived_dropoff_time TIMESTAMPTZ;

-- Comment to track what these are
COMMENT ON COLUMN fletes.accepted_at IS 'When the driver accepted the trip';
COMMENT ON COLUMN fletes.arrived_pickup_time IS 'When the driver reached the pickup point';
COMMENT ON COLUMN fletes.arrived_dropoff_time IS 'When the driver reached the destination';
