import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';


export const sign = async (value: object, secret: string, options?: { algorithm: string }): Promise<string> => {
    return new Promise((resolve, reject) => {
        jwt.sign(value, secret, options as unknown as SignOptions, (err, result) => {
            if (err) {
                reject(err);
            }

            resolve(result);
        })
    });
}

export default { sign };