import express from 'express'
import type { Request, Response } from 'express'

const app = express()
const port = 3000

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!')
})

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Service is running"
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})