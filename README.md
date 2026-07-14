# The Memory Box

A secure, beautiful, and private collection of your most cherished surprises and letters. Built with a premium, sleek glassmorphism UI to turn your memories into a beautiful digital experience.

---

## Features

- **Secure Authentication:** Sign up and log in securely. Your memories are completely private to your account.
- **Polaroid Memories:** Create memories by uploading up to 3 images at once. Images are elegantly displayed as dynamic polaroids.
- **Smart Image Cropping:** Built-in photo cropper ensures your images always look perfect before they are uploaded.
- **Premium Quote Cards:** Add descriptions to your memories that render as beautiful, frosted glass quote blocks.
- **Seamless Sharing:** Generate secure public links to share a single memory, or share your entire Memory Box with one click.
- **WhatsApp Integration:** Instantly send your beautiful memory links to your loved ones via WhatsApp directly from the app.
- **Glassmorphic UI:** A state-of-the-art interface featuring blurred backgrounds, subtle micro-animations, and a responsive design that looks stunning on any device.

---

## Tech Stack

- **Framework:** [Next.js 14/15](https://nextjs.org/) (React 19) with **TypeScript**
- **Backend & Database:** [Supabase](https://supabase.com/) (Auth, PostgreSQL Database, and Storage Buckets)
- **Styling:** Custom Vanilla CSS with a state-of-the-art Glassmorphism design system
- **Icons:** [Lucide React](https://lucide.dev/)
- **Image Editing:** [react-easy-crop](https://www.npmjs.com/package/react-easy-crop) for client-side image cropping and compression
- **Animation & Utilities:** [react-confetti](https://www.npmjs.com/package/react-confetti) for celebratory effects and [react-use](https://www.npmjs.com/package/react-use) for responsive hooks
- **Deployment:** Vercel (Recommended)

---

## App Guide

### 1. Creating an Account
- Navigate to the **Login** page and toggle to **Sign Up**.
- Enter your Full Name, Email, and a secure password.
- You will be immediately redirected to your private Dashboard.

### 2. Adding a Memory
- Click **"Add Memory"** on your dashboard.
- Enter a Title and a heartfelt Description.
- Upload up to 3 photos. Use the built-in cropping tool to frame them perfectly.
- Hit **"Save Memory"** to securely store it in your box.

### 3. Managing Memories
- **Edit:** Click the 3-dot menu on any memory card to quickly update the text or swap out the photos.
- **Delete:** Remove a memory permanently via the same 3-dot menu.
- **View:** Click on a memory card to view it in full size, complete with scattered polaroids and the premium quote block.

### 4. Sharing Memories
- **Share a Single Memory:** Click the 3-dot menu or the "Share" button inside a memory to open the Share Modal. From there, you can copy the secure link or click the WhatsApp icon to instantly message it to someone special.
- **Share the Entire Box:** Click **"Share All Memories"** at the top of your dashboard to generate a master link that displays your entire collection in a beautiful grid.

---

## Local Development Setup

To run this project locally, you will need a Supabase project.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vigneshvungarala/memory-box.git
   cd memory-box
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
