# TODO: Remove Client and Trip Details Section from Itinerary Builder

## Tasks
- [x] Edit `components/itinerary-builder/index.tsx`:
  - [x] Remove import of `ClientDetailsSection`
  - [x] Remove `DEFAULT_CLIENT_DETAILS` constant
  - [x] Remove `clientDetails` state
  - [x] Update `handleSave` to remove `clientDetails` from `itineraryData` and set `currency` to "USD"
  - [x] Update `handleCreateCopy` to remove `clientDetails` from `copyData`
  - [x] Remove `<ClientDetailsSection />` JSX component
- [x] Delete `components/itinerary-builder/client-details-section.tsx`
- [ ] Test itinerary builder functionality
- [ ] Verify saving and copying work without client details
