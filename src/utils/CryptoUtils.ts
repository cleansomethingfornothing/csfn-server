import * as bcrypt from 'bcrypt'

export abstract class CryptoUtils {

  public static hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  public static comparePasswordWithHash(password: string,
                                        hash: string): Promise<void> {
    return bcrypt.compare(password, hash)
      .then((isValid) => isValid ? Promise.resolve() : Promise.reject())
  }

}
