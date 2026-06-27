# Health Check Report

## Database
- Status: PASS for Sprint 2 Phase 2.
- Database name: `lowlands_coffee`.
- Migration status: PASS. Flyway is at version `8`.
- Tables checked: `store_users` exists; `staff_stores` no longer exists.
- Rename policy: no old migration was edited, no table was dropped, and no data was deleted.
- Phase 2 changes:
  - Added `V8__rename_staff_stores_to_store_users.sql`.
  - Renamed table `staff_stores` to `store_users`.
  - Renamed related PostgreSQL constraint/index names from `staff_stores` to `store_users` where present.
  - Updated ERD DBML and SQL docs to use `store_users`.

## Backend
- Build: PASS with `mvn clean install`.
- Run: PASS with `mvn spring-boot:run`.
- Swagger: PASS at `http://localhost:8080/swagger-ui/index.html`.
- Auth login: PASS with `POST /api/v1/auth/login`.
- Store staff management model: added `StoreUserEntity` and `StoreUserRepository` in the store module.

## Notes
- The historical `V6__create_staff_stores.sql` migration remains unchanged by design.
- No `StaffStoreEntity` was created.
