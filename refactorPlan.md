# Refactoring Plan: Mobile Responsiveness

This plan outlines the steps to refactor the Wall Planner application to be fully responsive and optimized for mobile devices, ensuring zero regressions for the current desktop experience.

## 1. Global Setup

- [x] **Verify Viewport Meta Tag**: Ensure `index.html` contains the correct viewport meta tag for responsive scaling.
    - *Action*: Check for `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />`. Note: `user-scalable=no` and `maximum-scale=1.0` are often recommended for app-like Canvas experiences to prevent accidental browser zooming while interacting with the canvas, though accessibility concerns should be weighed. For this app, preventing browser zoom is likely preferred in favor of the internal canvas zoom.

- [x] **Define Breakpoints**: Adopt Tailwind CSS default breakpoints.
    - `sm`: 640px
    - `md`: 768px (Primary breakpoint for switching from Mobile Stack/Drawer to Desktop Sidebar layout)
    - `lg`: 1024px

- [x] **Global CSS Adjustments**: 
    - *Action*: In `index.css`, ensure `html, body, #root` are `height: 100%` and `overflow: hidden` to prevent scroll bounce on mobile, delegating scrolling to specific containers.

## 2. Layout & Navigation Refactoring

### 2.1. App Layout State
- [x] **File**: `src/components/layout/AppLayout.tsx`
- [x] **Task**: Introduce state for sidebar visibility.
    - Add `const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false)`
    - Add `const [isRightSidebarOpen, setRightSidebarOpen] = useState(false)`
    - Pass these states and toggle functions to `Header`.

### 2.2. Responsive Sidebar (Left & Right)
- [x] **File**: `src/components/layout/AppLayout.tsx`
- [x] **Task**: Convert sidebars to "Drawers" on mobile.
    - **Current Desktop**: `<aside className="w-64 ...">`
    - **New Logic**: 
        - Apply `md:relative md:translate-x-0 md:block` to keep desktop behavior exactly as is.
        - On mobile (default), use `fixed inset-y-0 z-30 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out` logic.
        - Add logic to toggle class `translate-x-0` (open) vs `-translate-x-full` (closed) based on state for the Left sidebar.
        - Add logic to toggle class `translate-x-0` (open) vs `translate-x-full` (closed) for the Right sidebar (anchored `right-0`).
    - **Overlays**: Add a backdrop div `fixed inset-0 bg-black/50 z-20` that appears when either sidebar is open on mobile, clicking it closes the sidebars.

### 2.3. Header Updates
- [x] **File**: `src/components/layout/Header.tsx`
- [x] **Task**: Add toggle buttons for mobile.
    - Add a "Menu" button (Hamburger icon) on the far **left** (visible only on `md:hidden`) to toggle the Left Sidebar (Frame Library).
    - Add a "Properties" or "Settings" button on the **right** (visible only on `md:hidden`) to toggle the Right Sidebar (Properties).
    - Ensure the central zoom controls do not overflow. If space is tight, hide `100%` text or specific buttons on small screens (`hidden sm:block`).

## 3. Component Specifics

### 3.1. Frame Library
- [x] **File**: `src/components/sidebar/FrameLibrary.tsx`
- [x] **Task**: Ensure touch targets are large enough.
    - *Check*: The grid/list of frames. Ensure items have enough padding.
    - *Check*: "Add" button size.

### 3.2. Properties Editor includes ImageUploadInput
- [x] **File**: `src/components/sidebar/PropertiesEditor.tsx` & `src/components/ui/Input.tsx`
- [x] **Task**: Optimize inputs for touch.
    - Ensure `<input>` elements have `font-size: 16px` on mobile to prevent iOS Safari from auto-zooming when focused.
    - Verify numeric steppers are usable. Maybe increase padding on buttons/inputs slightly if `< 44px`.

### 3.3. Canvas Interaction
- [x] **File**: `src/components/canvas/WallCanvas.tsx`
- [x] **Task**: Verify touch gestures.
    - Since `@dnd-kit/core` `TouchSensor` is already configured in `App.tsx`, basic drag should work.
    - Verify `useZoomPan` works with touch (pinch to zoom) or at least doesn't break. If pinch-zoom isn't implemented, ensure the UI zoom buttons are easily accessible.

### 3.4. Modals (AddFrameModal)
- [x] **File**: `src/components/sidebar/AddFrameModal.tsx` (and `Modal` component if it exists, or inline).
- [x] **Task**: Responsive Size.
    - Ensure the modal width is `w-full max-w-lg mx-4` (with margin) on mobile, rather than a fixed pixel width.
    - Ensure the "Close" button is easily tappable.

## 4. Verification Plan

- [x] **Desktop Regression Test**:
    - Open app on desktop (width > 1024px).
    - Verify Left and Right sidebars are visible and static.
    - Verify Canvas takes remaining space (flex-1).
    - Verify Drag and Drop works.

- [x] **Mobile Simulation Test**:
    - Set viewport to 375px (iPhone SE).
    - Verify Sidebars are hidden by default.
    - Click Hamburger -> Left Sidebar slides in over canvas.
    - Click Overlay -> Left Sidebar closes.
    - Click Properties -> Right Sidebar slides in.
    - Verify Layout does not break horizontally.
    - Verify "New Project" and "Zoom" controls are accessible or gracefully degrade.
