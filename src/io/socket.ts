import * as socketIo from 'socket.io';
import { server } from '../app';
export const io = socketIo(server);
process.setMaxListeners(0);