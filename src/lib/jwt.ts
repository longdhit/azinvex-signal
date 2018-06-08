import { sign, verify } from 'jsonwebtoken'
const KEY = 'G8+Dem2LdDu^LjZ5';

export function createToken(obj): Promise<string> {
  return new Promise((resolve, reject) => {
    sign(obj, KEY, { expiresIn: '2y' }, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
}

export function verifyToken(token): Promise<any> {
  return new Promise((resolve, reject) => {
    verify(token, KEY, (err, obj) => {
      if (err) return reject(err);
      resolve(obj);
    });
  });
}
