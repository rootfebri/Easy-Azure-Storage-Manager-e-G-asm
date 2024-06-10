## Major Tasks

- [ ] Customize view
- [x] Migrate from local storage to Tauri Plugin Store
- [ ] Create container Modal & functionality

## Minor Tasks

- [x] Hide Show clear button & remove select
  - [Home](src/routes/home.tsx)
  - [DataTable](src/components/table/DataTable.tsx)
- [x] Remove logoutRedirect for `Revoke Access` button
  - [Settings](src/routes/settings.tsx)

## Important Tasks

- [x] Customizeable (Tenant and Client) Microsoft Entra ID at Settings Page
  - [Settings](src/routes/settings.tsx)

## Models

- Resource Group Name
  - `name`
- Shared Access Signature (SAS)
  - `token`
  - `created_at`
  - `expired_at`
- Access Token
  - [x] `access_token`
  - [x] `created_at`
  - [x] `expired_on`
- Azure Entra ID
  - `client_id`
  - `tenant_id`
- Account?
  - (No details provided)