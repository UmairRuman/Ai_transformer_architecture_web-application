import './globals.css'

export const metadata = {
  title: 'TransformerDryRun.ai - Interactive Transformer Visualization',
  description: 'Learn how Transformers work with beautiful, step-by-step animations of every mathematical operation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}