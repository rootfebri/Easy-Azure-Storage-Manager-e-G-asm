## Major Tasks

- [ ] Customize view
- [ ] Migrate from local storage to SurrealDB
- [ ] Create container Modal & functionality

## Minor Tasks

- [ ] Hide Show clear button & remove select
  - [Home](src/routes/home.tsx)
  - [DataTable](src/components/table/DataTable.tsx)
- [ ] Remove logoutRedirect for `Revoke Access` button
  - [Settings](src/routes/settings.tsx)

## Important Tasks

- [ ] Customizeable (Tenant and Client) Microsoft Entra ID at Settings Page
  - [Settings](src/routes/settings.tsx)

## Database Model

- Resource Group Name
  - `name`
- Shared Access Signature (SAS)
  - `token`
  - `created_at`
  - `expired_at`
- Access Token
  - `access_token`
  - `created_at`
  - `expired_at`
- Azure Entra ID
  - `client_id`
  - `tenant_id`
- Account?
  - (No details provided)