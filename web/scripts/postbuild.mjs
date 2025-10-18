import { promises as fs } from 'fs'
import { join } from 'path'

async function run() {
  const dist = join(process.cwd(), 'dist')
  const index = join(dist, 'index.html')
  const fourOhFour = join(dist, '404.html')
  const nojekyll = join(dist, '.nojekyll')

  try {
    // Copy index.html -> 404.html for SPA routing on GitHub Pages
    await fs.copyFile(index, fourOhFour)
  } catch (err) {
    console.error('Failed to copy index.html to 404.html:', err)
    process.exitCode = 1
  }

  try {
    // Ensure .nojekyll exists to bypass Jekyll processing
    await fs.writeFile(nojekyll, '')
  } catch (err) {
    console.error('Failed to create .nojekyll:', err)
    process.exitCode = 1
  }
}

run()
