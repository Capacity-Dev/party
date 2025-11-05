

### “Party Invite Generator” React App

> Help me build a **simple web React app** for generating **party invites** in an **ID card format**.
>
> **App Requirements:**
>
> 1. **Configuration Page:**
>
>    * User uploads or selects a **background image** for the invite.
>    * User defines and adjusts (drag, resize) a **zone** on the image where the **QR code** will automatically appear.
>    * User can **create and name tables** (e.g., “Table 1”, “VIP Table”, etc.).
> 2. **Main Page:**
>
>    * User can **add a guest** (name and optional details like phone or email).
>    * User selects which **table** the guest belongs to.
>    * On submission, the app **generates an invite card** showing:
>
>      * Guest’s name
>      * Assigned table
>      * A **QR code** placed automatically in the defined zone on the chosen background image.
>    * The invite can be **exported as an image or PDF**.
> 3. **Guest List Page:**
>
>    * Displays all **added guests** with their **assigned tables**.
>    * Allows viewing or regenerating invites for any guest.
>    * Allows **exporting all guest data as a CSV file** (name, table, and QR code data).
>
> **Technical Requirements:**
>
> * Use **React + Tailwind CSS** for a clean, responsive UI.
> * Use **React Router** for navigation (Config / Main / Guest List).
> * Store configurations and guest data in **LocalStorage** (no backend needed).
> * Use a **QR code generator library** such as `qrcode.react`.
> * Implement **CSV export** (e.g., using `papaparse` or a simple Blob-based download).
> * Code should be **modular**, with components like:
>
>   * `ConfigPage`
>   * `MainPage`
>   * `GuestListPage`
>   * `InviteCard`
>   * `QrZoneEditor` (for positioning QR zone)


