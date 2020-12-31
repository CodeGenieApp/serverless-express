import app from '@server/app'

const port = 3000

app.listen(port)
// tslint:disable-next-line:no-console
console.log(`listening on http://localhost:${port}`)
