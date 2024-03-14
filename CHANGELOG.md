## [Unreleased]: 2024-03-14

### Change:

#### Api Endpoints:
- Rename `SuperAdmin` to `Manager` role
- Rename `Admin` to `Staff` role
- Remove `Mod` role
- `/order` endpoint change to `/orders`
- `/orders` only access with `User` role
- `/orders-mnt` only access with `staff` role
- `attributes`:
    + Create/Update/Delete attribute only access with `Staff` role
- `/carts` only access with `User` role
- `categories`:
    + Create/Update category only access with `Staff` role
- `/users`:
    + Now only access with `Manager` role
    + Exclude `/users/change-role` endpoint