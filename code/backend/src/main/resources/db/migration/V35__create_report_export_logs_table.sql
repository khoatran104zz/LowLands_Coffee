CREATE TABLE report_export_logs (
    id BIGSERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    export_format VARCHAR(10) NOT NULL,
    filters TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(150)
);
