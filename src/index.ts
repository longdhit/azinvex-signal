import './startDb';
import './io/socket'
import { server, app } from './app';
server.listen(process.env.PORT || 80, () => console.log(`Server started at ${server.address().port}`))