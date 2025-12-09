-- Create a sample table for disaster reports
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOMETRY(Point, 4326), -- PostGIS ready if extension enabled, else just use lat/long columns
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    victims INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy data
INSERT INTO reports (title, description, latitude, longitude, victims) 
VALUES ('Flood in Jakarta', 'Severe flooding in downtown area', -6.200000, 106.816666, 120);
