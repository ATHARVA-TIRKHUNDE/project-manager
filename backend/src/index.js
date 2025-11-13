import app from './app.js'
import dotenv from 'dotenv'

dotenv.config({
  path: '../.env',
})

const port = process.env.PORT

app.listen(port, () => {
  console.log(`App is listing on port http://localhost:${port}`)
})
