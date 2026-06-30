-- V5: Update default passwords to 'admin123'
UPDATE users 
SET password_hash = '$2b$10$THs/Fobt6yLnkw7NqcngeuXddNYU6ndAQGqJpN/9h59QmQ3mGLQgm'
WHERE username IN ('admin', 'staff');
