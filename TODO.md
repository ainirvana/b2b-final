# Gallery Integration Task

## Overview
Add the gallery option (already available in customized package builder) to the three other itinerary builder formats:
- Fixed Group Tours
- Cart/Combo
- HTML Editor

## Tasks
- [x] Add gallery to Fixed Group Tour Builder
- [ ] Add gallery to Cart/Combo Builder
- [ ] Add gallery to HTML Editor Builder

## Implementation Details
Each builder needs:
- Import GalleryUpload component and IGalleryItem type
- Add gallery state management
- Load gallery data when editing
- Add gallery section to UI
- Include gallery in save data

## Files to Edit
- components/fixed-group-tour-builder.tsx
- components/cart-combo-builder.tsx
- components/html-editor-builder.tsx
