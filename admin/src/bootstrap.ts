const loadApp = async () => {
  try {
    await import('./main.tsx')
  } catch (error) {
    console.error('Failed to load the admin dashboard bundle.', error)
  }
}

void loadApp()
